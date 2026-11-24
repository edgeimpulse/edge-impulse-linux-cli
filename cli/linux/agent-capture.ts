import { AudioClassifier, MAX_AUDIO_CAPTURE_LENGTH_MS } from '../../library/classifier/audio-classifier';
import { ImageClassifier } from '../../library/classifier/image-classifier';
import { CaptureMetadata, CaptureRequest, Sensor } from '../../shared/device-protocol/application-contract';

/** Bytes and metadata produced by one command capture before agent input preparation. */
export type AgentCapturedInput = {
    buffer: Buffer;
    format: 'jpg' | 'wav';
    metadata: CaptureMetadata;
};

/** The single live classifier source currently available to capture commands. */
type AgentCaptureSource = {
    classifier: ImageClassifier;
    sensorName: string;
    type: 'camera';
} | {
    classifier: AudioClassifier;
    type: 'microphone';
};

/** Owns capture availability and routes commands to the active live sensor pipeline. */
export class AgentCaptureController {
    private _source: AgentCaptureSource | undefined;

    /** On camera startup, read one live frame so registration describes the source's actual resolution. */
    async useCamera(classifier: ImageClassifier): Promise<void> {
        const frame = await classifier.captureNextFrame();
        this._source = {
            type: 'camera',
            classifier,
            sensorName: `Camera (${frame.width}x${frame.height})`,
        };
    }

    /** On microphone startup, expose that live stream using the recorder's actual sample rate. */
    useMicrophone(classifier: AudioClassifier): void {
        this._source = {
            type: 'microphone',
            classifier,
        };
    }

    /** On unavailable or uncertain serving state, reject future captures because no source is canonical. */
    disable(): void {
        this._source = undefined;
    }

    /** Returns metadata derived exclusively from the live source used by capture commands. */
    sensors(): Sensor[] {
        const source = this._source;
        if (!source) return [];
        if (source.type === 'camera') {
            return [{
                name: source.sensorName,
                // A single JPEG has no sampling frequency.
                frequencies: [],
                // Match the Linux CLI's camera limit so Studio accepts its sampling duration for a single frame.
                maxSampleLengthS: 60000,
            }];
        }
        return [{
            name: 'Microphone',
            frequencies: [ source.classifier.sampleRateHz() ],
            maxSampleLengthS: MAX_AUDIO_CAPTURE_LENGTH_MS / 1000,
        }];
    }

    /**
     * Captures from the live classifier selected at startup, which also supplies registration metadata.
     * This is the canonical sensor: commands and registration share one source, rather than deriving
     * capture availability from model metadata. Rejects names that do not match that source.
     */
    async capture(request: CaptureRequest): Promise<AgentCapturedInput> {
        const source = this._source;
        if (!source) {
            throw new Error('Capture is unavailable because no live sensor is registered');
        }
        const sensorName = source.type === 'camera' ? source.sensorName : 'Microphone';
        if (request.sensor !== sensorName) {
            throw new Error(`Sensor "${request.sensor}" is not available; expected "${sensorName}"`);
        }

        if (source.type === 'camera') {
            if (request.lengthMs !== undefined) {
                throw new Error('Camera capture does not accept a recording length');
            }
            const frameCapture = await source.classifier.captureNextFrame();
            return {
                format: 'jpg',
                buffer: frameCapture.buffer,
                metadata: {
                    sensor: sensorName,
                    capturedAt: frameCapture.capturedAt,
                    width: frameCapture.width,
                    height: frameCapture.height,
                },
            };
        }

        if (request.lengthMs === undefined) {
            throw new Error('Microphone capture requires a recording length');
        }
        const audioCapture = await source.classifier.captureWindow(request.lengthMs);
        return {
            format: 'wav',
            buffer: audioCapture.buffer,
            metadata: {
                sensor: sensorName,
                capturedAt: audioCapture.capturedAt,
                durationMs: audioCapture.durationMs,
                sampleRateHz: audioCapture.sampleRateHz,
            },
        };
    }
}
