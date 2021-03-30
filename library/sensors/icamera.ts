import { EventEmitter } from 'tsee';

export interface ICamera extends EventEmitter<{
    snapshot: (buffer: Buffer) => void,
    error: (message: string) => void
}> {
    init(): Promise<void>;
    listDevices(): Promise<string[]>;
    start(options: { device: string, intervalMs: number }): Promise<void>;
    stop(): Promise<void>;
}