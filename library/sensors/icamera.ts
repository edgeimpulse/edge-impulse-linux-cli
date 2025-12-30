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

export interface ICamera extends EventEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void,
    snapshotForInference: (buffer: Buffer, filename: string) => void,
    error: (message: string) => void,
    profilingInfo: (ev: ICameraProfilingInfoEvent) => void,
}> {
    init(): Promise<void>;
    listDevices(): Promise<string[]>;
    start(options: ICameraStartOptions): Promise<void>;
    stop(): Promise<void>;
    getLastOptions(): ICameraStartOptions | undefined;
}
