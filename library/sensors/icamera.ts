import { EventEmitter } from 'tsee';
import { RunnerHelloResponseModelParameters } from '../classifier/linux-impulse-runner-types';

export type ICameraInferenceDimensions = {
    width: number,
    height: number,
    resizeMode: RunnerHelloResponseModelParameters['image_resize_mode'],
};

export type ICameraStartOptions = {
    device: string,
    intervalMs: number,
    dimensions?: { width: number, height: number },
    inferenceDimensions?: ICameraInferenceDimensions,
};

export type ICameraProfilingInfoEvent = {
    type: 'event-without-filename',
    ts: Date,
    name: string,
    pts: string,
} | {
    type: 'frame_ready',
    ts: Date,
    pts: string,
    offset: number,
} | {
    type: 'event-with-filename',
    ts: Date,
    name: string,
    filename: string,
} | {
    type: 'pts-to-filename',
    pts: string,
    filename: string,
};

export type ICameraSnapshotForInferenceEvent = {
    /**
     * The image you should use for inference (as a JPG buffer). If you've set options.inferenceDimensions
     * when starting the camera stream, we aim to get this already in the resolution that you impulse uses.
     * This is not a guarantee though; so pass it through ImageClassifier.resizeImage to be sure
     * (will mostly be a no-op if the image is already in the right resolution).
     */
    imageForInferenceJpg: Buffer,
    /**
     * The filename of imageForInferenceJpg (e.g. resized0001.jpg)
     */
    filename: string,
    /**
     * If the ICamera also supports streaming out raw RGB buffers, then imageForInferenceRgb is set.
     * This field is only set when options.inferenceDimensions is provided, and is GUARANTEED to
     * be already in the same width / height as the inference dimensions. You can use this field
     * to not do a JPG decode (via ImageClassifier.resizeImage) before inference which can save time.
     */
    imageForInferenceRgb: Buffer | undefined,
    /**
     * The original image as received from the camera (as JPG); before any resizing. For ICamera devices
     * that do not support resizing in the pipeline (anything other than GStreamer); this field will be the
     * same as imageForInferenceJpg.
     * E.g. if you use a GStreamer backend that supports in-pipeline resizing, you can start the camera with
     * { dimensions: { width: 1920, height: 1080 }, inferenceDimensions: { width: 224, height: 224 } }
     * and imageForInferenceJpg will be a 224x224 JPG, and imageFromCameraJpg a 1920x1080 JPG.
     */
    imageFromCameraJpg: Buffer,
};

export interface ICamera extends EventEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void,
    snapshotForInference: (ev: ICameraSnapshotForInferenceEvent) => void,
    error: (message: string) => void,
    profilingInfo: (ev: ICameraProfilingInfoEvent) => void,
}> {
    init(): Promise<void>;
    listDevices(): Promise<string[]>;
    start(options: ICameraStartOptions): Promise<void>;
    stop(): Promise<void>;
    getLastOptions(): ICameraStartOptions | undefined;
}
