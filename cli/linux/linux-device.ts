import TypedEmitter from 'typed-emitter';
import { VideoRecorder } from "../../library/sensors/video-recorder";
import { ips } from "../../cli-common/get-ips";
import { EventEmitter } from "tsee";
import { Mutex } from 'async-mutex';
import sharp from 'sharp';
import { AudioRecorder } from "../../library/sensors/recorder";
import { MgmtInterfaceSampleRequestSample, ClientConnectionType } from "../../shared/MgmtInterfaceTypes";
import { upload } from '../../cli-common/make-image';
import { RemoteMgmtDevice, RemoteMgmtDeviceSampleEmitter } from "../../cli-common/remote-mgmt-service";
import { EdgeImpulseConfig } from "../../cli-common/config";
import { ICamera } from "../../library/sensors/icamera";

const SERIAL_PREFIX = '\x1b[33m[SER]\x1b[0m';

export class LinuxDevice extends (EventEmitter as new () => TypedEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void
}>) implements RemoteMgmtDevice  {
    private _camera: ICamera | undefined;
    private _config: EdgeImpulseConfig;
    private _devKeys: { apiKey: string, hmacKey: string };
    private _snapshotStreaming: boolean = false;
    private _lastSnapshot: Date = new Date(0);
    private _snapshotMutex = new Mutex();
    private _snapshotId = 0;
    private _snapshotStreamingResolution: 'low' | 'high' = 'low';
    private _microphoneDisabled: boolean;
    private _enableVideo: boolean;
    private _sensorVerboseOutput: boolean;
    private _audioDeviceName: string | undefined;

    constructor(config: EdgeImpulseConfig,
                devKeys: { apiKey: string, hmacKey: string },
                noMicrophone: boolean,
                enableVideo: boolean,
                sensorVerboseOutput: boolean) {
        // eslint-disable-next-line constructor-super
        super();

        this._config = config;
        this._devKeys = devKeys;
        this._microphoneDisabled = noMicrophone;
        this._enableVideo = enableVideo;
        this._sensorVerboseOutput = sensorVerboseOutput;
    }

    registerCameraSnapshotHandler(cameraInstance: ICamera) {
        this._camera  = cameraInstance;

        this._camera.on('snapshot', async (buffer, filename) => {
            const id = ++this._snapshotId;
            const release = await this._snapshotMutex.acquire();

            let timeBetweenFrames = this._snapshotStreamingResolution === 'low' ?
                100 : 0;

            // limit to 10 frames a second & no new frames should have come in...
            try {
                if (this._snapshotStreaming &&
                    Date.now() - +this._lastSnapshot >= timeBetweenFrames &&
                    id === this._snapshotId) {

                    if (this._snapshotStreamingResolution === 'low') {
                        const jpg = sharp(buffer);
                        const resized = await jpg.resize(undefined, 96, {
                            fastShrinkOnLoad: false
                        }).jpeg().toBuffer();
                        this.emit('snapshot', resized, filename);
                    }
                    else {
                        this.emit('snapshot', buffer, filename);
                    }

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
        /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        let sensors: any = [];
        if (!this._microphoneDisabled) {
            sensors.push({
                name: 'Microphone',
                frequencies: [ 16000 ],
                maxSampleLengthS: 3600
            });
        }
        if (this._camera) {
            const opts = this._camera.getLastOptions();
            const dimensions = opts?.dimensions;
            const str = dimensions ? `(${dimensions.width}x${dimensions.height})` : `640x480`;
            sensors.push({
                name: `Camera (${str})`,
                frequencies: [],
                maxSampleLengthS: 60000
            });
            if (this._enableVideo) {
                sensors.push({
                    name: 'Video (1280x720)',
                    frequencies: [],
                    maxSampleLengthS: 60000
                });
            }
        }
        /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        return sensors;
    }

    getConnectionType() {
        return <ClientConnectionType>'ip';
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

    async startSnapshotStreaming(resolution: 'high' | 'low') {
        this._snapshotStreaming = true;
        this._snapshotStreamingResolution = resolution;
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

            console.log(SERIAL_PREFIX, 'Uploading sample to',
                this._config.endpoints.internal.ingestion + data.path + '...');

            ee.emit('uploading');

            await upload({
                apiKey: this._devKeys.apiKey,
                filename: data.label + '.jpg',
                buffer: jpg,
                allowDuplicates: false,
                category: data.path.indexOf('/training') > -1 ? 'training' : 'testing',
                config: this._config,
                label: { label: data.label, type: 'label' },
                boundingBoxes: undefined,
                metadata: { }, // TODO get this from MgmtInterfaceSampleRequestSample
                addDateId: true,
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

            let video = new VideoRecorder(this._camera, this._sensorVerboseOutput);
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

            console.log(SERIAL_PREFIX, 'Uploading sample to',
                this._config.endpoints.internal.ingestion + data.path + '...');

            ee.emit('uploading');

            await upload({
                apiKey: this._devKeys.apiKey,
                filename: data.label + '.mp4',
                buffer: mp4,
                allowDuplicates: false,
                category: data.path.indexOf('/training') > -1 ? 'training' : 'testing',
                config: this._config,
                label: { label: data.label, type: 'label' },
                boundingBoxes: undefined,
                metadata: { }, // TODO get this from MgmtInterfaceSampleRequestSample
                addDateId: true,
            });

            console.log(SERIAL_PREFIX, 'Sampling finished');
        }
        else if (data.sensor === 'Microphone') {
            if (this._microphoneDisabled) {
                throw new Error('Linux daemon was started with --no-microphone');
            }

            let now = Date.now();

            const recorder = new AudioRecorder({
                sampleRate: Math.round(1000 / data.interval),
                channels: 1,
                asRaw: true,
                verbose: this._sensorVerboseOutput,
            });

            console.log(SERIAL_PREFIX, 'Waiting 2 seconds');

            const audio = await recorder.start(this._audioDeviceName || '');

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

            console.log(SERIAL_PREFIX, 'Uploading sample to',
                this._config.endpoints.internal.ingestion + data.path + '...');

            ee.emit('uploading');

            await upload({
                apiKey: this._devKeys.apiKey,
                filename: data.label + '.wav',
                buffer: wavFile,
                allowDuplicates: false,
                category: data.path.indexOf('/training') > -1 ? 'training' : 'testing',
                config: this._config,
                label: { label: data.label, type: 'label' },
                boundingBoxes: undefined,
                metadata: { }, // TODO get this from MgmtInterfaceSampleRequestSample
                addDateId: true,
            });

            console.log(SERIAL_PREFIX, 'Sampling finished');
        }
        else {
            throw new Error('Invalid sensor: ' + data.sensor);
        }
    }

    setAudioDeviceName(deviceName: string) {
        this._audioDeviceName = deviceName;
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
            // eslint-disable-next-line no-bitwise
            fileSize & 0xff, (fileSize >> 8) & 0xff, (fileSize >> 16) & 0xff, (fileSize >> 24) & 0xff,
            0x57, 0x41, 0x56, 0x45, // WAVE
            0x66, 0x6d, 0x74, 0x20, // fmt
            0x10, 0x00, 0x00, 0x00, // length of format data
            0x01, 0x00, // type of format (1=PCM)
            0x01, 0x00, // number of channels
            // eslint-disable-next-line no-bitwise
            wavFreq & 0xff, (wavFreq >> 8) & 0xff, (wavFreq >> 16) & 0xff, (wavFreq >> 24) & 0xff,
            // eslint-disable-next-line no-bitwise
            srBpsC8 & 0xff, (srBpsC8 >> 8) & 0xff, (srBpsC8 >> 16) & 0xff, (srBpsC8 >> 24) & 0xff,
            0x02, 0x00, 0x10, 0x00,
            0x64, 0x61, 0x74, 0x61, // data
            // eslint-disable-next-line no-bitwise
            dataSize & 0xff, (dataSize >> 8) & 0xff, (dataSize >> 16) & 0xff, (dataSize >> 24) & 0xff,
        ];
        for (let hx = 0; hx < 44; hx++) {
            headerArr[hx] = h[hx];
        }

        return Buffer.concat([ Buffer.from(headerArr), data ]);
    }
}
