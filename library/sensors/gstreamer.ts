import { spawn, exec, ChildProcess } from 'child_process';
import { EventEmitter } from 'tsee';
import fs from 'fs';
import Path from 'path';
import os from 'os';
import { spawnHelper } from './spawn-helper';
import { ICamera, ICameraStartOptions } from './icamera';
import util from 'util';
import crypto from 'crypto';

const PREFIX = '\x1b[34m[GST]\x1b[0m';

type GStreamerCap = {
    type: 'video/x-raw' | 'image/jpeg' | 'nvarguscamerasrc',
    width: number,
    height: number,
    framerate: number
};

type GStreamerDevice = {
    name: string,
    rawCaps: string[],
    deviceClass: string,
    inCapMode: boolean,
    id: string,
    caps: GStreamerCap[]
};

export class GStreamer extends EventEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void,
    error: (message: string) => void
}> implements ICamera {
    private _captureProcess?: ChildProcess;
    private _tempDir?: string;
    private _watcher?: fs.FSWatcher;
    private _handledFiles: { [k: string]: true } = { };
    private _verbose: boolean;
    private _lastHash = '';
    private _processing = false;
    private _lastOptions?: ICameraStartOptions;

    constructor(verbose: boolean) {
        super();

        this._verbose = verbose;
    }

    async init() {
        try {
            await spawnHelper('which', [ 'gst-launch-1.0' ]);
        }
        catch (ex) {
            throw new Error('Missing "gst-launch-1.0" in PATH. Install via `sudo apt install -y gstreamer1.0-tools gstreamer1.0-plugins-good gstreamer1.0-plugins-base gstreamer1.0-plugins-base-apps`');
        }
        try {
            await spawnHelper('which', [ 'gst-device-monitor-1.0' ]);
        }
        catch (ex) {
            throw new Error('Missing "gst-device-monitor-1.0" in PATH. Install via `sudo apt install -y gstreamer1.0-tools gstreamer1.0-plugins-good gstreamer1.0-plugins-base gstreamer1.0-plugins-base-apps`');
        }
    }

    async listDevices() {
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

        // if we have /dev/shm, use that (RAM backed, instead of SD card backed, better for wear)
        let osTmpDir = os.tmpdir();
        if (await this.exists('/dev/shm')) {
            osTmpDir = '/dev/shm';
        }

        this._tempDir = await fs.promises.mkdtemp(Path.join(osTmpDir, 'edge-impulse-cli'));
        const device = (await this.getAllDevices()).find(d => d.name === options.device);
        if (!device) {
            throw new Error('Invalid device ' + options.device);
        }
        if (device.caps.length === 0) {
            throw new Error('Could not find resolution info for this device');
        }

        // now we need to determine the resolution... we want something as close as possible to 640x480
        let cap = device.caps.filter(c => {
            return c.width >= 640 && c.height >= 480;
        }).sort((a, b) => {
            let diffA = Math.abs(a.width - 640) + Math.abs(a.height - 480);
            let diffB = Math.abs(b.width - 640) + Math.abs(b.height - 480);

            return diffA - diffB;
        })[0];

        if (!cap) {
            cap = {
                type: 'video/x-raw',
                width: 640,
                height: 480,
                framerate: 30
            };
        }

        let invokeProcess: 'spawn' | 'exec';
        let args: string[];
        if (cap.type === 'video/x-raw') {
            args = [
                `v4l2src`,
                `device=` + device.id,
                // `num-buffers=999999999`,
                `!`,
                `video/x-raw,width=${cap.width},height=${cap.height}`,
                `!`,
                `videoconvert`,
                `!`,
                `jpegenc`,
                `!`,
                `multifilesink`,
                `location=test%05d.jpg`
            ];
            invokeProcess = 'spawn';
        }
        else if (cap.type === 'image/jpeg') {
            args = [
                `v4l2src`,
                `device=` + device.id,
                // `num-buffers=999999999`,
                `!`,
                `image/jpeg,width=${cap.width},height=${cap.height}`,
                `!`,
                `multifilesink`,
                `location=test%05d.jpg`
            ];
            invokeProcess = 'spawn';
        }
        else if (cap.type === 'nvarguscamerasrc') {
            args = [
                `nvarguscamerasrc ! "video/x-raw(memory:NVMM),width=${cap.width},height=${cap.height}" ! ` +
                    `nvvidconv flip-method=0 ! video/x-raw,width=${cap.width},height=${cap.height} ! nvvidconv ! ` +
                    `jpegenc ! multifilesink location=test%05d.jpg`
            ];
            // no idea why... but if we throw this thru `spawn` this yields an invalid pipeline...
            invokeProcess = 'exec';
        }
        else {
            throw new Error('Invalid cap type ' + cap.type);
        }

        if (this._verbose) {
            console.log(PREFIX, 'Starting gst-launch-1.0 with', args);
        }

        if (invokeProcess === 'spawn') {
            this._captureProcess = spawn('gst-launch-1.0', args, { env: process.env, cwd: this._tempDir });
        }
        else if (invokeProcess === 'exec') {
            this._captureProcess = exec('gst-launch-1.0 ' + args.join(' '), { env: process.env, cwd: this._tempDir });
        }
        else {
            throw new Error('Invalid value for invokeProcess');
        }

        if (this._captureProcess && this._captureProcess.stdout && this._captureProcess.stderr &&
            this._verbose) {
            this._captureProcess.stdout.on('data', (d: Buffer) => {
                console.log(PREFIX, d.toString('utf-8'));
            });
            this._captureProcess.stderr.on('data', (d: Buffer) => {
                console.log(PREFIX, d.toString('utf-8'));
            });
        }

        let lastPhoto = 0;
        let nextFrame = Date.now();

        this._watcher = fs.watch(this._tempDir, async (eventType, fileName) => {
            if (eventType !== 'rename') return;
            if (!(fileName.endsWith('.jpeg') || fileName.endsWith('.jpg'))) return;
            if (!this._tempDir) return;
            if (this._handledFiles[fileName]) return;
            if (this._processing) return;

            // not next frame yet?
            if (Date.now() < nextFrame) {
                this._handledFiles[fileName] = true;
                if (await this.exists(Path.join(this._tempDir, fileName))) {
                    await fs.promises.unlink(Path.join(this._tempDir, fileName));
                }
                return;
            }

            nextFrame = Date.now() + options.intervalMs;

            try {
                this._processing = true;
                this._handledFiles[fileName] = true;

                if (lastPhoto !== 0 && this._verbose) {
                    console.log(PREFIX, 'Got snapshot', fileName, 'time since last:',
                        (Date.now() - lastPhoto) + 'ms.', 'size');
                }

                try {
                    let data = await fs.promises.readFile(Path.join(this._tempDir, fileName));

                    // hash not changed? don't emit another event (streamer does this on Rpi)
                    let hash = crypto.createHash('sha256').update(data).digest('hex');
                    if (hash !== this._lastHash) {
                        this.emit('snapshot', data, Path.basename(fileName));
                        lastPhoto = Date.now();
                    }
                    else if (this._verbose) {
                        console.log(PREFIX, 'Discarding', fileName, 'hash does not differ');
                    }
                    this._lastHash = hash;
                }
                catch (ex) {
                    console.error('Failed to load file', Path.join(this._tempDir, fileName), ex);
                }

                if (await this.exists(Path.join(this._tempDir, fileName))) {
                    await fs.promises.unlink(Path.join(this._tempDir, fileName));
                }
            }
            finally {
                this._processing = false;
            }
        });

        let p = new Promise<void>((resolve, reject) => {
            if (this._captureProcess) {
                this._captureProcess.on('close', code => {
                    if (typeof code === 'number') {
                        reject('Capture process failed with code ' + code);
                    }
                    else {
                        reject('Failed to start capture process, but no exit code. ' +
                            'This might be a permissions issue. ' +
                            'Are you running this command from a simulated shell (like in Visual Studio Code)?');
                    }
                    this._captureProcess = undefined;
                });
            }

            // tslint:disable-next-line: no-floating-promises
            (async () => {
                if (!this._tempDir) {
                    throw new Error('tempDir is undefined');
                }

                const watcher = fs.watch(this._tempDir, () => {
                    resolve();
                    watcher.close();
                });

                setTimeout(async () => {
                    return reject('First photo was not created within 20 seconds');
                }, 20000);
            })();
        });

        p.catch(() => this.stop());

        return p;
    }

    async stop() {
        return new Promise<void>((resolve) => {
            if (this._captureProcess) {
                this._captureProcess.on('close', code => {
                    if (this._watcher) {
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
    }

    private async getAllDevices() {
        let lines = (await spawnHelper('gst-device-monitor-1.0', []))
            .split('\n').filter(x => !!x).map(x => x.trim());

        let devices: GStreamerDevice[] = [];

        let currDevice: GStreamerDevice | undefined;

        for (let l of lines) {
            if (l === 'Device found:') {
                if (currDevice) {
                    devices.push(currDevice);
                }
                currDevice = { name: '', deviceClass: '', rawCaps: [], inCapMode: false, id: '', caps: [] };
                continue;
            }

            if (!currDevice) continue;

            if (l.startsWith('name  :')) {
                currDevice.name = l.split(':')[1].trim();
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

                    let r: GStreamerCap = {
                        type: l.startsWith('video/x-raw') ? 'video/x-raw' : 'image/jpeg',
                        width: Number(width || '0'),
                        height: Number(height || '0'),
                        framerate: Number(framerate || '0'),
                    };
                    return r;
                });

            c = c.filter(x => x.width && x.height && x.framerate);
            // if the device supports video/x-raw, only list those types
            if (c.some(x => x.type === 'video/x-raw')) {
                c = c.filter(x => x.type === 'video/x-raw');
            }
            d.caps = c;
        }

        devices = devices.filter(d => d.deviceClass === 'Video/Source' && d.caps.length > 0);

        // NVIDIA has their own plugins, query them too
        devices = devices.concat(await this.listNvarguscamerasrcDevices());

        return devices.map(d => {
            let name = devices.filter(x => x.name === d.name).length >= 2 ?
                d.name + ' (' + d.id + ')' :
                d.name;

            return {
                id: d.id,
                name: name,
                caps: d.caps
            };
        });
    }

    private async listNvarguscamerasrcDevices(): Promise<GStreamerDevice[]> {
        let hasPlugin: boolean;
        try {
            hasPlugin = (await spawnHelper('gst-inspect-1.0', [])).indexOf('nvarguscamerasrc') > -1;
        }
        catch (ex) {
            if (this._verbose) {
                console.log(PREFIX, 'Error invoking gst-inspect-1.0:', ex);
            }
            hasPlugin = false;
        }

        if (!hasPlugin) {
            return [];
        }

        let caps: GStreamerCap[] = [];

        let gstLaunchRet = await new Promise<string>((resolve, reject) => {
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
                rawCaps: []
            };
            return [d];
        }
        else {
            return [];
        }
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
}
