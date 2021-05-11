import { EventEmitter } from "tsee";
import { LinuxImpulseRunner, RunnerClassifyResponseSuccess } from "./linux-impulse-runner";
import sharp from 'sharp';
import { ICamera } from "../sensors/icamera";

export class ImageClassifier extends EventEmitter<{
    result: (result: RunnerClassifyResponseSuccess, timeMs: number, imgAsJpeg: Buffer) => void
}> {
    private _runner: LinuxImpulseRunner;
    private _camera: ICamera;
    private _stopped: boolean = true;
    private _runningInference = false;

    /**
     * Classifies realtime image data from a camera
     * @param runner An initialized impulse runner instance
     * @param camera An initialized ICamera instance
     */
    constructor(runner: LinuxImpulseRunner, camera: ICamera) {
        super();

        this._runner = runner;
        this._camera = camera;
    }

    /**
     * Start the image classifier
     */
    async start() {
        let model = this._runner.getModel();

        if (model.modelParameters.sensorType !== 'camera') {
            throw new Error('Sensor for this model was not camera, but ' +
                model.modelParameters.sensor);
        }

        this._stopped = false;

        this._camera.on('snapshot', async (data) => {
            // still running inferencing?
            if (this._runningInference) {
                return;
            }

            this._runningInference = true;

            try {
                // sharp already auto-crops!

                let values: number[] = [];
                let img;
                if (model.modelParameters.image_channel_count === 3) {
                    img = sharp(data).resize({
                        height: model.modelParameters.image_input_height,
                        width: model.modelParameters.image_input_width
                    });
                    let buffer = await img.raw().toBuffer();

                    for (let ix = 0; ix < buffer.length; ix += 3) {
                        let r = buffer[ix + 0];
                        let g = buffer[ix + 1];
                        let b = buffer[ix + 2];
                        // tslint:disable-next-line: no-bitwise
                        values.push((r << 16) + (g << 8) + b);
                    }
                }
                else {
                    img = sharp(data).resize({
                        height: model.modelParameters.image_input_height,
                        width: model.modelParameters.image_input_width
                    }).toColourspace('b-w');
                    let buffer = await img.raw().toBuffer();

                    for (let p of buffer) {
                        // tslint:disable-next-line: no-bitwise
                        values.push((p << 16) + (p << 8) + p);
                    }
                }

                let now = Date.now();

                if (this._stopped) {
                    return;
                }

                let classifyRes = await this._runner.classify(values);

                let timeSpent = Date.now() - now;

                this.emit('result', classifyRes,
                    classifyRes.timing.dsp + classifyRes.timing.classification + classifyRes.timing.anomaly,
                    await img.jpeg({ quality: 90 }).toBuffer());
            }
            finally {
                this._runningInference = false;
            }
        });
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
}
