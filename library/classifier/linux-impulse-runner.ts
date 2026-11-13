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
    RunnerSetThresholdResponse,
    SetRunnerBlockThreshold} from './linux-impulse-runner-types';
import { VALGRIND_SUPPRESSION_FILE } from './valgrind-suppression';

const PREFIX = '\x1b[33m[RUN]\x1b[0m';
const RUNNER_SOCKET_TIMEOUT_MS = 60_000;
const STOP_GRACE_PERIOD_MS = 3_000;
const STOP_FORCE_PERIOD_MS = 2_000;
const SOCKET_CLOSE_EXIT_GRACE_PERIOD_MS = 1_000;

export * from './linux-impulse-runner-types';

type EimRunnerClassifyResponse = ({
    success: true;
} & EimRunnerClassifyResponseSuccess) | RunnerErrorResponse;

/** Exit details emitted when an initialized model process terminates without an intentional stop. */
export type LinuxImpulseRunnerUnexpectedTermination = {
    code: number | null;
    signal: NodeJS.Signals | null;
};

/** Process lifecycle notifications exposed by an initialized model runner. */
type LinuxImpulseRunnerEvents = {
    unexpectedTermination: (termination: LinuxImpulseRunnerUnexpectedTermination) => void;
};

export class LinuxImpulseRunner {
    private _path: string;
    private _runner: ChildProcess | undefined;
    // Child whose initialization completed and whose exit therefore makes serving unavailable.
    private _servingRunner: ChildProcess | undefined;
    private _helloResponse: ModelInformation | undefined;
    private _runnerEe = new EventEmitter<{
        message: (data: { id: number }) => void,
        error: (err: string) => void
    }>();
    private _lifecycleEe = new EventEmitter<LinuxImpulseRunnerEvents>();
    // Unexpected terminal outcome retained so an owner attaching after init cannot miss it.
    private _unexpectedTermination: LinuxImpulseRunnerUnexpectedTermination | undefined;
    // Socket close usually precedes child exit; this fallback handles a child that never reports exit.
    private _socketCloseTerminationTimer: NodeJS.Timeout | undefined;
    private _id = 0;
    private _stopped = false;
    private _socket: net.Socket | undefined;
    private _inputShm: {
        libc: LibcWrapper,
        fd: number,
        buf: ArrayBuffer,
        address: unknown,
        size: number,
    } | undefined;
    private _freeformOutputShm: {
        index: number,
        libc: LibcWrapper,
        fd: number,
        buf: ArrayBuffer,
        address: unknown,
        size: number,
        features: Float32Array,
    }[] | undefined;
    private _verbose: boolean;
    private _shmBehavior: 'auto' | 'always' | 'never';
    private _valgrind: boolean;
    private _startupTimeoutMs: number | undefined;
    private _stdout: Buffer[] = [];
    private _tempDir: string | undefined;
    // Stable listener reference so stopped runners can detach their process-level cleanup handler.
    private _processExitHandler: () => void;
    // Requests currently awaiting a response from this runner, settled when it exits or is retired.
    private _pendingSends = new Map<number, (error: string) => void>();

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
        // Optional deadline for complete startup, including accelerator warm-up.
        startupTimeoutMs?: number,
    }) {
        this._path = Path.resolve(path);
        this._valgrind = opts?.valgrind || false;
        this._verbose = opts?.verbose || false;
        this._shmBehavior = opts?.shmBehavior || 'auto';
        this._startupTimeoutMs = opts?.startupTimeoutMs;

        // Make sure to send a SIGINT to the eim file to clear out shared memory
        this._processExitHandler = () => {
            if (this._runner && this._runner.pid) {
                try {
                    this._runner.kill('SIGINT');
                }
                catch (ex) {
                    // noop
                }
            }
            this.releaseSharedMemory();
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
        };
        process.on('exit', this._processExitHandler);
    }

    /** Registers an observer and immediately replays an already-observed terminal outcome. */
    on(type: 'unexpectedTermination', handler: LinuxImpulseRunnerEvents['unexpectedTermination']): void {
        this._lifecycleEe.on(type, handler);
        if (this._unexpectedTermination) handler(this._unexpectedTermination);
    }

    /**
     * Initialize the runner
     * This returns information about the model
     */
    async init(modelPath?: string) {
        this._stopped = false;
        this._servingRunner = undefined;
        this._unexpectedTermination = undefined;
        if (this._socketCloseTerminationTimer) {
            clearTimeout(this._socketCloseTerminationTimer);
            this._socketCloseTerminationTimer = undefined;
        }
        const startupDeadline = this._startupTimeoutMs === undefined ?
            undefined : Date.now() + this._startupTimeoutMs;
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
            let spawnError: Error | undefined;

            this._runner.once('error', error => {
                spawnError = error;
            });

            const child = this._runner;
            if (!child) {
                throw new Error('Runner process was not created');
            }
            child.on('exit', (code, signal) => {
                exitCode = code;
                if (this._socketCloseTerminationTimer) {
                    clearTimeout(this._socketCloseTerminationTimer);
                    this._socketCloseTerminationTimer = undefined;
                }
                if (typeof code === 'number' && code !== 0) {
                    this._runnerEe.emit('error', 'Runner has exited with code ' + code);
                }
                if (!this._stopped) {
                    this.rejectPendingSends(`Process exited with ${code}`);
                }
                const terminatedWhileServing = this._servingRunner === child;
                if (this._runner === child) {
                    this._runner = undefined;
                    this._helloResponse = undefined;
                }
                if (terminatedWhileServing) {
                    this._servingRunner = undefined;
                    if (!this._stopped) {
                        this.recordUnexpectedTermination({ code, signal });
                    }
                }
            });

            const socketWaitStarted = Date.now();
            const socketDeadline = Math.min(
                startupDeadline ?? Number.POSITIVE_INFINITY,
                socketWaitStarted + RUNNER_SOCKET_TIMEOUT_MS
            );
            while (!spawnError && typeof exitCode === 'undefined' && !await this.exists(socketPath) &&
                Date.now() < socketDeadline) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            if (spawnError) {
                throw new Error(`Failed to start runner: ${spawnError.message}`);
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
            if (!await this.exists(socketPath)) {
                const waitedSeconds = Math.ceil((socketDeadline - socketWaitStarted) / 1000);
                throw new Error(`Runner did not create its socket within ${waitedSeconds} seconds`);
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
            if (!this._stopped) {
                this.rejectPendingSends(error.message || error.toString());
            }
        });
        this._socket.on('close', () => {
            if (!this._stopped) {
                this.rejectPendingSends('Runner socket closed');
                if (this._servingRunner) {
                    const servingRunner = this._servingRunner;
                    if (!this._socketCloseTerminationTimer) {
                        this._socketCloseTerminationTimer = setTimeout(() => {
                            this._socketCloseTerminationTimer = undefined;
                            if (!this._stopped && this._servingRunner === servingRunner) {
                                this.recordUnexpectedTermination({
                                    code: servingRunner.exitCode,
                                    signal: servingRunner.signalCode,
                                });
                            }
                        }, SOCKET_CLOSE_EXIT_GRACE_PERIOD_MS);
                    }
                }
                else if (!this._runner) {
                    // An externally managed socket has no child process that can provide richer details.
                    this.recordUnexpectedTermination({ code: null, signal: null });
                }
            }
        });

        await this.withStartupDeadline(new Promise((resolve, reject) => {
            this._socket?.once('connect', resolve);
            this._socket?.once('error', reject);

            setTimeout(() => {
                reject('Timeout when connecting to ' + socketPath);
            }, 10000);
        }), startupDeadline);

        let helloResp = await this.withStartupDeadline(this.sendHello(), startupDeadline);

        if (this.shouldWarmGpu(helloResp)) {
            await this.withStartupDeadline(this.runTensorRTWarmup(helloResp.modelParameters), startupDeadline);
        }

        const servingRunner = this._runner;
        if (!isSocket && (!servingRunner || servingRunner.exitCode !== null || servingRunner.signalCode !== null)) {
            throw new Error('Runner process exited before initialization completed');
        }
        this._servingRunner = servingRunner;
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
        this._servingRunner = undefined;
        if (this._socketCloseTerminationTimer) {
            clearTimeout(this._socketCloseTerminationTimer);
            this._socketCloseTerminationTimer = undefined;
        }
        this.rejectPendingSends('Runner stopped');
        this._socket?.removeAllListeners();
        this._socket?.destroy();
        this._socket = undefined;
        this.releaseSharedMemory();

        const child = this._runner;
        if (!child) {
            await this.cleanupTempDirAsync();
            process.removeListener('exit', this._processExitHandler);
            return Buffer.concat(this._stdout).toString('utf-8');
        }

        await new Promise<void>((resolve, reject) => {
            let settled = false;
            let forceTimer: NodeJS.Timeout | undefined;
            let finalTimer: NodeJS.Timeout | undefined;
            const finish = () => {
                if (settled) return;
                settled = true;
                if (forceTimer) clearTimeout(forceTimer);
                if (finalTimer) clearTimeout(finalTimer);
                child.off('close', finish);
                resolve();
            };
            const fail = () => {
                if (settled) return;
                settled = true;
                if (forceTimer) clearTimeout(forceTimer);
                child.off('close', finish);
                reject(new Error(`Runner process ${child.pid || 'unknown'} did not exit after SIGKILL`));
            };
            child.once('close', finish);

            if (child.exitCode !== null || child.signalCode !== null || !child.pid) {
                finish();
                return;
            }

            child.kill('SIGINT');
            forceTimer = setTimeout(() => child.kill('SIGKILL'), STOP_GRACE_PERIOD_MS);
            finalTimer = setTimeout(() => {
                if (child.exitCode !== null || child.signalCode !== null) finish();
                else fail();
            }, STOP_GRACE_PERIOD_MS + STOP_FORCE_PERIOD_MS);
        });
        if (this._runner === child) this._runner = undefined;

        await this.cleanupTempDirAsync();
        // Detach only after cleanup is confirmed; a failed stop retains process-exit ownership.
        process.removeListener('exit', this._processExitHandler);

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

    async setLearnBlockThreshold(obj: SetRunnerBlockThreshold) {
        return await this.send<RunnerSetThresholdRequest, RunnerSetThresholdResponse>({
            set_threshold: obj,
        });
    }

    /**
     * Set a parameter for the model
     * @param parameters An object containing the parameters to set
     */
    async setParameter(parameters: { [key: string]: number | string | boolean }) {
        const resp = await this.send<{ set_parameter: typeof parameters }, RunnerSetThresholdResponse>({
            set_parameter: parameters
        });
        console.log(PREFIX, 'Sending parameters: ', parameters);
        console.log(PREFIX, 'Set parameter response', resp);
        if (!resp.success) {
            throw new Error(resp.error);
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

        this.releaseSharedMemory();

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
                        let mapping;
                        try {
                            mapping = libcWrapper.mmapToArrayBuffer(fd, resp.features_shm.size_bytes);
                        }
                        catch (error) {
                            libcWrapper.close(fd);
                            throw error;
                        }

                        this._inputShm = {
                            libc: libcWrapper,
                            fd: fd,
                            ...mapping,
                        };

                        if (this._verbose) {
                            console.log(PREFIX, `Initialized shared memory (input features) (${resp.features_shm.name})`);
                        }
                    }

                    if (resp.freeform_output_shm) {
                        this._freeformOutputShm = [];
                        for (const outputShm of resp.freeform_output_shm || []) {
                            const fd = libcWrapper.shmOpen(outputShm.name, O_RDWR, 0o666);
                            let mapping;
                            try {
                                mapping = libcWrapper.mmapToArrayBuffer(fd, outputShm.size_bytes);
                            }
                            catch (error) {
                                libcWrapper.close(fd);
                                throw error;
                            }

                            this._freeformOutputShm.push({
                                index: outputShm.index,
                                libc: libcWrapper,
                                fd: fd,
                                ...mapping,
                                features: new Float32Array(mapping.buf, 0, outputShm.elements),
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
                300_000 : // valgrind takes its time (esp on x86)
                60_000;

            let timeout = typeof timeoutArg === 'number' ? timeoutArg : defaultTimeout;

            if (!this._socket) {
                console.trace('Runner is not initialized (runner.send)');
                return reject('Runner is not initialized');
            }

            let msgId = ++this._id;

            const body = JSON.stringify(Object.assign(msg, {
                id: msgId
            }));

            let timer: NodeJS.Timeout;
            const rejectSend = (error: string) => {
                clearTimeout(timer);
                this._runnerEe.off('message', onData);
                this._pendingSends.delete(msgId);
                reject(error);
            };
            const resolveSend = (response: U) => {
                clearTimeout(timer);
                this._runnerEe.off('message', onData);
                this._pendingSends.delete(msgId);
                resolve(response);
            };
            const onData = (resp: { id: number }) => {
                if (resp.id === msgId) resolveSend(<U><unknown>resp);
            };

            this._runnerEe.on('message', onData);
            this._pendingSends.set(msgId, rejectSend);
            timer = setTimeout(() => rejectSend(`No response within ${timeout / 1000} seconds:\n\n` +
                Buffer.concat(this._stdout).toString('utf-8')), timeout);
            this._socket.write(body + '\n', error => {
                if (error) rejectSend(error.message);
            });
        });
    }

    /** Rejects every request still owned by this runner and removes its response listeners. */
    private rejectPendingSends(error: string): void {
        for (const reject of Array.from(this._pendingSends.values())) {
            reject(error);
        }
    }

    /** Records one terminal outcome so process owners cannot miss it while taking ownership. */
    private recordUnexpectedTermination(termination: LinuxImpulseRunnerUnexpectedTermination): void {
        if (this._unexpectedTermination) return;
        this._unexpectedTermination = termination;
        this._lifecycleEe.emit('unexpectedTermination', termination);
    }

    /** Applies the configured whole-startup deadline to one startup stage. */
    private async withStartupDeadline<T>(operation: Promise<T>, deadline: number | undefined): Promise<T> {
        if (deadline === undefined) return operation;
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) throw new Error('Runner startup timed out');
        let timer: NodeJS.Timeout | undefined;
        try {
            return await Promise.race([
                operation,
                new Promise<T>((_resolve, reject) => {
                    timer = setTimeout(() => reject(new Error('Runner startup timed out')), remainingMs);
                }),
            ]);
        }
        finally {
            if (timer) clearTimeout(timer);
        }
    }

    /** Unmaps and closes all shared-memory resources owned by this runner. */
    private releaseSharedMemory(): void {
        const mappings = [
            ...(this._inputShm ? [ this._inputShm ] : []),
            ...(this._freeformOutputShm || []),
        ];
        this._inputShm = undefined;
        this._freeformOutputShm = undefined;
        for (const mapping of mappings) {
            try {
                mapping.libc.munmap(mapping.address, mapping.size);
            }
            catch {
                // Continue closing the descriptor even if the mapping was already released.
            }
            try {
                mapping.libc.close(mapping.fd);
            }
            catch {
                // Cleanup is best effort during process shutdown.
            }
        }
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
