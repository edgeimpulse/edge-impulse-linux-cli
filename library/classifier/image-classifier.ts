import { EventEmitter } from "tsee";
import {
    LinuxImpulseRunner,
    ModelInformation,
    RunnerClassifyResponseSuccess,
    RunnerHelloResponseModelParameters,
} from "./linux-impulse-runner";
import sharp, { FitEnum } from 'sharp';
import { ICamera } from "../sensors/icamera";
import * as models from "../../sdk/studio/sdk/model/models";

const PREFIX = '\x1b[35m[IMG]\x1b[0m';

// Map studio
export const FitMethodMap: { [key: string]: keyof FitEnum } = {
    'none': 'contain',
    'fit-shortest': 'cover',
    'fit-longest': 'contain',
    'squash': 'fill'
};

// Map Studio
export const FitMethodStudioMap: Record<
    Exclude<RunnerHelloResponseModelParameters["image_resize_mode"], undefined>,
    models.ImageInputResizeMode
> = {
  'none': 'crop',
  'fit-shortest': 'fit-short',
  'fit-longest': 'fit-long',
  'squash': 'squash',
};

export class ImageClassifier extends EventEmitter<{
    result: (result: RunnerClassifyResponseSuccess, timeMs: number, imgAsJpeg: Buffer) => void,
    profileSnapshotHandlerBegin: (filename: string) => void,
    profileSnapshotHandlerEnd: (filename: string) => void,
    profileFeaturesBegin: (filename: string) => void,
    profileFeaturesEnd: (filename: string) => void,
    profileClassifyBegin: (filename: string) => void,
    profileClassifyEnd: (filename: string, timingCpp: RunnerClassifyResponseSuccess['timing']) => void,
    profileEmitResultBegin: (filename: string) => void,
    profileEmitResultEnd: (filename: string) => void,
}> {
    private _runner: LinuxImpulseRunner;
    private _camera: ICamera;
    private _stopped: boolean = true;
    private _runningInference = false;
    private _model: ModelInformation;
    private _verbose: boolean;

    /**
     * Classifies realtime image data from a camera
     * @param runner An initialized impulse runner instance
     * @param camera An initialized ICamera instance
     */
    constructor(runner: LinuxImpulseRunner, camera: ICamera, opts?: {
        verbose?: boolean,
    }) {
        super();

        this._runner = runner;
        this._camera = camera;
        this._model = runner.getModel();
        this._verbose = opts?.verbose || false;
    }

    /**
     * Start the image classifier
     */
    async start() {
        if (this._model.modelParameters.sensorType !== 'camera') {
            throw new Error('Sensor for this model was not camera, but ' +
                this._model.modelParameters.sensor);
        }

        this._stopped = false;

        // if resize mode is 'none', we need to get the image size from the first snapshot
        if (this._model.modelParameters.image_resize_mode === 'none') {
            this._camera.once('snapshotForInference', async (ev) => {

            let imgSharpMetadata: sharp.Metadata | undefined;
                imgSharpMetadata = await sharp(ev.imageForInferenceJpg).metadata();

                this.setImageParameters({
                    image_width: imgSharpMetadata.width,
                    image_height: imgSharpMetadata.height,
                    image_channels: imgSharpMetadata.channels || 3,
                });
            });
        }

        // this._camera.on('snapshotForInference', async (data, filename) => {
        this._camera.on('snapshotForInference', async (ev) => {
            try {
                const filename = ev.filename;

                let model = this._model;
                if (this._stopped) {
                    return;
                }

                // still running inferencing?
                if (this._runningInference) {
                    return;
                }

                this.emit('profileSnapshotHandlerBegin', filename);

                this._runningInference = true;

                try {

                    if (ev.imageForInferenceRgb) {
                        const expectedBufferSize = model.modelParameters.image_input_width *
                            model.modelParameters.image_input_height * 3;
                        if (ev.imageForInferenceRgb.length !== expectedBufferSize) {
                            console.log(PREFIX, `Invalid size for imageForInferenceRgb, ` +
                                `expected=${expectedBufferSize}, received=${ev.imageForInferenceRgb.length}`);
                            ev.imageForInferenceRgb = undefined;
                        }
                    }

                    // If we get the data in RGB format -> great, guaranteed to be in the right w/h
                    // already.
                    if (ev.imageForInferenceRgb) {
                        this.emit('profileFeaturesBegin', filename);
                        const features = ImageClassifier.rgbBufferToFeatures(ev.imageForInferenceRgb);
                        this.emit('profileFeaturesEnd', filename);

                        this.emit('profileClassifyBegin', filename);

                        const { classifyRes, timingMs } = await this.classify(features);

                        this.emit('profileClassifyEnd', filename, classifyRes.timing);

                        // todo: what if grayscale image? imageForInferenceJpg is in RGB
                        this.emit('profileEmitResultBegin', filename);
                        this.emit('result', classifyRes,
                                timingMs,
                                ev.imageForInferenceJpg);
                        this.emit('profileEmitResultEnd', filename);
                    }
                    // received a JPG instead
                    else {
                        const data = ev.imageForInferenceJpg;

                        let imgSharpMetadata: sharp.Metadata | undefined;

                        // if we have single frame then resize now
                        if (model.modelParameters.image_input_frames > 1) {
                            throw new Error(`image_input_frames with a value other than 1 is not supported`);
                        }
                        this.emit('profileFeaturesBegin', filename);
                        imgSharpMetadata = await sharp(data).metadata();
                        if (model.modelParameters.image_resize_mode === 'none') {
                            model.modelParameters.image_input_width = imgSharpMetadata.width!;
                            model.modelParameters.image_input_height = imgSharpMetadata.height!;
                        }
                        let resized = await ImageClassifier.resizeImage(model, data, imgSharpMetadata);
                        this.emit('profileFeaturesEnd', filename);

                        if (this._stopped) {
                            return;
                        }

                        this.emit('profileClassifyBegin', filename);

                        const { classifyRes, timingMs } = await this.classify(resized.features);

                        this.emit('profileClassifyEnd', filename, classifyRes.timing);

                        this.emit('profileEmitResultBegin', filename);
                        if (model.modelParameters.image_input_frames === 1 &&
                            imgSharpMetadata &&
                            imgSharpMetadata.width === model.modelParameters.image_input_width &&
                            imgSharpMetadata.height === model.modelParameters.image_input_height &&
                            model.modelParameters.image_channel_count === 3 &&
                            filename.toLowerCase().endsWith('.jpg')
                        ) {
                            // data is already a JPG file in the right encoding, no need to re-encode
                            this.emit('result', classifyRes, timingMs, data);
                        }
                        else {
                            // data might have changed (e.g. w/h/channel), re-encode the new buffer
                            this.emit('result', classifyRes,
                                timingMs,
                                await resized.img.jpeg({ quality: 90 }).toBuffer());
                        }
                        this.emit('profileEmitResultEnd', filename);
                    }
                }
                finally {
                    this._runningInference = false;
                }
            }
            catch (ex2) {
                const ex = <Error>ex2;
                console.log(PREFIX, `Failed to handle snapshot "${ev.filename}":`, ex.message || ex.toString());
                if (this._verbose) {
                    console.log(PREFIX, ex);
                }
            }
        });
    }

    resume() {
        // reload the model info
        this._model = this._runner.getModel();
        this._stopped = false;
        // reset the inference flag (in case we were paused during inference)
        this._runningInference = false;
    }

    pause() {
        this._stopped = true;
    }

    /**
     * Stop the classifier
     */
    async stop() {
        this._stopped = true;

        await Promise.all([
            this._camera ? this._camera.stop() : Promise.resolve(),
            this._runner.stop()
        ]);
    }

    async setImageParameters(params: {
        image_width?: number,
        image_height?: number,
        image_channels?: number}) {

        await this._runner.setParameter(params);
        // reload the model info
        // this._model = this._runner.getModel();
    }

    getRunner() {
        return this._runner;
    }

    static async resizeImage(model: ModelInformation, data: Buffer, metadata?: sharp.Metadata) {
        metadata = metadata || await sharp(data).metadata();
        if (!metadata.width) {
            throw new Error('ImageClassifier.resize: cannot determine width of image');
        }
        if (!metadata.height) {
            throw new Error('ImageClassifier.resize: cannot determine height of image');
        }

        // resize image and add to frameQueue
        const fitMethod: keyof FitEnum = FitMethodMap[model.modelParameters.image_resize_mode || 'none'];
        let img = sharp(data);
        if (model.modelParameters.image_resize_mode !== 'none') {
            if (metadata.width !== model.modelParameters.image_input_width ||
                metadata.height !== model.modelParameters.image_input_height) {
                img = img.resize({
                    height: model.modelParameters.image_input_height,
                    width: model.modelParameters.image_input_width,
                    fit: fitMethod,
                    fastShrinkOnLoad: false
                });
            }
        }

        let features: number[] = [];
        if (model.modelParameters.image_channel_count === 3) {
            img = img.removeAlpha();
            let buffer = await img.raw().toBuffer();

            const numPixels = buffer.length / 3;
            features = new Array<number>(numPixels);
            for (let ix = 0, j = 0; ix < numPixels; ix++, j += 3) {
                // eslint-disable-next-line no-bitwise
                features[ix] = (buffer[j] << 16) | (buffer[j + 1] << 8) | buffer[j + 2];
            }
        }
        else {
            img = img.toColourspace('b-w');
            let buffer = await img.raw().toBuffer();

            features = new Array<number>(buffer.length);
            for (let ix = 0; ix < buffer.length; ix++) {
                const p = buffer[ix];
                // eslint-disable-next-line no-bitwise
                features[ix] = (p << 16) | (p << 8) | p;
            }
        }

        // await fs.promises.writeFile('debug.png', await img.png().toBuffer());
        // await fs.promises.writeFile('features.txt', features.map(x => '0x' + x.toString(16)).join(', '), 'utf-8');

        return {
            img: img,
            features: features,
            originalWidth: metadata.width,
            originalHeight: metadata.height,
            newWidth: model.modelParameters.image_input_width,
            newHeight: model.modelParameters.image_input_height,
        };
    }

    static rgbBufferToFeatures(data: Buffer) {
        const numPixels = data.length / 3;
        const features = new Array<number>(numPixels);
        for (let ix = 0, j = 0; ix < numPixels; ix++, j += 3) {
            // eslint-disable-next-line no-bitwise
            features[ix] = (data[j] << 16) | (data[j + 1] << 8) | data[j + 2];
        }
        return features;
    }

    private async classify(values: number[]): Promise<{
        classifyRes: RunnerClassifyResponseSuccess,
        timingMs: number,
    }> {
        if (process.env.EI_DONT_CLASSIFY === '1') { // useful to profile
            return {
                classifyRes: {
                    info: undefined,
                    result: { },
                    timing: { dsp: 0, classification: 0, anomaly: 0 },
                },
                timingMs: 0,
            };
        }

        const classifyRes = await this._runner.classify(values);

        let timingMs = classifyRes.timing.dsp + classifyRes.timing.classification +
            (classifyRes.timing.postprocessing || 0) +
            classifyRes.timing.anomaly;
        if (timingMs === 0) {
            timingMs = 1;
        }

        return {
            classifyRes,
            timingMs,
        };
    }
}
