// based on https://github.com/leon3s/node-mic-record (MIT licensed)

import {
    spawn,
    ChildProcess,
    SpawnOptions
} from 'child_process';
import { EventEmitter } from 'tsee';
import { spawnHelper } from './spawn-helper';
import fs from 'fs';
import util from 'util';

const PREFIX = '\x1b[35m[AUD]\x1b[0m';
const AUDIO_START_TIMEOUT_MS = 10_000;
const AUDIO_STOP_GRACE_MS = 3_000;
const AUDIO_STOP_FORCE_MS = 2_000;

export interface AudioRecorderOptionsNullable {
    sampleRate? : number;
    channels? : number;
    compress? : boolean;
    threshold? : number;
    thresholdStart? : number;
    thresholdEnd? : number;
    silence? : number;
    verbose? : boolean;
    audioType? : string;
    asRaw? : boolean;
}

interface AudioRecorderOptions {
    sampleRate: number;
    channels: number;
    compress: boolean;
    threshold: number;
    thresholdStart: number | null;
    thresholdEnd: number | null;
    silence: number;
    verbose: boolean;
    audioType: string;
    asRaw: boolean;
}

export interface AudioInstance {
    ee: EventEmitter<{ data: (b: Buffer) => void }>;
    stop: () => Promise<void>;
}

export class AudioRecorder {
    private _cp ? : ChildProcess;
    private _options: AudioRecorderOptions;

    constructor(options: AudioRecorderOptionsNullable) {
        let defaults: AudioRecorderOptions = {
            sampleRate: 16000,
            channels: 1,
            compress: false,
            threshold: 0.5,
            thresholdStart: null,
            thresholdEnd: null,
            silence: 1.0,
            verbose: false,
            audioType: 'wav',
            asRaw: false,
        };

        this._options = Object.assign(defaults, options);
    }

    async start(device: string) {
        let cmd: string;
        let cmdArgs: string[];
        let cmdOptions: SpawnOptions;
        let audioType: string;

        cmd = "sox";
        audioType = "wav";
        if (this._options.audioType) audioType = this._options.audioType;
        if (this._options.asRaw) audioType = "raw";

        if (process.platform === 'linux') {
            cmdArgs = [ '-t', 'alsa', device ];
        }
        else if (process.platform === 'darwin') {
            cmdArgs = [ '-t', 'coreaudio', device ];
        }
        else {
            console.warn(PREFIX, 'WARN: Could not detect platform, using default audio device');
            cmdArgs = [ '-d' ];
        }

        cmdArgs = cmdArgs.concat([
            '-q', // show no progress
            '-r', this._options.sampleRate.toString(), // sample rate
            '-c', '1', // channels
            '-e', 'signed-integer', // sample encoding
            '-b', '16', // precision (bits)
            '-t', audioType, // audio type
            '-'
        ]);

        try {
            await spawnHelper('which', [ cmd ]);
        }
        catch (ex) {
            throw new Error(`Missing "${cmd}" in PATH.`);
        }

        cmdOptions = { };
        // This does not appear to work
        // if (this._options.device) {
        //     cmdOptions.env = Object.assign({ }, process.env, {
        //         AUDIODEV: this._options.device
        //     });
        // }

        // Spawn audio capture command
        this._cp = spawn(cmd, cmdArgs, cmdOptions);
        if (this._options.verbose) {
            console.log('Recording via: ', cmd, cmdArgs, cmdOptions);
        }
        let rec = this._cp.stdout;
        if (!rec) {
            throw new Error('stdout is null');
        }

        if (this._options.verbose) {
            console.log('Recording', this._options.channels, 'channels with sample rate',
                this._options.sampleRate + '...');
            console.time('End Recording');

            rec.on('data', (data: Buffer) => {
                console.log('Recording %d bytes', data.length, data);
            });

            rec.on('end', () => {
                console.timeEnd('End Recording');
            });
        }

        let ee = new EventEmitter<{
            data: (b: Buffer) => void,
        }>();

        rec.on('data', (data: Buffer) => ee.emit('data', data));

        return new Promise<AudioInstance>((resolve, reject) => {
            if (!this._cp || !rec || !this._cp.stderr) {
                return reject('cp is null');
            }

            let settled = false;
            let startTimer: NodeJS.Timeout;
            const finish = (error?: unknown) => {
                if (settled) return;
                settled = true;
                clearTimeout(startTimer);
                if (error) reject(error);
                else resolve({ ee: ee, stop: this.stop.bind(this) });
            };

            let err = '';
            this._cp.stderr.on('data', (data: Buffer) => err += data.toString('utf-8'));

            this._cp.on('error', finish);
            this._cp.on('close', (code) => {
                finish(cmd + ' exited with code ' + code + ': ' + err);
            });
            // first data segment will resolve
            rec.once('data', () => {
                finish();
            });

            startTimer = setTimeout(() => {
                void this.stop().then(
                    () => finish('Timeout when waiting for audio recording to start'),
                    stopError => finish(`Timeout when waiting for audio recording to start; ` +
                        `failed to stop recorder: ${String(stopError)}`)
                );
            }, AUDIO_START_TIMEOUT_MS);
        });
    }

    static async ListDevices(): Promise<{ name: string, id: string }[]> {
        if (await this.exists('/proc/asound/cards')) {
            let devices: { name: string, id: string }[] = [];

            let data = await fs.promises.readFile('/proc/asound/cards', 'utf-8');

            let audioDevices = data.split('\n').map(d => d.trim()).filter(d => d.match(/^(\d+) .*?\]\: (.+)$/));
            for (let d of audioDevices) {
                let m = d.match(/^(\d+) .*?\]\: (.+)$/);
                if (m && m.length >= 3) {
                    devices.push({
                        name: m[2],
                        id: 'hw:' + m[1] + ',0'
                    });
                }
            }

            return devices;
        }
        else if (await spawnHelper('which', [ 'arecord' ], { ignoreErrors: true })) {
            let data = await spawnHelper('arecord', [ '-l' ]);
            let lines = data.split('\n').filter(line => line.trim() !== '');
            let devices: { name: string, id: string }[] = [];
            for (let line of lines) {
                let match = line.match(/card (\d+): (.+?) \[(.+?)\], device (\d+): (.+?) \[(.+?)\]/);
                if (match) {
                    devices.push({
                        name: match[2],
                        id: 'hw:' + match[1] + ',0'
                    });
                }
            }

            return devices;
        }
        else if (process.platform === 'darwin') {
            try {
                await spawnHelper('which', [ 'sox' ]);
            }
            catch (ex) {
                throw new Error(`Missing "sox" in PATH.`);
            }

            let data = await spawnHelper('sox', [
                '-V6',
                '-n',
                '-t',
                'coreaudio',
                'testtesttest'
            ], { ignoreErrors: true });

            let devices = [ ...new Set(data.split('\n')
                .filter(d => d.startsWith('sox INFO coreaudio: Found Audio Device'))
                .map(d => d.split('Found Audio Device ')[1])
                .map(d => d.substr(1, d.length - 2)))
            ];

            return devices.map(d => {
                return {
                    name: d,
                    id: d
                };
            });
        }
        else {
            return [{
                name: 'Default audio device',
                id: ''
            }];
        }
    }

    private stop() {
        const child = this._cp;
        if (!child) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            let settled = false;
            let forceTimer: NodeJS.Timeout | undefined;
            let finalTimer: NodeJS.Timeout | undefined;
            const finish = () => {
                if (settled) return;
                settled = true;
                if (forceTimer) clearTimeout(forceTimer);
                if (finalTimer) clearTimeout(finalTimer);
                child.off('close', finish);
                if (this._cp === child) this._cp = undefined;
                resolve();
            };
            const fail = () => {
                if (settled) return;
                settled = true;
                if (forceTimer) clearTimeout(forceTimer);
                child.off('close', finish);
                reject(new Error(`Audio recorder process ${child.pid || 'unknown'} did not exit after SIGKILL`));
            };
            child.once('close', finish);
            if (child.exitCode !== null || child.signalCode !== null || !child.pid) {
                finish();
                return;
            }

            child.kill('SIGINT');
            forceTimer = setTimeout(() => child.kill('SIGKILL'), AUDIO_STOP_GRACE_MS);
            finalTimer = setTimeout(() => {
                if (child.exitCode !== null || child.signalCode !== null) finish();
                else fail();
            }, AUDIO_STOP_GRACE_MS + AUDIO_STOP_FORCE_MS);
        });
    }

    private static async exists(path: string) {
        let exists = false;
        try {
            await util.promisify(fs.stat)(path);
            exists = true;
        }
        catch (ex) {
            /* noop */
        }
        return exists;
    }
}
