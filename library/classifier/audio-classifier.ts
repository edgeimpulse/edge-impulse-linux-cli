import { EventEmitter } from "tsee";
import { AudioInstance, AudioRecorder } from "../sensors/recorder";
import { LinuxImpulseRunner, ModelInformation, RunnerClassifyResponseSuccess } from "./linux-impulse-runner";

/** Streaming inference results and initial microphone diagnostics exposed to the runner. */
type AudioClassifierEvents = {
    result: (result: RunnerClassifyResponseSuccess, timeMs: number, audioBuffer: Buffer) => void
    noAudioError: () => void
};

/** Optional startup diagnostics applied while consuming microphone audio. */
export type AudioClassifierOptions = {
    rejectSilentFirstFrame?: boolean;
};

export class AudioClassifier extends EventEmitter<AudioClassifierEvents> {
    private _runner: LinuxImpulseRunner;
    private _recorder: AudioRecorder | undefined;
    private _audio: AudioInstance | undefined;
    private _stopped = true;
    private _verbose: boolean;
    private _rejectSilentFirstFrame: boolean;
    private _model: ModelInformation;
    /**
     * Classifies realtime audio data
     * @param runner An instance of the initialized impulse runner
     * @param verbose Whether to log debug info
     * @param options Optional startup diagnostics for the microphone stream
     */
    constructor(runner: LinuxImpulseRunner, verbose = false, options: AudioClassifierOptions = {}) {
        super();

        this._runner = runner;
        this._verbose = verbose;
        this._rejectSilentFirstFrame = options.rejectSilentFirstFrame ?? true;
        this._model = runner.getModel();
    }

    /**
     * Start the audio classifier
     * @param sliceLengthMs Slice length in milliseconds (runs inference every X ms.)
     *                      this is ignored if the model has a fixed slice_size
     *                      (true for all new models)
     */
    async start(device: string, sliceLengthMs: number = 250) {

        if (this._model.modelParameters.sensorType !== 'microphone') {
            throw new Error('Sensor for this model was not microphone, but ' +
                this._model.modelParameters.sensorType);
        }

        this._stopped = false;

        // TODO: respawn the recorder after model update???
        this._recorder = new AudioRecorder({
            // TODO: update frequency on model update
            sampleRate: this._model.modelParameters.frequency,
            channels: 1,
            asRaw: true,
            verbose: this._verbose
        });

        this._audio = await this._recorder.start(device);

        let fullFrameBuffer = Buffer.from([]);

        // TODO: update after model update
        const fullFrameBytes = this._model.modelParameters.input_features_count * 2;

        // TODO: update after model update
        let sliceBytes: number;
        if (this._model.modelParameters.slice_size) {
            sliceBytes = this._model.modelParameters.slice_size * 2;
        }
        else {
            sliceBytes = (sliceLengthMs / 1000) * this._model.modelParameters.frequency * 2;
        }

        let firstFrame = true;

        const onData = async (data: Buffer) => {
            try {
                let model = this._model;
                if (this._stopped) {
                    return;
                }

                fullFrameBuffer = Buffer.concat([ fullFrameBuffer, data ]);

                if (fullFrameBuffer.length >= fullFrameBytes) {
                    // one sec slice
                    let buffer = fullFrameBuffer.slice(fullFrameBuffer.length - fullFrameBytes);

                    let values: number[] = [];
                    for (let ix = 0; ix < buffer.length; ix += 2) {
                        values.push(buffer.readInt16LE(ix));
                    }

                    if (firstFrame && this._rejectSilentFirstFrame) {
                        let diff = Math.max(...new Set(values)) - Math.min(...new Set(values));
                        firstFrame = false;
                        if (diff < 20) {
                            this.emit('noAudioError');
                            if (this._audio) {
                                this._audio.ee.off('data', onData);
                            }
                            return;
                        }
                    }
                    firstFrame = false;

                    // console.log('data in', values);

                    // retain the last X ms (without the slice).
                    fullFrameBuffer = fullFrameBuffer.slice((fullFrameBuffer.length - (fullFrameBytes - sliceBytes)));

                    if (this._stopped) return;

                    let classifyRes;
                    if (model.modelParameters.use_continuous_mode && model.modelParameters.slice_size) {
                        classifyRes = await this._runner.classifyContinuous(
                            values.slice(values.length - model.modelParameters.slice_size));
                    }
                    else {
                        classifyRes = await this._runner.classify(values);
                    }
                    let timingMs = classifyRes.timing.dsp +
                        classifyRes.timing.classification +
                        (classifyRes.timing.postprocessing || 0) +
                        classifyRes.timing.anomaly;
                    if (timingMs === 0) {
                        timingMs = 1;
                    }

                    this.emit('result', classifyRes,
                        timingMs,
                        buffer);
                }
            }
            catch (ex2) {
                if (!this._stopped) {
                    const error = ex2 instanceof Error ? ex2 : new Error(String(ex2));
                    console.log('Failed to classify audio:', error.message);
                }
            }
        };

        this._audio.ee.on('data', onData);
    }

    resume() {
        // reload the model info
        this._model = this._runner.getModel();
        this._stopped = false;
    }

    pause() {
        this._stopped = true;
    }

    /**
     * Stop the audio classifier
     */
    async stop() {
        this._stopped = true;

        await Promise.all([
            this._audio ? this._audio.stop() : Promise.resolve(),
            this._runner.stop()
        ]);
    }

    getRunner() {
        return this._runner;
    }
}
