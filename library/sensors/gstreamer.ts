import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'tsee';
import fs from 'fs';
import Path from 'path';
import os from 'os';
import { spawnHelper, SpawnHelperType } from './spawn-helper';
import { ICamera, ICameraInferenceDimensions, ICameraProfilingInfoEvent, ICameraSnapshotForInferenceEvent, ICameraStartOptions } from './icamera';
import util from 'util';
import crypto from 'crypto';
import { split as argvSplit } from '../argv-split';
import { asyncPool } from '../async-pool';

const PREFIX = '\x1b[34m[GST]\x1b[0m';

type GStreamerCap = {
    type: 'video/x-raw' | 'image/jpeg' | 'nvarguscamerasrc' | 'pylonsrc',
    width: number,
    height: number,
    framerate: number,
    formats?: string[]
};

type GStreamerDevice = {
    name: string,
    rawCaps: string[],
    deviceClass: string,
    inCapMode: boolean,
    id: string,
    caps: GStreamerCap[],
    videoSource: string,
};

export type GStreamerMode = 'default' | 'rpi' | 'rpi5' | 'qualcomm-rb3gen2' | 'qualcomm-yupik' | 'unoq';

const CUSTOM_GST_LAUNCH_COMMAND = 'custom-gst-launch-command';
const DEFAULT_GST_VIDEO_SOURCE = 'v4l2src';

export class GStreamer extends EventEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void,
    snapshotForInference: (ev: ICameraSnapshotForInferenceEvent) => void,
    error: (message: string) => void,
    profilingInfo: (ev: ICameraProfilingInfoEvent) => void,
}> implements ICamera {
    private _captureProcess?: ChildProcess;
    private _tempDir?: string;
    private _watcher?: fs.FSWatcher;
    private _originalAndRgbFilesSeen = new Set<string>();
    private _handledFiles: { [k: string]: true } = { };
    private _verbose: boolean;
    private _lastFile: {
        hash: string,
        fileName: string,
    } | undefined;
    private _processing = false;
    private _lastOptions?: ICameraStartOptions;
    private _mode: GStreamerMode = 'default';
    private _modeOverride: GStreamerMode | undefined;
    private _keepAliveTimeout: NodeJS.Timeout | undefined;
    private _isStarted = false;
    private _isRestarting = false;
    private _spawnHelper: SpawnHelperType;
    private _customLaunchCommand: string | undefined;
    private _profiling: boolean;
    private _emitsOriginalSizeImages = false;
    private _emitsRgbBuffers = false;
    private _overrideColorFormat: string | undefined;
    private _lastGstLaunchCommand = '';
    private _outputRgbBuffers: boolean;
    private _imagesReceived = 0;
    private _offset = 0;

    constructor(verbose: boolean, options?: {
        spawnHelperOverride?: SpawnHelperType,
        customLaunchCommand?: string,
        modeOverride?: GStreamerMode,
        profiling?: boolean,
        dontRunCleanupLoop?: boolean,
        colorFormat?: string,
        dontOutputRgbBuffers?: boolean,
    }) {
        super();

        this._verbose = verbose;
        this._customLaunchCommand = options?.customLaunchCommand;
        this._spawnHelper = options?.spawnHelperOverride || spawnHelper;
        this._modeOverride = options?.modeOverride;
        this._profiling = options?.profiling || false;
        this._overrideColorFormat = options?.colorFormat;
        this._outputRgbBuffers = options?.dontOutputRgbBuffers === true ?
            false :
            true;
        if (options?.dontRunCleanupLoop === true) {
            // skip cleanup loop
        }
        else {
            this.startOriginalCleanupLoop();
        }
    }

    async init() {
        try {
            await this._spawnHelper('which', [ 'gst-launch-1.0' ]);
        }
        catch (ex) {
            throw new Error('Missing "gst-launch-1.0" in PATH. Install via `sudo apt install -y gstreamer1.0-tools gstreamer1.0-plugins-good gstreamer1.0-plugins-base gstreamer1.0-plugins-base-apps`');
        }
        try {
            await this._spawnHelper('which', [ 'gst-device-monitor-1.0' ]);
        }
        catch (ex) {
            throw new Error('Missing "gst-device-monitor-1.0" in PATH. Install via `sudo apt install -y gstreamer1.0-tools gstreamer1.0-plugins-good gstreamer1.0-plugins-base gstreamer1.0-plugins-base-apps`');
        }

        let osRelease;
        if (await this.exists('/etc/os-release')) {
            console.log(PREFIX, 'checking for /etc/os-release');
            osRelease = await fs.promises.readFile('/etc/os-release', 'utf-8');
        }
        else {
            // so we don't need to check for undefined below
            osRelease = '';
        }

        let firmwareModel;
        // using /proc/device-tree as recommended in user space.
        if (await this.exists('/proc/device-tree/model')) {
            firmwareModel = await fs.promises.readFile('/proc/device-tree/model', 'utf-8');
        }
        else {
            // so we don't need to check for undefined below
            firmwareModel = '';
        }

        if (firmwareModel.indexOf('RB3gen2') > -1 && firmwareModel.indexOf('vision') > -1) {
            this._mode = 'qualcomm-rb3gen2';
        }
        else if (firmwareModel.indexOf('Qualcomm') > -1 && firmwareModel.indexOf('Yupik') > -1) {
            this._mode = 'qualcomm-yupik';
        }
        else if (firmwareModel.indexOf('Raspberry Pi') > -1) {
            if (((osRelease.indexOf('bullseye') > -1) || (osRelease.indexOf('bookworm') > -1))
                && (osRelease.indexOf('ID=raspbian') === -1)) {
                    this._mode = 'rpi';
            }
            else if (osRelease.indexOf('trixie') > -1) {
                this._mode = 'rpi';
            }

            // override to rpi5 if needed
            if (firmwareModel.indexOf('Raspberry Pi 5') > -1) {
                this._mode = 'rpi5';
            }
        }
        else if ((firmwareModel.indexOf('Arduino') > -1 && firmwareModel.indexOf('Imola') > -1) ||
                // this may be incorrect on the another platforms in the future
                (process.env.EI_CLI_ENV === 'arduino')) {
            this._mode = 'unoq';
        }

        this._mode = (this._modeOverride) ? this._modeOverride : this._mode;
    }

    async listDevices(): Promise<string[]> {
        if (this._customLaunchCommand) {
            return [ CUSTOM_GST_LAUNCH_COMMAND ];
        }

        let devices = await this.getAllDevices();

        if (this._verbose) {
            console.log(PREFIX, 'Found devices:', JSON.stringify(devices, null, 2));
        }

        return devices.map(d => d.name);
    }

    async start(options: ICameraStartOptions) {
        if (this._captureProcess) {
            throw new Error('Capture was already started');
        }

        this._lastOptions = options;

        this._handledFiles = { };

        let dimensions = options.dimensions || { width: 640, height: 480 };

        // if we have /dev/shm, use that (RAM backed, instead of SD card backed, better for wear)
        let osTmpDir = os.tmpdir();
        if (await this.exists('/dev/shm')) {
            osTmpDir = '/dev/shm';
        }

        await this.cleanupTempDirAsync();

        this._tempDir = await fs.promises.mkdtemp(Path.join(osTmpDir, 'edge-impulse-cli'));
        if (this._verbose) {
            console.log(PREFIX, 'Temp directory is', this._tempDir);
        }
        const device = (await this.getAllDevices()).find(d => d.name === options.device);
        if (!device) {
            throw new Error('Invalid device ' + options.device);
        }
        if (device.caps.length === 0) {
            throw new Error('Could not find resolution info for this device');
        }

        if (device.name === 'RZG2L_CRU') {
            // run commands to initialize the Coral camera on Renesas
            if (this._verbose) {
                console.log(PREFIX, 'Detected RZ/G2L target, initializing camera...');
            }
            await this._spawnHelper('media-ctl', [ '-d', '/dev/media0', '-r' ]);
            await this._spawnHelper('media-ctl', [ '-d', '/dev/media0', '-l', "'rzg2l_csi2 10830400.csi2':1 -> 'CRU output':0 [1]" ]);
            await this._spawnHelper('media-ctl', [ '-d', '/dev/media0', '-V', "'rzg2l_csi2 10830400.csi2':1 [fmt:UYVY8_2X8/640x480 field:none]" ]);
            await this._spawnHelper('media-ctl', [ '-d', '/dev/media0', '-V', "'ov5645 0-003c':0 [fmt:UYVY8_2X8/640x480 field:none]" ]);
            if (this._verbose) {
                console.log(PREFIX, 'Detected RZ/G2L target, initializing camera OK');
            }
        }

        const { command, pipeline } = await this.getGstreamerLaunchCommand(
            device, dimensions, options.inferenceDimensions);

        let env = structuredClone(process.env);
        if (this._profiling) {
            env.GST_DEBUG = 'identity:5';
        }

        let args: string[] = [];
        if (this._profiling) {
            args.push(`-v`);
        }
        args.push(pipeline);

        // for logging purposes
        this._lastGstLaunchCommand = `${command} ${args.join(' ')}`;

        if (this._verbose) {
            console.log(PREFIX, `Starting ${command} ${args.join(' ')}`);
        }

        this._captureProcess = spawn(command, args, {
            env: env,
            cwd: this._tempDir,
            shell: true
        });

        if (this._captureProcess && this._captureProcess.stdout && this._captureProcess.stderr) {
            this._captureProcess.stdout.on('data', (d: Buffer) => {
                if (this._verbose) {
                    console.log(PREFIX, d.toString('utf-8'));
                }

                const ts = new Date();

                const parsePtsFromLine = (line: string) => {
                    const m = line.match(/pts: ([\d\.\:]+)/);
                    if (m && m.length >= 2) {
                        return m[1];
                    }
                    return null;
                };

                const parseOffsetFromLine = (line: string) => {
                    const m = line.match(/offset: (-?[\d\.\:]+)/);
                    if (m && m.length >= 2) {
                        return Number(m[1]);
                    }
                    return null;
                };

                const str = d.toString('utf-8');
                for (const line of str.split('\n')) {
                    if (line.trim().startsWith('/GstPipeline:pipeline0/GstIdentity:')) {
                        // identity elements
                        const pts = parsePtsFromLine(line);
                        let offset = parseOffsetFromLine(line);
                        const identity = line.replace('/GstPipeline:pipeline0/GstIdentity:', '').split(' ')[0]
                            .replace(':', '');

                        // no pts -> skip
                        if (!pts) {
                            continue;
                        }

                        // frame_ready w/o offset -> also skip
                        if (identity === 'frame_ready') {
                            if (offset === null) {
                                continue;
                            }
                            // e.g. qtiqmmfsrc always has offset -1 for frame_ready
                            if (offset === -1) {
                                offset = ++this._offset;
                            }
                            this.emit('profilingInfo', {
                                type: 'frame_ready',
                                ts: ts,
                                pts: pts,
                                offset: offset,
                            });
                        }
                        else {
                            this.emit('profilingInfo', {
                                type: 'event-without-filename',
                                ts: ts,
                                name: identity,
                                pts: pts,
                            });
                        }
                    }
                    else if (line.includes('GstMultiFileSink, filename=')) {
                        let filenameM = line.match(/filename=\(string\)([\w\.]+)/);
                        if (!filenameM || filenameM.length < 2) {
                            console.log(PREFIX, `Failed to parse filename from GstMultiFileSink: ` + line.trim());
                            continue;
                        }

                        let timestampM = line.match(/timestamp=\(guint64\)(\d+)/);
                        if (!timestampM || timestampM.length < 2) {
                            console.log(PREFIX, `Failed to parse timestamp from GstMultiFileSink: ` + line.trim());
                            continue;
                        }

                        let filename = filenameM[1];
                        let pts = this.timestampNsToPts(timestampM[1]);

                        this.emit('profilingInfo', {
                            type: 'pts-to-filename',
                            pts: pts,
                            filename: filename,
                        });
                    }
                }
            });
            this._captureProcess.stderr.on('data', (d: Buffer) => {
                if (this._verbose) {
                    console.log(PREFIX, d.toString('utf-8'));
                }
            });
        }

        let lastPhoto = 0;
        let nextFrame = Date.now();
        this._originalAndRgbFilesSeen = new Set<string>();

        this._watcher = fs.watch(this._tempDir, async (eventType, fileName) => {
            if (eventType !== 'rename') return;
            if (fileName === null) return;
            if (!(fileName.endsWith('.jpeg') || fileName.endsWith('.jpg') || fileName.endsWith('.rgb'))) return;
            if (fileName.startsWith('original')) {
                this._originalAndRgbFilesSeen.add(fileName);
                return;
            }
            if (fileName.endsWith('.rgb')) {
                this._originalAndRgbFilesSeen.add(fileName);
                return;
            }
            if (!this._tempDir) return;
            if (this._handledFiles[fileName]) return;

            this._imagesReceived++;

            const tempDir = this._tempDir; // this can get unset later on -> so cache here

            // not next frame yet?
            if (this._processing || Date.now() < nextFrame) {
                this._handledFiles[fileName] = true;
                await this.safeUnlinkFile(Path.join(tempDir, fileName));
                return;
            }

            nextFrame = Date.now() + options.intervalMs;

            try {
                this._processing = true;
                this._handledFiles[fileName] = true;

                const originalName = fileName.replace('resized', 'original');
                if (this._emitsOriginalSizeImages) {
                    if (!this._originalAndRgbFilesSeen.has(originalName)) {
                        let waitForOriginalStart = Date.now();
                        if (this._verbose) {
                            console.log(PREFIX, `Waiting for original file "${originalName}"...`);
                        }
                        await new Promise<void>(async (resolve, reject) => {
                            let start = Date.now();
                            while (1) {
                                if (this._originalAndRgbFilesSeen.has(originalName)) {
                                    return resolve();
                                }
                                if (Date.now() - start > 1_000) {
                                    return reject(`Did not find original image ("${originalName}") within 1sec`);
                                }
                                await this.wait(1);
                            }
                        });
                        if (this._verbose) {
                            console.log(PREFIX, `Waiting for original file "${originalName}" OK ` +
                                `(took ${Date.now() - waitForOriginalStart}ms.)`);
                        }
                    }
                }

                const rgbName = fileName.replace('.jpg', '.rgb');
                if (this._emitsRgbBuffers) {
                    if (!this._originalAndRgbFilesSeen.has(rgbName)) {
                        let waitForRgbStart = Date.now();
                        if (this._verbose) {
                            console.log(PREFIX, `Waiting for RGB file "${rgbName}"...`);
                        }
                        await new Promise<void>(async (resolve, reject) => {
                            let start = Date.now();
                            while (1) {
                                if (this._originalAndRgbFilesSeen.has(rgbName)) {
                                    return resolve();
                                }
                                if (Date.now() - start > 1_000) {
                                    return reject(`Did not find RGB image ("${rgbName}") within 1sec`);
                                }
                                await this.wait(1);
                            }
                        });
                        if (this._verbose) {
                            console.log(PREFIX, `Waiting for RGB file "${rgbName}" OK ` +
                                `(took ${Date.now() - waitForRgbStart}ms.)`);
                        }
                    }
                }

                if (lastPhoto !== 0 && this._verbose) {
                    console.log(PREFIX, 'Got snapshot', fileName, 'time since last:',
                        (Date.now() - lastPhoto) + 'ms.', 'size');
                }

                if (this._keepAliveTimeout) {
                    clearTimeout(this._keepAliveTimeout);
                }

                try {
                    let [
                        imgBuffer,
                        originalImgBuffer,
                        rgbBuffer,
                    ] = await Promise.all([
                        fs.promises.readFile(Path.join(tempDir, fileName)),
                        this._emitsOriginalSizeImages ?
                            fs.promises.readFile(Path.join(tempDir, originalName)) :
                            null,
                        this._emitsRgbBuffers ?
                            fs.promises.readFile(Path.join(tempDir, rgbName)) :
                            null,
                    ]);

                    // hash not changed? don't emit another event (streamer does this on Rpi)
                    let hash = crypto.createHash('sha256').update(imgBuffer).digest('hex');
                    if (hash !== this._lastFile?.hash) {
                        // snapshot() sends out the original size image
                        this.emit('snapshot', originalImgBuffer || imgBuffer, Path.basename(fileName));
                        // snapshotForInference() sends out the resized image
                        this.emit('snapshotForInference', {
                            imageForInferenceJpg: imgBuffer,
                            filename: Path.basename(fileName),
                            imageFromCameraJpg: originalImgBuffer || imgBuffer,
                            imageForInferenceRgb: rgbBuffer || undefined,
                        });

                        lastPhoto = Date.now();

                        // 2 seconds no new data? trigger timeout
                        if (this._keepAliveTimeout) {
                            clearTimeout(this._keepAliveTimeout);
                        }
                        this._keepAliveTimeout = setTimeout(() => {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            this.timeoutCallback();
                        }, 2000);
                    }
                    else if (this._verbose) {
                        console.log(PREFIX, 'Discarding', fileName, 'hash does not differ');
                    }
                    this._lastFile = {
                        hash,
                        fileName,
                    };
                }
                catch (ex) {
                    console.error(PREFIX, 'Failed to load file', Path.join(tempDir, fileName), ex);
                }

                await Promise.all([
                    (async () => {
                        await this.safeUnlinkFile(Path.join(tempDir, fileName));
                    })(),
                    (async () => {
                        if (originalName) {
                            await this.safeUnlinkFile(Path.join(tempDir, originalName));
                            this._originalAndRgbFilesSeen.delete(originalName);
                        }
                    })(),
                    (async () => {
                        if (rgbName) {
                            await this.safeUnlinkFile(Path.join(tempDir, rgbName));
                            this._originalAndRgbFilesSeen.delete(rgbName);
                        }
                    })(),
                ]);
            }
            finally {
                this._processing = false;
            }
        });

        let p = new Promise<void>((resolve, reject) => {
            if (this._captureProcess) {
                let cp = this._captureProcess;

                let onCaptureProcessCloseCount = 0;

                const onCaptureProcessClose = async (code: number) => {
                    try {
                        if (this._keepAliveTimeout) {
                            clearTimeout(this._keepAliveTimeout);
                        }

                        if (typeof code === 'number') {
                            // if code is 255 and device id is qtiqmmfsrc, it means the camera is not available
                            // try restart on first close only
                            if (code === 255 && device.id.startsWith('qtiqmmfsrc') && onCaptureProcessCloseCount === 0) {
                                // restart cam-server systemctl service
                                console.log(PREFIX, 'Camera is not available, restarting cam-server service...');

                                await spawnHelper('systemctl', [ 'restart', 'cam-server' ]);

                                console.log(PREFIX, 'Camera is not available, restarting cam-server service OK');

                                this._captureProcess = spawn(command, args,
                                    {
                                        env: env,
                                        cwd: this._tempDir,
                                        shell: true
                                    });

                                this._captureProcess.on('close', onCaptureProcessClose);
                                return;
                            }
                            else {
                                const errMsg = `GStreamer (gst-launch-1.0) stopped before emitting any images. This most likely ` +
                                    `means that the launch command is incorrect or that your camera is unresponsive. Here is the launch command:\n\n` +
                                    `${this._lastGstLaunchCommand}\n\n` +
                                    `You can try one of the following:\n\n` +
                                    `* If your camera used to work:\n` +
                                    `    * Disconnect and reconnect the camera (if you use an external camera)\n` +
                                    `    * Kill all other GStreamer commands, via: 'sudo killall gst-launch-1.0'\n` +
                                    `* Run with '--verbose' to see the raw GStreamer output. It might contain a hint why the process fails.\n` +
                                    `* Run with '--dont-output-rgb-buffers' - this will disable RGB output buffer creation which can help with ` +
                                        `targets that advertise RGB capabilities on the video source, but don't actually support this.\n\n` +
                                    `If this does not resolve your issue, then please open a forum post at https://forum.edgeimpulse.com and include:\n\n` +
                                    `* Your device, operating system, what camera you're using, and how the camera is connected (e.g. USB, CSI)\n` +
                                    `* The launch command (above)\n` +
                                    `* The verbose output (run this application with --verbose)\n` +
                                    `* The output of 'gst-device-monitor-1.0'\n` +
                                    `* The output of 'gst-inspect-1.0'`;

                                if (this._imagesReceived === 0 && this._lastGstLaunchCommand) {
                                    reject(`Capture process failed with code ${code}\n\n` +
                                        `${errMsg}`);
                                }
                                else {
                                    reject('Capture process failed with code ' + code);
                                }
                            }
                        }
                        else {
                            reject('Failed to start capture process, but no exit code. ' +
                                'This might be a permissions issue. ' +
                                'Are you running this command from a simulated shell (like in Visual Studio Code)?');
                        }

                        // already started and we're the active process?
                        if (this._isStarted && cp === this._captureProcess && !this._isRestarting) {
                            this.emit('error', 'gstreamer process was killed with code (' + code + ')');
                        }

                        this._captureProcess = undefined;
                    }
                    catch (ex2) {
                        const ex = <Error>ex2;
                        reject(`Failed to start capture process, gstreamer process was killed with code (${code}): ` +
                            (ex.message || ex.toString()));
                    }
                    finally {
                        onCaptureProcessCloseCount++;
                    }
                };

                this._captureProcess.on('close', onCaptureProcessClose);
            }

            void (async () => {
                if (!this._tempDir) {
                    throw new Error('tempDir is undefined');
                }

                const watcher = fs.watch(this._tempDir, () => {
                    this._isStarted = true;
                    resolve();
                    watcher.close();
                });

                setTimeout(async () => {
                    if (this._keepAliveTimeout) {
                        clearTimeout(this._keepAliveTimeout);
                    }

                    return reject('First photo was not created within 20 seconds');
                }, 20000);
            })();
        });

        p.catch(() => this.stop());

        return p;
    }

    async getGstreamerLaunchCommand(device: {
            id: string,
            name: string,
            caps: GStreamerCap[],
            videoSource: string
        },
        dimensions: { width: number, height: number },
        inferenceDims: ICameraInferenceDimensions | undefined,
    ): Promise<{
        command: string,
        pipeline: string,
    }> {
        this._emitsOriginalSizeImages = false;
        this._emitsRgbBuffers = false;

        if (device.id === CUSTOM_GST_LAUNCH_COMMAND) {
            if (!this._customLaunchCommand) {
                throw new Error('_customLaunchCommand is null');
            }
            let customArgs = argvSplit(this._customLaunchCommand);
            customArgs = customArgs.concat([
                `!`,
                `multifilesink location=resized%05d.jpg post-messages=true sync=false`,
            ]);

            return {
                command: 'gst-launch-1.0',
                pipeline: customArgs.join(' '),
            };
        }

        // now we need to determine the resolution... we want something as close as possible to dimensions.
        let caps = device.caps.filter(c => {
            return c.width >= dimensions.width && c.height >= dimensions.height;
        }).sort((a, b) => {
            let diffA = Math.abs(a.width - dimensions.width) + Math.abs(a.height - dimensions.height);
            let diffB = Math.abs(b.width - dimensions.width) + Math.abs(b.height - dimensions.height);

            return diffA - diffB;
        });

        // if the device supports video/x-raw, only list those types
        const videoCaps = caps.filter(x => x.type === 'video/x-raw');
        if (videoCaps.length > 0) {
            caps = videoCaps;
        }

        // choose the top of the list
        let cap = caps[0];

        if (!cap) {
            cap = {
                type: 'video/x-raw',
                width: dimensions.width,
                height: dimensions.height,
                framerate: 30,
            };
        }

        let videoSource: string[] = [];
        if (this._profiling) {
            videoSource.push('-m');
        }
        videoSource.push(device.videoSource);
        if (device.id) {
            videoSource.push(`device=${device.id}`);
        }

        if ((this._mode === 'rpi') || (this._mode === 'rpi5') || device.videoSource === 'libcamerasrc') {
            // libcamera devices don't have id set (or have some unique on Raspberry Pi or Microchip)
            if ((!device.id)
                || (device.name.indexOf('unicam') > -1)
                || (device.name.indexOf('bcm2835-isp') > -1)) {

                videoSource = [
                    ...(this._profiling ? [ '-m' ] : []),
                    'libcamerasrc',
                    ...device.name ? [ 'camera-name="' + device.name + '"' ] : [],
                ];

                const hasPlugin = await this.hasGstPlugin('libcamerasrc');
                if (!hasPlugin) {
                    throw new Error('Missing "libcamerasrc" gstreamer element. Install via `sudo apt install -y gstreamer1.0-libcamera`');
                }
            }

            // FIXME: dirty hack for IPASoft on QRB2210
            // Some resolutions reported by camera causes the pipeline to hang. To fix that, it seems
            // we need to increase width and/or height by 8 pixels. This hack should be removed once
            // the hardware driver for ISP on QRB2210 is released.
            if (this._mode === 'unoq') {
                cap.width += 8;
            }
        }
        else if ((this._mode === 'qualcomm-rb3gen2') || (this._mode === 'qualcomm-yupik')) {
            videoSource = [
                ...(this._profiling ? [ '-m' ] : []),
                'qtiqmmfsrc',
                'name=camsrc',
                'camera=' + device.id,
            ];
        }

        if (device.id === 'pylonsrc') {
            videoSource = [
                ...(this._profiling ? [ '-m' ] : []),
                'pylonsrc',
            ];
        }

        const frameReadyArgs = this._profiling ? [ `!`, `identity name=frame_ready silent=false` ] : [];
        const jpgencDoneArgs = this._profiling ? [ `!`, `identity name=jpegenc_done silent=false` ] : [];
        const resizeDoneArgs = this._profiling ? [ `!`, `identity name=resize_done silent=false` ] : [];

        let teeToBothResizedJpgAndRgb: string[];
        let videoFormat = '';

        if (this._outputRgbBuffers) {
            teeToBothResizedJpgAndRgb = [
                `tee name=u`,
                    `u. ! queue ! jpegenc ${jpgencDoneArgs.join(' ')} ! multifilesink location=resized%05d.jpg post-messages=true sync=false `,
                    `u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false `,
            ];
            videoFormat = ',format=RGB'; // Don't do this if outputRgbBuffers is RGB, because we don't want to force RGB video format
        }
        else {
            teeToBothResizedJpgAndRgb = [
                `jpegenc ${jpgencDoneArgs.join(' ')} ! multifilesink location=resized%05d.jpg post-messages=true sync=false`,
            ];
        }

        let cropArgs: string[] = [];
        if (inferenceDims) {
            // fast path for fit-shortest and squash
            if (inferenceDims.resizeMode === 'fit-shortest') {
                const crop = this.computeCropForFitShort(
                    dimensions.width, dimensions.height,
                    inferenceDims.width, inferenceDims.height
                );
                cropArgs = cropArgs.concat([
                    `!`,
                    `videocrop`, `left=${crop.left}`, `right=${crop.right}`, `top=${crop.top}`, `bottom=${crop.bottom}`,
                    `!`,
                    `videoscale`, `method=lanczos`,
                    `!`,
                    `video/x-raw${videoFormat},width=${inferenceDims.width},height=${inferenceDims.height}`,
                ]);
            }
            else if (inferenceDims.resizeMode === 'squash' || inferenceDims.resizeMode === 'none' /* old model -> squash */) {
                cropArgs.push(`!`);
                cropArgs.push(`videoscale`, `method=lanczos`);
                cropArgs.push(`!`);
                cropArgs.push(`video/x-raw${videoFormat},width=${inferenceDims.width},height=${inferenceDims.height}`);
            }
        }

        let args: string[];
        if ((cap.type === 'video/x-raw') || (cap.type === 'pylonsrc')) {

            if (this._mode === 'rpi' && device.name.indexOf('arducam') > -1) {
                videoSource = videoSource.concat([
                    `!`,
                    `video/x-raw,width=${cap.width},height=${cap.height},format=YUY2`
                ]);
            }
            else if (device.videoSource === 'qtiqmmfsrc') {
                videoSource = videoSource.concat([
                    `!`,
                    `video/x-raw,width=${cap.width},height=${cap.height},format=NV12`
                ]);
            }
            else if (this._mode === 'rpi5' ) {
                // on RPi 5 we need to set color format
                let colorFormat = '';
                if (this._overrideColorFormat) {
                    colorFormat = this._overrideColorFormat;
                }
                else if (cap.formats && cap.formats.indexOf('YUY2') > -1) {
                    colorFormat = 'YUY2';
                }
                else if (cap.formats) {
                    throw new Error('Detected RPi 5 camera. Please provide the color format with `--camera-color-format`, supported formats: ' + cap.formats.join(', '));
                }
                videoSource = videoSource.concat([
                    `!`,
                    `video/x-raw,width=${cap.width},height=${cap.height},format=${colorFormat}`
                ]);
            }
            else {
                videoSource = videoSource.concat([
                    `!`,
                    `video/x-raw,width=${cap.width},height=${cap.height}`
                ]);
            }

            if (cropArgs.length === 0) {
                args = videoSource.concat([
                    ...frameReadyArgs,
                    `!`,
                    `videoconvert`,
                    `!`,
                    `jpegenc`,
                    ...jpgencDoneArgs,
                    `!`,
                    `multifilesink location=resized%05d.jpg post-messages=true sync=false`,
                ]);
            }
            else {
                let original = `t. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false`;
                let resized = [
                    `t. ! queue`,
                    ...cropArgs,
                    ...resizeDoneArgs,
                    `!`,
                    ...teeToBothResizedJpgAndRgb,
                ];

                args = videoSource.concat([
                    ...frameReadyArgs,
                    `!`,
                    `videoconvert`,
                    `!`,
                    `tee name=t`,
                    original,
                    ...resized,
                ]);

                this._emitsOriginalSizeImages = true;
                if (this._outputRgbBuffers) {
                    this._emitsRgbBuffers = true;
                }
            }
        }
        else if (cap.type === 'image/jpeg') {
            videoSource = videoSource.concat([
                `!`,
                `image/jpeg,width=${cap.width},height=${cap.height}`,
            ]);

            if (cropArgs.length === 0) {
                args = videoSource.concat([
                    ...frameReadyArgs,
                    `!`,
                    `multifilesink`,
                    `location=resized%05d.jpg`,
                    `post-messages=true`,
                    `sync=false`,
                ]);
            }
            else {
                let original = `t. ! queue ! multifilesink location=original%05d.jpg  post-messages=true sync=false`;
                let resized = [
                    `t. ! queue`,
                    `!`,
                    `jpegdec`,
                    `!`,
                    `videoconvert`,
                    ...cropArgs,
                    ...resizeDoneArgs,
                    `!`,
                    ...teeToBothResizedJpgAndRgb,
                ];

                args = videoSource.concat([
                    ...frameReadyArgs,
                    `!`,
                    `tee name=t`,
                    original,
                    ...resized,
                ]);

                this._emitsOriginalSizeImages = true;
                if (this._outputRgbBuffers) {
                    this._emitsRgbBuffers = true;
                }
            }
        }
        else if (cap.type === 'nvarguscamerasrc') {
            args = [
                `nvarguscamerasrc ! "video/x-raw(memory:NVMM),width=${cap.width},height=${cap.height}" ! ` +
                    `nvvidconv flip-method=0 ! video/x-raw,width=${cap.width},height=${cap.height} ! nvvidconv ! ` +
                    `jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false`
            ];
        }
        else {
            throw new Error('Invalid cap type ' + cap.type);
        }

        return {
            command: 'gst-launch-1.0',
            // replace multiple spaces with one space
            pipeline: args.join(' ').trim().replace(/(\s+)/g, ' '),
        };
    }

    async stop() {
        if (this._keepAliveTimeout) {
            clearTimeout(this._keepAliveTimeout);
        }

        let stopRes = new Promise<void>((resolve) => {
            if (this._captureProcess) {
                this._captureProcess.on('close', code => {
                    if (this._watcher) {
                        this._watcher.on('close', async () => {
                            try {
                                await this.cleanupTempDirAsync();
                            }
                            catch (ex) { /* noop */ }
                        });
                        this._watcher.close();
                    }
                    resolve();
                });
                this._captureProcess.kill('SIGINT');
                setTimeout(() => {
                    if (this._captureProcess) {
                        this._captureProcess.kill('SIGHUP');
                    }
                }, 3000);
            }
            else {
                resolve();
            }
        });

        // set isStarted to false
        stopRes
            .then(() => { this._isStarted = false; })
            .catch(() => { this._isStarted = false; });

        await this.cleanupTempDirAsync();

        return stopRes;
    }

    async getAllDevices(): Promise<{
        id: string,
        name: string,
        caps: GStreamerCap[],
        videoSource: string
    }[]> {
        if (this._customLaunchCommand) {
            let width = 640;
            let height = 480;

            let widthM = CUSTOM_GST_LAUNCH_COMMAND.match(/width=(\d+)/);
            if (widthM && widthM.length >= 1) {
                width = Number(widthM[1]);
            }
            let heightM = CUSTOM_GST_LAUNCH_COMMAND.match(/height=(\d+)/);
            if (heightM && heightM.length >= 1) {
                height = Number(heightM[1]);
            }

            return [{
                id: CUSTOM_GST_LAUNCH_COMMAND,
                name: CUSTOM_GST_LAUNCH_COMMAND,
                caps: [{
                    type: 'video/x-raw',
                    framerate: 60,
                    width: width,
                    height: height,
                }],
                videoSource: DEFAULT_GST_VIDEO_SOURCE,
            }];
        }

        let lines;
        try {
            lines = (await this._spawnHelper('gst-device-monitor-1.0', []))
                .split('\n').filter(x => !!x).map(x => x.trim());
        }
        catch (ex2) {
            const ex = <Error>ex2;
            const message = ex.message || ex.toString();

            if (typeof message === 'string' && ((message.indexOf('Failed to start device monitor') > -1) ||
                                                (message.indexOf('Failed to query video capabilities') > -1))) {
                if (this._verbose) {
                    console.log(PREFIX, 'Failed to start gst-device-monitor-1.0, retrying with only video sources...');
                }
                lines = (await this._spawnHelper('gst-device-monitor-1.0',
                        [ 'Video/Source', 'Source/Video', 'Video/CameraSource' ]))
                    .split('\n').filter(x => !!x).map(x => x.trim());
            }
            else {
                throw ex;
            }
        }

        let devices: GStreamerDevice[] = [];

        let currDevice: GStreamerDevice | undefined;

        for (let l of lines) {
            if (l === 'Device found:') {
                if (currDevice) {
                    devices.push(currDevice);
                }
                currDevice = {
                    name: '',
                    deviceClass: '',
                    rawCaps: [],
                    inCapMode: false,
                    id: '',
                    videoSource: DEFAULT_GST_VIDEO_SOURCE,
                    caps: []
                };
                continue;
            }

            if (!currDevice) continue;

            if (l.startsWith('name  :')) {
                // extract name from the l between 'name  : ' and '\n', because name may contain colons as well
                currDevice.name = l.split(':').slice(1).join(':').trim();
                continue;
            }
            if (l.startsWith('class :')) {
                currDevice.deviceClass = l.split(':')[1].trim();
                continue;
            }
            if (l.startsWith('caps  :')) {
                let cap = l.split(':')[1].trim();
                currDevice.rawCaps.push(cap);
                currDevice.inCapMode = true;
                continue;
            }
            if (l.startsWith('properties:')) {
                currDevice.inCapMode = false;
                continue;
            }
            if (currDevice.inCapMode) {
                currDevice.rawCaps.push(l);
            }
            if (l.startsWith('device.path =')) {
                currDevice.id = l.split('=')[1].trim();
            }

            if(l.startsWith('api.v4l2.path =') && currDevice.id === '') {
                currDevice.id = l.split('=')[1].trim();
            }

            if (l.startsWith('gst-launch-1.0 ')) {
                const videoSource = l.split(' ')[1].trim();
                if (videoSource !== '...') {

                    // Can be in the form a.b,
                    // e.g uvch264src.vfsrc
                    currDevice.videoSource = videoSource.split('.')[0].trim();

                    if (currDevice.videoSource === 'pipewiresrc') {
                        currDevice.videoSource = DEFAULT_GST_VIDEO_SOURCE;
                    }

                    if (currDevice.videoSource === 'avfvideosrc') {
                        const m = l.match(/gst-launch-1.0 avfvideosrc device-index=(\d+) \!/);
                        if (m && m.length >= 2) {
                            currDevice.videoSource = `avfvideosrc device-index=${m[1]}`;
                        }
                    }
                }
            }
        }

        if (currDevice) {
            devices.push(currDevice);
        }

        for (let d of devices) {
            let c: GStreamerCap[] =
                d.rawCaps.filter(x => x.startsWith('video/x-raw') || x.startsWith('image/jpeg')).map(l => {
                    let width = (l.match(/width=[^\d]+(\d+)/) || [])[1];
                    let height = (l.match(/height=[^\d]+(\d+)/) || [])[1];
                    let framerate = (l.match(/framerate=[^\d]+(\d+)/) || [])[1];
                    let format = (l.match(/format=([a-zA-Z0-9]+)/) || [])[1];

                    // Rpi on bullseye has lines like this..
                    // eslint-disable-next-line @stylistic/max-len
                    // image/jpeg, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                    if (!width) {
                        width = (l.match(/width=(\d+)/) || [])[1];
                    }
                    if (!height) {
                        height = (l.match(/height=(\d+)/) || [])[1];
                    }
                    if (!framerate) {
                        framerate = (l.match(/framerate=(\d+)/) || [])[1];
                    }

                    let r: GStreamerCap = {
                        type: l.startsWith('video/x-raw') ? 'video/x-raw' : 'image/jpeg',
                        width: Number(width || '0'),
                        height: Number(height || '0'),
                        framerate: Number(framerate || '0'),
                        formats: format ? [ format ] : []
                    };
                    return r;
                });

            if (this._mode === 'rpi' || this._mode === 'rpi5' || d.videoSource === 'libcamerasrc') { // no framerate here...
                c = c.filter(x => x.width && x.height);
            }
            else if (d.name === 'RZG2L_CRU') {
                // so here we always parse 320x240, but 640x480 is also fine
                c = c.filter(x => x.width && x.height).map(x => {
                    if (x.width === 320) {
                        x.width = 640;
                    }
                    if (x.height === 240) {
                        x.height = 480;
                    }
                    return x;
                });
            }
            else {
                c = c.filter(x => x.width && x.height && x.framerate);
            }

            // get list of all formats form the c list
            const uniqueFormats = Array.from(new Set(c.map(cap => cap.formats).flat()));
            c = c.reduce((curr: GStreamerCap[], o: GStreamerCap) => {
                // deduplicate caps, prioritize 'video/x-raw' type
                const existingIndex = curr.findIndex(obj => obj.framerate === o.framerate &&
                    obj.width === o.width &&
                    obj.height === o.height);

                // store all supported formats (YUY2 etc.)
                if (uniqueFormats) {
                    o.formats = uniqueFormats.filter((format): format is string => format !== undefined);
                }

                if (existingIndex === -1) {
                    curr.push(o);
                }
                else if (o.type === 'video/x-raw' && curr[existingIndex].type !== 'video/x-raw') {
                    curr[existingIndex] = o;
                }

                return curr;
            }, []);


            d.caps = c;
        }

        devices = devices.filter(d => {
            return (d.deviceClass === 'Video/Source' ||
                d.deviceClass === 'Source/Video' ||
                d.deviceClass === 'Video/CameraSource') &&
                d.caps.length > 0;
        });


        // NVIDIA has their own plugins, query them too
        devices = devices.concat(await this.listNvarguscamerasrcDevices());
        devices = devices.concat(await this.listPylonsrcDevices());
        // Qualcomm has their own plugin, query its too
        // because listQtiqmmsrc* returns hardcoded devices ONLY if a specific gst plugin
        // is available we need to detect device type before, as it may be RubikPi, RB3Gen2 or
        // any other with IMSDK loaded and unknown cameras
        if (this._mode === 'qualcomm-rb3gen2') {
            devices = devices.concat(await this.listQtiqmmsrcDevices());
        }
        else if (this._mode === 'qualcomm-yupik') {
            devices = devices.concat(await this.listQtiqmmsrcOnYupikDevices());
        }

        let mapped = devices.map(d => {
            let name = d.id ?
                d.name + ' (' + d.id + ')' :
                d.name;

            return {
                id: d.id,
                name: name,
                caps: d.caps,
                videoSource: d.videoSource,
            };
        });

        // deduplicate (by id if present, otherwise by name)
        mapped = mapped.reduce((curr: { id: string, name: string, caps: GStreamerCap[], videoSource: string}[], m) => {
            if (m.id) {
                if (curr.find(x => x.id === m.id)) {
                    return curr;
                }
            }
            else if (m.name) {
                if (curr.find(x => x.name === m.name && !x.id)) {
                    return curr;
                }
            }

            curr.push(m);
            return curr;
        }, []);

        return mapped;
    }

    private async hasGstPlugin(plugin: string): Promise<boolean> {
        let hasPlugin: boolean;
        try {
            hasPlugin = (await this._spawnHelper('gst-inspect-1.0', [])).indexOf(plugin) > -1;
        }
        catch (ex) {
            if (this._verbose) {
                console.log(PREFIX, 'Error invoking gst-inspect-1.0:', ex);
            }
            hasPlugin = false;
        }
        return hasPlugin;
    }

    private async listNvarguscamerasrcDevices(): Promise<GStreamerDevice[]> {

        const hasPlugin: boolean = await this.hasGstPlugin('nvarguscamerasrc');
        if (!hasPlugin) {
            return [];
        }

        let caps: GStreamerCap[] = [];

        let gstLaunchRet;

        // not overridden spawn helper?
        if (this._spawnHelper === spawnHelper) {
            gstLaunchRet = await new Promise<string>((resolve, reject) => {
                let command = 'gst-launch-1.0';
                let args = [ 'nvarguscamerasrc' ];
                let opts = { ignoreErrors: true };

                const p = spawn(command, args, { env: process.env });

                let allData: Buffer[] = [];

                p.stdout.on('data', (data: Buffer) => {
                    allData.push(data);

                    if (data.toString('utf-8').indexOf('No cameras available') > -1) {
                        p.kill('SIGINT');
                        resolve(Buffer.concat(allData).toString('utf-8'));
                    }
                });

                p.stderr.on('data', (data: Buffer) => {
                    allData.push(data);

                    if (data.toString('utf-8').indexOf('No cameras available') > -1) {
                        p.kill('SIGINT');
                        resolve(Buffer.concat(allData).toString('utf-8'));
                    }
                });

                p.on('error', reject);

                p.on('close', (code) => {
                    if (code === 0 || opts.ignoreErrors === true) {
                        resolve(Buffer.concat(allData).toString('utf-8'));
                    }
                    else {
                        reject('Error code was not 0: ' + Buffer.concat(allData).toString('utf-8'));
                    }
                });
            });
        }
        else {
            let command = 'gst-launch-1.0';
            let args = [ 'nvarguscamerasrc' ];
            let opts = { ignoreErrors: true };
            gstLaunchRet = await this._spawnHelper(command, args, opts);
        }

        let lines = gstLaunchRet.split('\n').filter(x => !!x).map(x => x.trim());

        lines = lines.filter(x => x.startsWith('GST_ARGUS:'));

        if (this._verbose) {
            console.log(PREFIX, 'gst-launch-1.0 nvarguscamerasrc options', lines.join('\n'));
        }

        for (let l of lines) {
            let m = l.match(/^GST_ARGUS: (\d+)(?:\s*)x(?:\s*)(\d+).*?=(?:\s*)([\d,\.]+)(?:\s*)fps/);
            if (!m) {
                continue;
            }

            let cap: GStreamerCap = {
                framerate: Number(m[3].replace(',', '.')),
                height: Number(m[2]),
                width: Number(m[1]),
                type: 'nvarguscamerasrc'
            };

            if (!isNaN(cap.width) && !isNaN(cap.height) && !isNaN(cap.framerate)) {
                caps.push(cap);
            }
        }

        if (caps.length > 0) {
            let d: GStreamerDevice = {
                caps: caps,
                deviceClass: '',
                id: 'nvarguscamerasrc',
                inCapMode: false,
                name: 'CSI camera',
                rawCaps: [],
                videoSource: 'nvarguscamerasrc',
            };
            return [ d ];
        }
        else {
            return [];
        }
    }

    private async listPylonsrcDevices(): Promise<GStreamerDevice[]> {

        const hasPlugin: boolean = await this.hasGstPlugin('pylonsrc');
        if (!hasPlugin) {
            return [];
        }

        let caps: GStreamerCap[] = [];

        let gstInspectRet;
        {
            let command = 'gst-inspect-1.0';
            let args = [ 'pylonsrc' ];
            let opts = { ignoreErrors: true };

            // not overridden spawn helper?
            if (this._spawnHelper === spawnHelper) {
                gstInspectRet = await new Promise<string>((resolve, reject) => {
                    const p = spawn(command, args, { env: process.env });

                    let allData: Buffer[] = [];

                    p.stdout.on('data', (data: Buffer) => {
                        allData.push(data);

                        if (data.toString('utf-8').indexOf('No devices found') > -1) {
                            p.kill('SIGINT');
                            resolve(Buffer.concat(allData).toString('utf-8'));
                        }
                    });

                    p.stderr.on('data', (data: Buffer) => {
                        allData.push(data);

                        if (data.toString('utf-8').indexOf('No devices found') > -1) {
                            p.kill('SIGINT');
                            resolve(Buffer.concat(allData).toString('utf-8'));
                        }
                    });

                    p.on('error', reject);

                    p.on('close', (code) => {
                        if (code === 0 || opts.ignoreErrors === true) {
                            resolve(Buffer.concat(allData).toString('utf-8'));
                        }
                        else {
                            reject('Error code was not 0: ' + Buffer.concat(allData).toString('utf-8'));
                        }
                    });
                });
            }
            else {
                gstInspectRet = await this._spawnHelper(command, args, opts);
            }
        }

        let gstInspectLines = gstInspectRet.split('\n');
        let inRoiWidth = false;
        let inRoiHeight = false;
        let currProp: string[] = [];
        let expectedIndent = 0;
        let defaultWidth = 1920;
        let defaultHeight = 1080;
        // find AutoFunctionROIWidth-ROI1 and AutoFunctionROIHeight-ROI1
        for (const line of gstInspectLines) {
            let currIndent = line.split(/\w+/)[0].length;

            if (line.indexOf('AutoFunctionROIWidth-ROI1') > -1) {
                inRoiWidth = true;
                expectedIndent = currIndent;
                currProp = [ line ];
                continue;
            }
            else if (line.indexOf('AutoFunctionROIHeight-ROI1') > -1) {
                inRoiHeight = true;
                expectedIndent = currIndent;
                currProp = [ line ];
                continue;
            }

            if (inRoiWidth) {
                if (currIndent === expectedIndent) {
                    let roiWidth = currProp.join('\n');
                    if (this._verbose) {
                        console.log(PREFIX, 'AutoFunctionROIWidth-ROI1:\n', roiWidth);
                    }
                    let m = roiWidth.match(/Default\: (\d+)/);
                    if (m) {
                        defaultWidth = Number(m[1]);
                    }

                    inRoiWidth = false;
                }
                else {
                    currProp.push(line);
                }
            }

            if (inRoiHeight) {
                if (currIndent === expectedIndent) {
                    let roiHeight = currProp.join('\n');
                    if (this._verbose) {
                        console.log(PREFIX, 'AutoFunctionROIHeight-ROI1:\n', roiHeight);
                    }
                    let m = roiHeight.match(/Default\: (\d+)/);
                    if (m) {
                        defaultHeight = Number(m[1]);
                    }

                    inRoiHeight = false;
                }
                else {
                    currProp.push(line);
                }
            }
        }

        // console.log('gstInspectRes', gstInspectRet);

        let gstLaunchRet;
        {
            let command = 'gst-launch-1.0';
            let args = [ 'pylonsrc' ];
            let opts = { ignoreErrors: true };

            // not overridden spawn helper?
            if (this._spawnHelper === spawnHelper) {
                gstLaunchRet = await new Promise<string>((resolve, reject) => {
                    const p = spawn(command, args, { env: process.env });

                    let allData: Buffer[] = [];

                    p.stdout.on('data', (data: Buffer) => {
                        allData.push(data);

                        if (data.toString('utf-8').indexOf('No devices found') > -1) {
                            p.kill('SIGINT');
                            resolve(Buffer.concat(allData).toString('utf-8'));
                        }
                    });

                    p.stderr.on('data', (data: Buffer) => {
                        allData.push(data);

                        if (data.toString('utf-8').indexOf('No devices found') > -1) {
                            p.kill('SIGINT');
                            resolve(Buffer.concat(allData).toString('utf-8'));
                        }
                    });

                    p.on('error', reject);

                    p.on('close', (code) => {
                        if (code === 0 || opts.ignoreErrors === true) {
                            resolve(Buffer.concat(allData).toString('utf-8'));
                        }
                        else {
                            reject('Error code was not 0: ' + Buffer.concat(allData).toString('utf-8'));
                        }
                    });
                });
            }
            else {
                gstLaunchRet = await this._spawnHelper(command, args, opts);
            }
        }

        let lines = gstLaunchRet.split('\n').filter(x => !!x).map(x => x.trim());

        if (this._verbose) {
            console.log(PREFIX, 'gst-launch-1.0 pylonsrc options', lines.join('\n'));
        }

        for (let l of lines) {
            let m = l.match(/New clock: GstSystemClock/);
            if (!m) {
                continue;
            }

            // fps,height and width won't be used
            let cap: GStreamerCap = {
                framerate: 60,
                height: defaultHeight,
                width: defaultWidth,
                type: 'pylonsrc'
            };

            caps.push(cap);
        }

        if (caps.length > 0) {
            let d: GStreamerDevice = {
                caps: caps,
                deviceClass: '',
                id: 'pylonsrc',
                inCapMode: false,
                name: 'Basler camera',
                rawCaps: [],
                videoSource: 'pylonsrc',
            };
            return [ d ];
        }
        else {
            return [];
        }
    }

    private async listQtiqmmsrcDevices(): Promise<GStreamerDevice[]> {

        const hasPlugin: boolean = await this.hasGstPlugin('qtiqmmfsrc');
        if (!hasPlugin) {
            return [];
        }

        let caps: GStreamerCap[] = [];
        let cap: GStreamerCap = {
            type: 'video/x-raw',
            width: 1280,
            height: 720,
            framerate: 30,
        };
        caps.push(cap);

        let d: GStreamerDevice[] = [
            {
                caps: caps,
                deviceClass: '',
                id: '0',
                inCapMode: false,
                name: 'Camera 0 (High-resolution, fisheye, IMX577)',
                rawCaps: [],
                videoSource: 'qtiqmmfsrc',
            },
            {
                caps: caps,
                deviceClass: '',
                id: '1',
                inCapMode: false,
                name: 'Camera 1 (Low-resolution, OV9282)',
                rawCaps: [],
                videoSource: 'qtiqmmfsrc',
            }
        ];

        return d;
    }

    private async listQtiqmmsrcOnYupikDevices(): Promise<GStreamerDevice[]> {

        const hasPlugin: boolean = await this.hasGstPlugin('qtiqmmfsrc');
        if (!hasPlugin) {
            return [];
        }

        let caps: GStreamerCap[] = [];
        let cap: GStreamerCap = {
            type: 'video/x-raw',
            width: 1280,
            height: 720,
            framerate: 30,
        };
        caps.push(cap);

        let d: GStreamerDevice[] = [
            {
                caps: caps,
                deviceClass: '',
                id: '0',
                inCapMode: false,
                name: 'Camera 0',
                rawCaps: [],
                videoSource: 'qtiqmmfsrc',
            },
            {
                caps: caps,
                deviceClass: '',
                id: '1',
                inCapMode: false,
                name: 'Camera 1',
                rawCaps: [],
                videoSource: 'qtiqmmfsrc',
            },
            {
                caps: caps,
                deviceClass: '',
                id: '2',
                inCapMode: false,
                name: 'Camera 2',
                rawCaps: [],
                videoSource: 'qtiqmmfsrc',
            }
        ];

        return d;
    }

    getLastOptions() {
        return this._lastOptions;
    }

    private async exists(path: string) {
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

    private async timeoutCallback() {
        try {
            this._isRestarting = true;

            if (this._verbose) {
                console.log(PREFIX, 'No images received for 2 seconds, restarting...');
            }
            await this.stop();
            if (this._verbose) {
                console.log(PREFIX, 'Stopped');
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
            if (this._lastOptions) {
                if (this._verbose) {
                    console.log(PREFIX, 'Starting gstreamer...');
                }
                await this.start(this._lastOptions);
                if (this._verbose) {
                    console.log(PREFIX, 'Restart completed');
                }
            }
            else {
                this.emit('error', 'gstreamer process went stale');
            }
        }
        catch (ex2) {
            let ex = <Error>ex2;
            this.emit('error', 'gstreamer failed to restart: ' + (ex.message || ex.toString()));
        }
        finally {
            this._isRestarting = false;
        }
    }

    /**
     * Compute the crop to get to the right aspect ratio (fit-short only)
     * @param srcW Input width (so the webcam resolution)
     * @param srcH Input height (so the webcam resolution)
     * @param tgtW Target width (so the inference dimensions)
     * @param tgtH Target height (so the inference dimensions)
     * @returns
     */
    private computeCropForFitShort(
        srcW: number,
        srcH: number,
        tgtW: number,
        tgtH: number
    ) {
        const srcAR = srcW / srcH;
        const tgtAR = tgtW / tgtH;

        let cropW: number;
        let cropH: number;

        if (srcAR > tgtAR) {
            // Source is wider → crop LEFT/RIGHT
            cropH = srcH;
            cropW = Math.round(srcH * tgtAR);
        }
        else {
            // Source is taller/narrower → crop TOP/BOTTOM
            cropW = srcW;
            cropH = Math.round(srcW / tgtAR);
        }

        const cropLeft   = Math.max(0, Math.floor((srcW - cropW) / 2));
        const cropRight  = Math.max(0, srcW - cropW - cropLeft);
        const cropTop    = Math.max(0, Math.floor((srcH - cropH) / 2));
        const cropBottom = Math.max(0, srcH - cropH - cropTop);

        return {
            width: cropW,
            height: cropH,
            left: cropLeft,
            right: cropRight,
            top: cropTop,
            bottom: cropBottom,
        };
    }

    private startOriginalCleanupLoop() {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        (async () => {
            while (1) {
                await this.wait(1000);

                if (!this._emitsOriginalSizeImages || !this._lastFile || !this._tempDir) {
                    continue;
                }

                let processedNumberMatch = this._lastFile.fileName.match(/(\d+)/);
                let processedNumber = processedNumberMatch ? Number(processedNumberMatch[1]) : NaN;
                if (isNaN(processedNumber)) {
                    if (this._verbose) {
                        console.log(PREFIX, `Failed to parse number from lastFile.fileName (${this._lastFile.fileName})`);
                        continue;
                    }
                }

                let filesToUnlink: string[] = [];

                // copy as we're manipulating this set
                for (let originalFileName of Array.from(this._originalAndRgbFilesSeen)) {
                    let originalNumberMatch = originalFileName.match(/(\d+)/);
                    let originalNumber = originalNumberMatch ? Number(originalNumberMatch[1]) : NaN;
                    if (isNaN(originalNumber)) {
                        if (this._verbose) {
                            console.log(PREFIX, `Failed to parse number from originalFileName (${originalFileName})`);
                            continue;
                        }
                    }
                    if (originalNumber >= processedNumber) {
                        continue;
                    }

                    filesToUnlink.push(originalFileName);
                }


                if (this._verbose) {
                    console.log(PREFIX, `Unlinking ${filesToUnlink.length} original / RGB files...`);
                }

                if (filesToUnlink.length > 0) {
                    const tempDir = this._tempDir;
                    await asyncPool(10, filesToUnlink, async (originalFileName) => {
                        await this.safeUnlinkFile(Path.join(tempDir, originalFileName));
                        this._originalAndRgbFilesSeen.delete(originalFileName);
                    });
                }
            }
        })();
    }

    private wait(ms: number) {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
    }

    private async safeUnlinkFile(path: string) {
        try {
            await fs.promises.unlink(path);
        }
        catch (ex) {
            /* noop */
        }
    }

    private async cleanupTempDirAsync() {
        // unmap shared memory for the socket
        if (this._tempDir) {
            try {
                await fs.promises.rm(this._tempDir, { recursive: true });
                this._tempDir = undefined;
            }
            catch (ex) {
                // noop
            }
        }
    }

    private timestampNsToPts(nsStr: string) {
        const ns = BigInt(nsStr); // important: avoid precision loss
        const HOUR = 3600000000000n;
        const MIN  = 60000000000n;
        const SEC  = 1000000000n;

        const h = ns / HOUR;
        const m = (ns / MIN) % 60n;
        const s = (ns / SEC) % 60n;
        const n = ns % SEC;

        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${n.toString().padStart(9, '0')}`;
    }
}
