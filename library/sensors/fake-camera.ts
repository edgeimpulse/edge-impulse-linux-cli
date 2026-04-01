import fs from 'node:fs';
import { EventEmitter } from 'tsee';
import { ICamera, ICameraProfilingInfoEvent, ICameraSnapshotForInferenceEvent, ICameraStartOptions } from './icamera';

export class FakeCamera extends EventEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void,
    snapshotForInference: (ev: ICameraSnapshotForInferenceEvent) => void,
    error: (message: string) => void,
    profilingInfo: (ev: ICameraProfilingInfoEvent) => void,
}> implements ICamera {
    private _imagePath: string;
    private _image: Buffer | undefined;
    private _timeout: NodeJS.Timeout | undefined;
    private _lastOptions: ICameraStartOptions | undefined;

    /**
     * Instantiate the imagesnap backend (on macOS)
     */
    constructor(opts: {
        imagePath: string,
    }) {
        super();

        this._imagePath = opts.imagePath;
    }

    /**
     * Verify that all dependencies are installed
     */
    async init() {
        this._image = await fs.promises.readFile(this._imagePath);
    }

    /**
     * List all available cameras
     */
    async listDevices() {
        return [ `Fake camera` ];
    }

    /**
     * Start the capture process
     * @param options Specify the camera, and the required interval between snapshots
     */
    async start(options: ICameraStartOptions) {
        if (!this._image) {
            throw new Error(`Camera was not initialized`);
        }
        if (this._timeout) {
            clearInterval(this._timeout);
        }

        this._lastOptions = options;

        this._timeout = setInterval(() => {
            this.emit('snapshot', this._image!, `fake.jpg`);
            // snapshotForInference() sends out the resized image
            this.emit('snapshotForInference', {
                imageForInferenceJpg: this._image!,
                filename: 'fake.jpg',
                imageFromCameraJpg: this._image!,
                imageForInferenceRgb: undefined,
            });
        }, options.intervalMs === 0 ? 100 : options.intervalMs);
    }

    async stop() {
        if (this._timeout) {
            clearInterval(this._timeout);
        }
    }

    getLastOptions() {
        return this._lastOptions;
    }
}
