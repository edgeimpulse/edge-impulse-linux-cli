import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import { EventEmitter } from 'tsee';
import util from 'util';
import os from 'os';
import Path from 'path';
import net from 'net';
import { LibcWrapper, O_RDWR } from './libcwrapper';
import koffi from 'koffi';
import { EimRunnerClassifyResponseSuccess, ModelInformation, RunnerBlockThreshold, RunnerClassifyContinuousRequest,
    RunnerClassifyRequest, RunnerClassifyResponseSuccess, RunnerErrorResponse, RunnerHelloInferencingEngine,
    RunnerHelloRequest, RunnerHelloResponse, RunnerHelloResponseModelParameters, RunnerSetThresholdRequest,
    RunnerSetThresholdResponse } from './linux-impulse-runner-types';
import { VALGRIND_SUPPRESSION_FILE } from './valgrind-suppression';

const PREFIX = '\x1b[33m[RUN]\x1b[0m';

export * from './linux-impulse-runner-types';

type EimRunnerClassifyResponse = ({
    success: true;
} & EimRunnerClassifyResponseSuccess) | RunnerErrorResponse;

export class LinuxImpulseRunner {
    private _path: string;
    private _runner: ChildProcess | undefined;
    private _helloResponse: ModelInformation | undefined;
    private _runnerEe = new EventEmitter<{
        message: (data: { id: number }) => void,
        error: (err: string) => void
    }>();
    private _id = 0;
    private _stopped = false;
    private _socket: net.Socket | undefined;
    private _inputShm: {
        libc: LibcWrapper,
        fd: number,
        buf: ArrayBuffer,
    } | undefined;
    private _freeformOutputShm: {
        index: number,
        libc: LibcWrapper,
        fd: number,
        buf: ArrayBuffer,
        features: Float32Array,
    }[] | undefined;
    private _verbose: boolean;
    private _shmBehavior: 'auto' | 'always' | 'never';
    private _valgrind: boolean;
    private _stdout: Buffer[] = [];
    private _tempDir: string | undefined;

    /**
     * Start a new impulse runner
     * @param path Path to the runner's executable
     */
    constructor(path: string, opts?: {
        // If enabled, runs the .eim file under valgrind
        valgrind?: boolean,
        // Verbose logging
        verbose?: boolean,
        // Shared memory behavior for communicating between EIM and Linux Runner. If not set, defaults to 'auto' -
        // which will use shm if available, and fall back to JSON over TCP otherwise.
        // If set to 'always' will only use shm to communicate (errors out if not available), if set to 'never'
        // will always use JSON over TCP socket.
        shmBehavior?: 'auto' | 'always' | 'never',
        // If enabled, throws error when shm setup fails (otherwise will fall back to JSON over TCP socket)
        throwOnShmInitFailed?: boolean,
    }) {
        this._path = Path.resolve(path);
        this._valgrind = opts?.valgrind || false;
        this._verbose = opts?.verbose || false;
        this._shmBehavior = opts?.shmBehavior || 'auto';

        // Make sure to send a SIGINT to the eim file to clear out shared memory
        process.on('exit', () => {
            if (this._runner && this._runner.pid) {
                try {
                    this._runner.kill('SIGINT');
                }
                catch (ex) {
                    // noop
                }
            }
            // and the shared memory we mapped in here (sync)
            if (this._tempDir) {
                try {
                    fs.rmSync(this._tempDir, { recursive: true });
                    this._tempDir = undefined;
                }
                catch (ex) {
                    // noop
                }
            }
        });
    }

    /**
     * Initialize the runner
     * This returns information about the model
     */
    async init(modelPath?: string) {
        if (modelPath) {
            this._path = Path.resolve(modelPath);
        }

        if (!await this.exists(this._path)) {
            throw new Error('Runner does not exist: ' + this._path);
        }

        this._stdout = [];

        let isSocket = (await fs.promises.stat(this._path)).isSocket();

        // if we have /dev/shm, use that (RAM backed, instead of SD card backed, better for wear)
        let osTmpDir = os.tmpdir();
        if (await this.exists('/dev/shm')) {
            osTmpDir = '/dev/shm';
        }

        let socketPath: string;
        if (isSocket) {
            socketPath = this._path;
        }
        else {
            await this.cleanupTempDirAsync();

            this._tempDir = await fs.promises.mkdtemp(Path.join(osTmpDir, 'edge-impulse-cli'));
            socketPath = Path.join(this._tempDir, 'runner.sock');

            // start the .eim file
            if (this._runner && this._runner.pid) {
                // kill the runner
                this._runner.kill('SIGINT');
                // TODO: check if the runner still exists
            }
            if (this._valgrind) {
                const valgrindSuppressionFile = Path.join(this._tempDir, 'valgrind.supp');
                await fs.promises.writeFile(valgrindSuppressionFile, VALGRIND_SUPPRESSION_FILE, 'utf-8');

                this._runner = spawn('valgrind', [
                    '--suppressions=' + valgrindSuppressionFile,
                    `--leak-check=no`,
                    `--errors-for-leak-kinds=none`,
                    `--show-leak-kinds=none`,
                    `--track-origins=yes`,
                    `--error-exitcode=1`,
                    this._path,
                    socketPath,
                ]);
            }
            else {
                this._runner = spawn(this._path, [ socketPath ]);
            }

            if (!this._runner.stdout) {
                throw new Error('stdout is null');
            }

            if (this._runner.stdout) {
                this._runner.stdout.on('data', data => {
                    if (Buffer.isBuffer(data)) {
                        this._stdout.push(data);
                    }
                });
            }
            if (this._runner.stderr) {
                this._runner.stderr.on('data', data => {
                    if (Buffer.isBuffer(data)) {
                        this._stdout.push(data);
                    }
                });
            }

            const onStdout = (data: Buffer) => {
                stdout += data.toString('utf-8');
            };

            let stdout = '';
            this._runner.stdout.on('data', onStdout);
            if (this._runner.stderr) {
                this._runner.stderr.on('data', onStdout);
            }

            let exitCode: number | undefined | null;

            this._runner.on('exit', code => {
                exitCode = code;
                if (typeof code === 'number' && code !== 0) {
                    this._runnerEe.emit('error', 'Runner has exited with code ' + code);
                }
                this._runner = undefined;
                this._helloResponse = undefined;
                this._runnerEe.removeAllListeners();
            });

            while (typeof exitCode === 'undefined' && !await this.exists(socketPath)) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            if (typeof exitCode !== 'undefined') {
                let err = 'Failed to start runner (code: ' + exitCode + '): ' + stdout;
                if (stdout.indexOf('libtensorflowlite_flex') > -1) {
                    err += '\n\n' +
                        'You will need to install the flex delegates ' +
                        'shared library to run this model. Learn more at https://docs.edgeimpulse.com/docs/edge-impulse-for-linux/flex-delegates';
                }
                throw new Error(err);
            }

            this._runner?.stdout.off('data', onStdout);
            if (this._runner?.stderr) {
                this._runner.stderr.off('data', onStdout);
            }
        }

        // attach to the socket
        let bracesOpen = 0;
        let bracesClosed = 0;
        let line = '';

        if (this._socket) {
            this._socket.removeAllListeners();
            this._socket.end();
        }

        this._socket = net.connect(socketPath);
        this._socket.on('data', data => {
            // uncomment this to see raw output
            // console.log('data', data.toString('utf-8'));
            for (let c of data.toString('utf-8').split('')) {
                line += c;

                if (c === '{') {
                    bracesOpen++;
                }
                else if (c === '}') {
                    bracesClosed++;
                    if (bracesClosed === bracesOpen) {
                        try {
                            let resp = <{ id: number }>JSON.parse(line);
                            this._runnerEe.emit('message', resp);
                        }
                        catch (ex2) {
                            let ex = <Error>ex2;
                            this._runnerEe.emit('error', ex.message || ex.toString());
                        }

                        line = '';
                        bracesClosed = 0;
                        bracesOpen = 0;
                    }
                }
                else if (bracesOpen === 0) {
                    line = line.substr(0, line.length - 1);
                }
            }
        });

        this._socket.on('error', error => {
            this._runnerEe.emit('error', error.message || error.toString());
        });

        await new Promise((resolve, reject) => {
            this._socket?.once('connect', resolve);
            this._socket?.once('error', reject);

            setTimeout(() => {
                reject('Timeout when connecting to ' + socketPath);
            }, 10000);
        });

        let helloResp = await this.sendHello();

        if (this.shouldWarmGpu(helloResp)) {
            await this.runTensorRTWarmup(helloResp.modelParameters);
        }

        return helloResp;
    }

    /**
     * Whether we should warm up the GPU for this model
     * @param modelInfo Model information returned from EIM (hello message response)
     */
    shouldWarmGpu(modelInfo: ModelInformation): boolean {
        let props = modelInfo.inferencingEngine?.properties;
        if (props && props.indexOf('gpu_delegates') > -1) {
            // if the model uses GPU delegates, we need to warm it up
            return true;
        }

        if (modelInfo.modelParameters.inferencing_engine === RunnerHelloInferencingEngine.TensorRT) {
            // if the model uses TensorRT, we need to warm it up
            return true;
        }

        return false;
    }

    /**
     * Stop the classification process
     */
    async stop() {
        this._stopped = true;

        if (!this._runner) {
            await this.cleanupTempDirAsync();
            return Buffer.concat(this._stdout).toString('utf-8');
        }

        await new Promise<void>((resolve) => {
            if (this._runner) {
                this._runner.on('close', (code) => {
                    resolve();
                });
                this._runner.kill('SIGINT');
                setTimeout(() => {
                    if (this._runner) {
                        this._runner.kill('SIGHUP');
                    }
                }, 3000);
            }
            else {
                resolve();
            }
        });

        await this.cleanupTempDirAsync();

        return Buffer.concat(this._stdout).toString('utf-8');
    }

    /**
     * Get information about the model, this is only available
     * after the runner has been initialized
     */
    getModel() {
        if (!this._helloResponse) {
            console.trace('getModel() runner is not initialized');
            throw new Error('Runner is not initialized');
        }

        return this._helloResponse;
    }

    /**
     * Classify data
     * @param data An array of numbers, already formatted according to the rules in
     *             https://docs.edgeimpulse.com/docs/running-your-impulse-locally-1
     */
    async classify(data: number[], timeout?: number): Promise<RunnerClassifyResponseSuccess> {

        let resp: EimRunnerClassifyResponse;

        if (this._inputShm) {
            const features = new Float32Array(this._inputShm.buf, 0, data.length);
            features.set(data);

            resp = await this.send<RunnerClassifyRequest, EimRunnerClassifyResponse>({
                classify_shm: {
                    elements: data.length,
                },
            }, timeout);
        }
        else {
            resp = await this.send<RunnerClassifyRequest, EimRunnerClassifyResponse>({ classify: data }, timeout);
        }
        if (!resp.success) {
            throw new Error(resp.error);
        }
        return this.mapClassifyResponseSuccess(resp);
    }

    /**
     * Classify data (continuous mode, pass in slice_size data)
     * @param data An array of numbers, already formatted according to the rules in
     *             https://docs.edgeimpulse.com/docs/running-your-impulse-locally-1
     */
    async classifyContinuous(data: number[], timeout?: number): Promise<RunnerClassifyResponseSuccess> {
        let resp: EimRunnerClassifyResponse;

        if (this._inputShm) {
            const features = new Float32Array(this._inputShm.buf, 0, data.length);
            features.set(data);

            resp = await this.send<RunnerClassifyContinuousRequest, EimRunnerClassifyResponse>({
                classify_continuous_shm: {
                    elements: data.length,
                },
            }, timeout);
        }
        else {
            resp = await this.send<RunnerClassifyContinuousRequest, EimRunnerClassifyResponse>({
                classify_continuous: data
            }, timeout);
        }

        if (!resp.success) {
            throw new Error(resp.error);
        }
        return this.mapClassifyResponseSuccess(resp);
    }

    async setLearnBlockThreshold(obj: RunnerBlockThreshold) {
        let resp: RunnerSetThresholdResponse;
        if (obj.type === 'anomaly_gmm') {
            resp = await this.send<RunnerSetThresholdRequest, RunnerSetThresholdResponse>({
                set_threshold: {
                    id: obj.id,
                    min_anomaly_score: obj.min_anomaly_score,
                }
            });
        }
        else if (obj.type === 'object_detection') {
            resp = await this.send<RunnerSetThresholdRequest, RunnerSetThresholdResponse>({
                set_threshold: {
                    id: obj.id,
                    min_score: obj.min_score,
                }
            });
        }
        else if (obj.type === 'object_tracking') {
            resp = await this.send<RunnerSetThresholdRequest, RunnerSetThresholdResponse>({
                set_threshold: {
                    id: obj.id,
                    keep_grace: obj.keep_grace,
                    max_observations: obj.max_observations,
                    threshold: obj.threshold,
                }
            });
        }
        else if (obj.type === 'classification') {
            resp = await this.send<RunnerSetThresholdRequest, RunnerSetThresholdResponse>({
                set_threshold: {
                    id: obj.id,
                    min_score: obj.min_score,
                }
            });
        }
        else {
            throw new Error(`runner::setLearnBlockThreshold invalid value for type (was "${(<{ type: string }>obj).type}")`);
        }
    }

    private async sendHello() {
        let resp = await this.send<RunnerHelloRequest, RunnerHelloResponse>({ hello: 1 });
        if (!resp.success) {
            throw new Error(resp.error);
        }

        let sensor: 'unknown' | 'accelerometer' | 'microphone' | 'camera' | 'positional' = 'unknown';
        switch (resp.model_parameters.sensor) {
            case -1:
            default:
                sensor = 'unknown'; break;
            case 1:
                sensor = 'microphone'; break;
            case 2:
                sensor = 'accelerometer'; break;
            case 3:
                sensor = 'camera'; break;
            case 4:
                sensor = 'positional'; break;
        }

        this._inputShm = undefined;
        this._freeformOutputShm = undefined;

        if (!resp.features_shm) {
            if (this._shmBehavior === 'always') {
                const errorStr = resp.features_shm_error ? ` (error: "${resp.features_shm_error}")` : ``;
                throw new Error(`shmBehavior is "always", but ${Path.basename(this._path)} does not support shm (features_shm is NULL). ` +
                    `Set to "auto" to fall back to JSON over TCP socket.${errorStr}`);
            }

            if (resp.features_shm_error && this._verbose) {
                console.log(PREFIX, `Failed to initialize shared memory (EIM side): ` + resp.features_shm_error);
            }
        }

        if (resp.features_shm && (this._shmBehavior === 'always' || this._shmBehavior === 'auto')) {
            let libc: koffi.IKoffiLib | undefined;

            try {
                if (process.platform === 'linux') {
                    libc = koffi.load('librt.so.1');
                }
                else if (process.platform === 'darwin') {
                    libc = koffi.load('libc.dylib');
                }

                if (libc) {
                    const libcWrapper = new LibcWrapper(libc);

                    // input tensor
                    {
                        const fd = libcWrapper.shmOpen(resp.features_shm.name, O_RDWR, 0o666);
                        const buf = libcWrapper.mmapToArrayBuffer(fd, resp.features_shm.size_bytes);

                        this._inputShm = {
                            libc: libcWrapper,
                            fd: fd,
                            buf: buf,
                        };

                        if (this._verbose) {
                            console.log(PREFIX, `Initialized shared memory (input features) (${resp.features_shm.name})`);
                        }
                    }

                    if (resp.freeform_output_shm) {
                        this._freeformOutputShm = [];
                        for (const outputShm of resp.freeform_output_shm || []) {
                            const fd = libcWrapper.shmOpen(outputShm.name, O_RDWR, 0o666);
                            const buf = libcWrapper.mmapToArrayBuffer(fd, outputShm.size_bytes);

                            this._freeformOutputShm.push({
                                index: outputShm.index,
                                libc: libcWrapper,
                                fd: fd,
                                buf: buf,
                                features: new Float32Array(buf, 0, outputShm.elements),
                            });

                            if (this._verbose) {
                                console.log(PREFIX, `Initialized shared memory (freeform output ${outputShm.index}) (${outputShm.name})`);
                            }
                        }
                    }
                }
            }
            catch (ex2) {
                const ex = <Error>ex2;
                if (this._shmBehavior === 'always') {
                    throw new Error(`Failed to initialize shared memory (${resp.features_shm.name}): ` +
                        ex.message || ex.toString());
                }
                if (this._verbose) {
                    console.log(PREFIX, `Failed to initialize shared memory (${resp.features_shm.name}): ` +
                        ex.message || ex.toString());
                }
            }
        }

        let data: ModelInformation = {
            project: resp.project,
            modelParameters: { ...resp.model_parameters, sensorType: sensor },
            inferencingEngine: { ...resp.inferencing_engine || undefined}
        };

        if (!data.modelParameters.model_type) {
            data.modelParameters.model_type = 'classification';
        }
        if (typeof data.modelParameters.image_input_frames === 'undefined') {
            data.modelParameters.image_input_frames = 1;
        }

        this._helloResponse = data;

        return data;
    }

    private send<T extends object, U>(msg: T, timeoutArg?: number) {

        return new Promise<U>((resolve, reject) => {
            const defaultTimeout = this._valgrind ?
                120_000 : // valgrind takes its time (esp on x86)
                30_000;

            let timeout = typeof timeoutArg === 'number' ? timeoutArg : defaultTimeout;

            if (!this._socket) {
                console.trace('Runner is not initialized (runner.send)');
                return reject('Runner is not initialized');
            }

            let msgId = ++this._id;

            const onData = (resp: { id: number }) => {
                if (resp.id === msgId) {
                    if (this._runner) {
                        this._runner.off('exit', onExit);
                    }
                    this._runnerEe.off('message', onData);
                    resolve(<U><unknown>resp);
                }
            };

            this._runnerEe.on('message', onData);

            const body = JSON.stringify(Object.assign(msg, {
                id: msgId
            }));

            this._socket.write(body + '\n');

            setTimeout(() => {
                reject(`No response within ${timeout / 1000} seconds:\n\n` +
                    Buffer.concat(this._stdout).toString('utf-8'));
            }, timeout);

            const onExit = async (code: number) => {
                await this.cleanupTempDirAsync();

                if (!this._stopped) {
                    reject('Process exited with ' + code);
                }
            };

            if (this._runner) {
                this._runner.on('exit', onExit);
            }
        });
    }

    /**
     * Whether a file exists (Node.js API cannot be converted using promisify)
     * @param path
     */
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

    private async runTensorRTWarmup(params: RunnerHelloResponseModelParameters) {
        const TRT_PREFIX = '\x1b[33m[TRT]\x1b[0m';

        const spinner = [ "|", "/", "-", "\\" ];
        let progressIv: NodeJS.Timeout | undefined;
        try {
            let i = 0;
            progressIv = setInterval(() => {
                console.log(TRT_PREFIX, 'Loading model into GPU, this can take several minutes on the first run... ' +
                    spinner[i] + '\x1b[1A');
                i = (i < spinner.length - 1) ? i + 1 : 0;
            }, 1000);

            let initStart = Date.now();

            await this.classify(<number[]>Array.from({ length: params.input_features_count }).fill(0),
                60 * 60 * 1000 /* 1 hour */);

            let totalTime = Date.now() - initStart;

            if (progressIv) {
                clearInterval(progressIv);
            }

            console.log(TRT_PREFIX, 'Loading model into GPU, this can take several minutes on the first run... ' +
                'OK (' + totalTime + 'ms.)');

            if (totalTime > 5000) {
                // https://stackoverflow.com/questions/20010199/how-to-determine-if-a-process-runs-inside-lxc-docker
                if (await this.exists('/.dockerenv')) {
                    console.log(TRT_PREFIX, '');
                    console.log(TRT_PREFIX, 'If you run this model in Docker you can cache the GPU-optimized model for faster startup times');
                    console.log(TRT_PREFIX, 'by mounting the', + Path.dirname(this._path), 'directory into the container.');
                    console.log(TRT_PREFIX, 'See https://docs.edgeimpulse.com/docs/run-inference/docker#running-offline');
                    console.log(TRT_PREFIX, '');
                }
            }
        }
        catch (ex2) {
            const ex = <Error>ex2;
            console.log(''); // make sure to jump to next line
            throw ex;
        }
        finally {
            if (progressIv) {
                clearInterval(progressIv);
            }
        }
    }

    private mapClassifyResponseSuccess(resp: EimRunnerClassifyResponseSuccess): RunnerClassifyResponseSuccess {
        // bit hard to get TypeScript to understand that these types are the same in this case...
        if (!resp.result.freeform)  {
            const { freeform: _omit, ...result } = resp.result;
            return {
                result: result,
                info: resp.info,
                timing: resp.timing,
            };
        }
        if (Array.isArray(resp.result.freeform)) {
            return {
                result: {
                    ...resp.result,
                    freeform: resp.result.freeform,
                },
                info: resp.info,
                timing: resp.timing,
            };
        }

        const freeform: number[][] = [];

        // ... actual mapping in SHM
        for (const shm of this._freeformOutputShm || []) {
            freeform.push(Array.from(shm.features));
        }

        return {
            result: {
                ...resp.result,
                freeform: freeform,
            },
            info: resp.info,
            timing: resp.timing,
        };
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
}
