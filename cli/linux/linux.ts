#!/usr/bin/env node

import { Imagesnap } from "../../library/sensors/imagesnap";
import inquirer from 'inquirer';
import { initCliApp, setupCliApp } from "../init-cli-app";
import { RemoteMgmt, RemoteMgmtDevice, RemoteMgmtDeviceSampleEmitter } from "../../shared/daemon/remote-mgmt-service";
import { MgmtInterfaceSampleRequestSample } from "../../shared/MgmtInterfaceTypes";
import { makeImage, makeVideo, makeWav, upload } from '../make-image';
import { Config, EdgeImpulseConfig } from "../config";
import { EventEmitter } from "tsee";
import { Mutex } from 'async-mutex';
import sharp from 'sharp';
import { AudioRecorder } from "../../library/sensors/recorder";
import { ICamera } from "../../library/sensors/icamera";
import { GStreamer } from "../../library/sensors/gstreamer";
import { ips } from "../../library/get-ips";
import program from 'commander';
import Path from 'path';
import fs from 'fs';
import Websocket from 'ws';
import TypedEmitter from 'typed-emitter';
import { Prophesee } from "../../library/sensors/prophesee";
import { VideoRecorder } from "../../library/sensors/video-recorder";

const packageVersion = (<{ version: string }>JSON.parse(fs.readFileSync(
    Path.join(__dirname, '..', '..', '..', 'package.json'), 'utf-8'))).version;

program
    .description('Edge Impulse Linux client ' + packageVersion)
    .version(packageVersion)
    .option('--api-key <key>', 'API key to authenticate with Edge Impulse (overrides current credentials)')
    .option('--hmac-key <key>', 'HMAC key to sign new data with (overrides current credentials)')
    .option('--disable-camera', `Don't prompt for camera`)
    .option('--disable-microphone', `Don't prompt for microphone`)
    .option('--clean', 'Clear credentials')
    .option('--silent', `Run in silent mode, don't prompt for credentials`)
    .option('--dev', 'List development servers, alternatively you can use the EI_HOST environmental variable ' +
        'to specify the Edge Impulse instance.')
    .option('--verbose', 'Enable debug logs')
    .allowUnknownOption(true)
    .parse(process.argv);

const devArgv: boolean = !!program.dev;
const cleanArgv: boolean = !!program.clean;
const silentArgv: boolean = !!program.silent;
const verboseArgv: boolean = !!program.verbose;
const apiKeyArgv = <string | undefined>program.apiKey;
const hmacKeyArgv = <string | undefined>program.hmacKey;
const noCamera: boolean = !!program.disableCamera;
const noMicrophone: boolean = !!program.disableMicrophone;
const isProphesee = process.env.PROPHESEE_CAM === '1';

const SERIAL_PREFIX = '\x1b[33m[SER]\x1b[0m';

const cliOptions = {
    appName: 'Edge Impulse Linux client',
    apiKeyArgv: apiKeyArgv,
    cleanArgv: cleanArgv,
    devArgv: devArgv,
    hmacKeyArgv: hmacKeyArgv,
    silentArgv: silentArgv,
    connectProjectMsg: 'To which project do you want to connect this device?',
    getProjectFromConfig: async () => {
        let projectId = await configFactory.getLinuxProjectId();
        if (!projectId) {
            return undefined;
        }
        return { projectId: projectId };
    }
};

class LinuxDevice extends (EventEmitter as new () => TypedEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void
}>) implements RemoteMgmtDevice  {
    private _camera: ICamera | undefined;
    private _config: EdgeImpulseConfig;
    private _devKeys: { apiKey: string, hmacKey: string };
    private _snapshotStreaming: boolean = false;
    private _lastSnapshot: Date = new Date(0);
    private _snapshotMutex = new Mutex();
    private _snapshotId = 0;

    constructor(cameraInstance: ICamera | undefined, config: EdgeImpulseConfig,
                devKeys: { apiKey: string, hmacKey: string }) {
        super();

        this._camera  = cameraInstance;
        this._config = config;
        this._devKeys = devKeys;

        if (this._camera) {
            this._camera.on('snapshot', async (buffer, filename) => {
                const id = ++this._snapshotId;
                const release = await this._snapshotMutex.acquire();

                // limit to 10 frames a second & no new frames should have come in...
                try {
                    if (this._snapshotStreaming &&
                        Date.now() - +this._lastSnapshot >= 100 &&
                        id === this._snapshotId) {

                        const jpg = sharp(buffer);

                        const resized = await jpg.resize(undefined, 96).jpeg().toBuffer();

                        this.emit('snapshot', resized, filename);
                        this._lastSnapshot = new Date();
                    }
                }
                catch (ex) {
                    console.warn('Failed to handle snapshot', ex);
                }
                finally {
                    release();
                }
            });
        }
    }

    connected() {
        return true;
    }

    async getDeviceId() {
        return ips.length > 0 ? ips[0].mac : '00:00:00:00:00:00';
    }

    getDeviceType() {
        let id = (ips.length > 0 ? ips[0].mac : '00:00:00:00:00:00').toLowerCase();

        if (id.startsWith('dc:a6:32') || id.startsWith('b8:27:eb')) {
            return 'RASPBERRY_PI';
        }

        if (id.startsWith('00:04:4b') || id.startsWith('48:b0:2d')) {
            return 'NVIDIA_JETSON_NANO';
        }

        return 'EDGE_IMPULSE_LINUX';
    }

    getSensors() {
        let sensors = [];
        if (!noMicrophone) {
            sensors.push({
                name: 'Microphone',
                frequencies: [ 16000 ],
                maxSampleLengthS: 3600
            });
        }
        if (camera) {
            sensors.push({
                name: 'Camera (640x480)',
                frequencies: [],
                maxSampleLengthS: 60000
            });
            if (isProphesee) {
                sensors.push({
                    name: 'Video (1280x720)',
                    frequencies: [],
                    maxSampleLengthS: 60000
                });
            }
        }
        return sensors;
    }

    supportsSnapshotStreaming() {
        return true;
    }

    supportsSnapshotStreamingWhileCapturing() {
        return true;
    }

    beforeConnect() {
        return Promise.resolve();
    }

    async startSnapshotStreaming() {
        this._snapshotStreaming = true;
    }

    async stopSnapshotStreaming() {
        this._snapshotStreaming = false;
    }

    async sampleRequest(data: MgmtInterfaceSampleRequestSample, ee: RemoteMgmtDeviceSampleEmitter) {
        if (data.sensor?.startsWith('Camera')) {
            if (!this._camera) {
                throw new Error('Linux daemon was started with --no-camera');
            }

            ee.emit('started');

            let jpg = await new Promise<Buffer>((resolve, reject) => {
                if (!this._camera) {
                    return reject('No camera');
                }

                setTimeout(() => {
                    reject('Timeout');
                }, 3000);
                this._camera.once('snapshot', buffer => {
                    resolve(buffer);
                });
            });

            let img = makeImage(jpg, this._devKeys.hmacKey, data.label + '.jpg');

            console.log(SERIAL_PREFIX, 'Uploading sample to',
                this._config.endpoints.internal.ingestion + data.path + '...');

            ee.emit('uploading');

            await upload({
                apiKey: this._devKeys.apiKey,
                filename: data.label + '.jpg',
                processed: img,
                allowDuplicates: false,
                category: data.path.indexOf('/training') > -1 ? 'training' : 'testing',
                config: this._config,
                dataBuffer: jpg,
                label: data.label,
                boundingBoxes: undefined
            });

            console.log(SERIAL_PREFIX, 'Sampling finished');
        }
        else if (data.sensor?.startsWith('Video')) {
            if (!this._camera) {
                throw new Error('Linux daemon was started with --no-camera');
            }

            console.log(SERIAL_PREFIX, 'Waiting 2 seconds');

            await new Promise((resolve) => setTimeout(resolve, 2000));

            ee.emit('started');

            // give some time to emit...
            await await new Promise((resolve) => setTimeout(resolve, 10));

            let video = new VideoRecorder(this._camera, verboseArgv);
            let videoEe = await video.record(data.length);

            videoEe.on('processing', () => ee.emit('processing'));

            let mp4 = await new Promise<Buffer>((resolve, reject) => {
                if (!this._camera) {
                    return reject('No camera');
                }

                videoEe.on('error', err => {
                    reject(err);
                });

                videoEe.on('done', buffer => {
                    resolve(buffer);
                });
            });

            let img = makeVideo(mp4, this._devKeys.hmacKey, data.label + '.mp4');

            console.log(SERIAL_PREFIX, 'Uploading sample to',
                this._config.endpoints.internal.ingestion + data.path + '...');

            ee.emit('uploading');

            await upload({
                apiKey: this._devKeys.apiKey,
                filename: data.label + '.mp4',
                processed: img,
                allowDuplicates: false,
                category: data.path.indexOf('/training') > -1 ? 'training' : 'testing',
                config: this._config,
                dataBuffer: mp4,
                label: data.label,
                boundingBoxes: undefined
            });

            console.log(SERIAL_PREFIX, 'Sampling finished');
        }
        else if (data.sensor === 'Microphone') {
            if (noMicrophone) {
                throw new Error('Linux daemon was started with --no-microphone');
            }

            let now = Date.now();

            const recorder = new AudioRecorder({
                sampleRate: Math.round(1000 / data.interval),
                channels: 1,
                asRaw: true,
                verbose: verboseArgv,
            });

            console.log(SERIAL_PREFIX, 'Waiting 2 seconds');

            const audio = await recorder.start(await configFactory.getAudio() || '');

            // sleep 2 seconds before starting...
            await new Promise<void>((resolve) => {
                let time = 2000 - (Date.now() - now);
                if (time > 0) {
                    setTimeout(resolve, time);
                }
                else {
                    resolve();
                }
            });

            console.log(SERIAL_PREFIX, 'Recording audio...');

            ee.emit('started');

            const audioBuffer = await new Promise<Buffer>((resolve) => {
                let audioBuffers: Buffer[] = [];
                let totalAudioLength = 0;
                let bytesNeeded = (Math.round(1000 / data.interval) * (data.length / 1000)) * 2;

                const onData = (b: Buffer) => {
                    audioBuffers.push(b);
                    totalAudioLength += b.length;

                    if (totalAudioLength > bytesNeeded) {
                        resolve(Buffer.concat(audioBuffers).slice(0, bytesNeeded));
                        audio.ee.off('data', onData);
                    }
                };

                audio.ee.on('data', onData);
            });

            await audio.stop();

            ee.emit('processing');

            let wavFile = this.buildWavFileBuffer(audioBuffer, data.interval);

            let wav = makeWav(wavFile, this._devKeys.hmacKey);

            console.log(SERIAL_PREFIX, 'Uploading sample to',
                this._config.endpoints.internal.ingestion + data.path + '...');

            ee.emit('uploading');

            await upload({
                apiKey: this._devKeys.apiKey,
                filename: data.label + '.wav',
                processed: wav,
                allowDuplicates: false,
                category: data.path.indexOf('/training') > -1 ? 'training' : 'testing',
                config: this._config,
                dataBuffer: audioBuffer,
                label: data.label,
                boundingBoxes: undefined,
            });

            console.log(SERIAL_PREFIX, 'Sampling finished');
        }
        else {
            throw new Error('Invalid sensor: ' + data.sensor);
        }
    }

    private buildWavFileBuffer(data: Buffer, intervalMs: number) {
        // let's build a WAV file!
        let wavFreq = 1 / intervalMs * 1000;
        let fileSize = 44 + (data.length);
        let dataSize = (data.length);
        let srBpsC8 = (wavFreq * 16 * 1) / 8;

        let headerArr = new Uint8Array(44);
        let h = [
            0x52, 0x49, 0x46, 0x46, // RIFF
            // tslint:disable-next-line: no-bitwise
            fileSize & 0xff, (fileSize >> 8) & 0xff, (fileSize >> 16) & 0xff, (fileSize >> 24) & 0xff,
            0x57, 0x41, 0x56, 0x45, // WAVE
            0x66, 0x6d, 0x74, 0x20, // fmt
            0x10, 0x00, 0x00, 0x00, // length of format data
            0x01, 0x00, // type of format (1=PCM)
            0x01, 0x00, // number of channels
            // tslint:disable-next-line: no-bitwise
            wavFreq & 0xff, (wavFreq >> 8) & 0xff, (wavFreq >> 16) & 0xff, (wavFreq >> 24) & 0xff,
            // tslint:disable-next-line: no-bitwise
            srBpsC8 & 0xff, (srBpsC8 >> 8) & 0xff, (srBpsC8 >> 16) & 0xff, (srBpsC8 >> 24) & 0xff,
            0x02, 0x00, 0x10, 0x00,
            0x64, 0x61, 0x74, 0x61, // data
            // tslint:disable-next-line: no-bitwise
            dataSize & 0xff, (dataSize >> 8) & 0xff, (dataSize >> 16) & 0xff, (dataSize >> 24) & 0xff,
        ];
        for (let hx = 0; hx < 44; hx++) {
            headerArr[hx] = h[hx];
        }

        return Buffer.concat([ Buffer.from(headerArr), data ]);
    }
}

let camera: ICamera | undefined;
let configFactory: Config;

// tslint:disable-next-line: no-floating-promises
(async () => {
    try {
        const init = await initCliApp(cliOptions);
        const config = init.config;
        configFactory = init.configFactory;

        const { projectId, devKeys } = await setupCliApp(configFactory, config, cliOptions, undefined);

        await configFactory.setLinuxProjectId(projectId);

        if (!noCamera) {
            if (isProphesee) {
                camera = new Prophesee(verboseArgv);
            }
            else if (process.platform === 'darwin') {
                camera = new Imagesnap();
            }
            else if (process.platform === 'linux') {
                camera = new GStreamer(verboseArgv);
            }
            else {
                throw new Error('Unsupported platform: "' + process.platform + '"');
            }
            await camera.init();
        }

        const linuxDevice = new LinuxDevice(camera, config, devKeys);
        const remoteMgmt = new RemoteMgmt(projectId, devKeys, config, linuxDevice,
            url => new Websocket(url),
            async (currName) => {
                let nameDevice = <{ nameDevice: string }>await inquirer.prompt([{
                    type: 'input',
                    message: 'What name do you want to give this device?',
                    name: 'nameDevice',
                    default: currName
                }]);
                return nameDevice.nameDevice;
            });

        let firstExit = true;

        const onSignal = async () => {
            if (!firstExit) {
                process.exit(1);
            }
            else {
                console.log(SERIAL_PREFIX, 'Received stop signal, stopping application... ' +
                    'Press CTRL+C again to force quit.');
                firstExit = false;
                try {
                    if (camera) {
                        await camera.stop();
                    }
                    process.exit(0);
                }
                catch (ex2) {
                    let ex = <Error>ex2;
                    console.log(SERIAL_PREFIX, 'Failed to stop inferencing', ex.message);
                }
                process.exit(1);
            }
        };

        process.on('SIGHUP', onSignal);
        process.on('SIGINT', onSignal);

        if (!noMicrophone) {
            let audioDevice: string | undefined;
            const audioDevices = await AudioRecorder.ListDevices();
            const storedAudio = await configFactory.getAudio();
            if (storedAudio && audioDevices.find(d => d.id === storedAudio)) {
                audioDevice = storedAudio;
            }
            else if (audioDevices.length === 1) {
                audioDevice = audioDevices[0].id;
            }
            else if (audioDevices.length === 0) {
                console.warn(SERIAL_PREFIX, 'Could not find any microphones, ' +
                    'run this command with --disable-microphone to skip selection');
                audioDevice = '';
            }
            else {
                let inqRes = await inquirer.prompt([{
                    type: 'list',
                    choices: (audioDevices || []).map(p => ({ name: p.name, value: p.id })),
                    name: 'microphone',
                    message: 'Select a microphone (or run this command with --disable-microphone to skip selection)',
                    pageSize: 20
                }]);
                audioDevice = <string>inqRes.microphone;
            }
            await configFactory.storeAudio(audioDevice);

            console.log(SERIAL_PREFIX, 'Using microphone', audioDevice);
        }

        if (camera) {
            let cameraDevice: string | undefined;
            const cameraDevices = await camera.listDevices();
            if (cameraDevices.length === 0) {
                throw new Error('Cannot find any webcams, run this command with --disable-camera to skip selection');
            }

            const storedCamera = await configFactory.getCamera();
            if (storedCamera && cameraDevices.find(d => d === storedCamera)) {
                cameraDevice = storedCamera;
            }
            else if (cameraDevices.length === 1) {
                cameraDevice = cameraDevices[0];
            }
            else {
                let inqRes = await inquirer.prompt([{
                    type: 'list',
                    choices: (cameraDevices || []).map(p => ({ name: p, value: p })),
                    name: 'camera',
                    message: 'Select a camera (or run this command with --disable-camera to skip selection)',
                    pageSize: 20
                }]);
                cameraDevice = <string>inqRes.camera;
            }
            await configFactory.storeCamera(cameraDevice);

            console.log(SERIAL_PREFIX, 'Using camera', cameraDevice, 'starting...');

            if (isProphesee) {
                await camera.start({
                    device: cameraDevice,
                    intervalMs: 40,
                });
            }
            else {
                await camera.start({
                    device: cameraDevice,
                    intervalMs: 200,
                });
            }


            camera.on('error', error => {
                console.log('camera error', error);
            });

            console.log(SERIAL_PREFIX, 'Connected to camera');
        }

        remoteMgmt.on('authenticationFailed', async () => {
            console.log(SERIAL_PREFIX, 'Authentication failed');
            if (camera) {
                await camera.stop();
            }
            process.exit(1);
        });

        await remoteMgmt.connect();
    }
    catch (ex) {
        console.error('Failed to initialize linux tool', ex);
        if (camera) {
            await camera.stop();
        }
        process.exit(1);
    }
})();
