import { EdgeImpulseApi } from "../../sdk/studio/api";
import { EventEmitter } from 'tsee';
import { spawnHelper } from "../../library/sensors/spawn-helper";
import fs from 'fs';
import * as models from '../../sdk/studio';
import Path from 'path';
import os from 'os';

const BUILD_PREFIX = '\x1b[32m[BLD]\x1b[0m';
const RUNNER_PREFIX = '\x1b[33m[RUN]\x1b[0m';

export class RunnerDownloader extends EventEmitter<{
    'build-progress': (msg: string) => void
}> {
    private _projectId: number;
    private _impulseId: number;
    private _api: EdgeImpulseApi;
    private _modelType: 'int8' | 'float32';
    private _forceTarget: string | undefined;
    private _forceEngine: string | undefined;

    constructor(opts: {
        projectId: number,
        impulseId: number,
        modelType: 'int8' | 'float32',
        api: EdgeImpulseApi,
        forceTarget: string | undefined,
        forceEngine: string | undefined,
    }) {
        super();

        this._projectId = opts.projectId;
        this._impulseId = opts.impulseId;
        this._api = opts.api;
        this._modelType = opts.modelType;
        this._forceTarget = opts.forceTarget;
        this._forceEngine = opts.forceEngine;
    }

    async getDownloadType() {
        if (this._forceTarget) {
            return this._forceTarget;
        }

        let downloadType: string;
        if (process.platform === 'darwin') {
            if (process.arch !== 'x64' && process.arch !== 'arm64') {
                throw new Error('Unsupported architecture "' + process.arch + '", only ' +
                    'x64 or arm64 supported for now');
            }
            downloadType = 'runner-mac-x86_64';
        }
        else if (process.platform === 'linux') {
            if (process.arch === 'arm') {
                let uname = (await spawnHelper('uname', [ '-m' ])).trim();
                if (uname !== 'armv7l') {
                    throw new Error('Unsupported architecture "' + uname + '", only ' +
                        'armv7l or aarch64 supported for now');
                }

                downloadType = 'runner-linux-armv7';
            }
            else if (process.arch === 'arm64') {
                let uname = (await spawnHelper('uname', [ '-m' ])).trim();
                if (uname !== 'aarch64') {
                    throw new Error('Unsupported architecture "' + uname + '", only ' +
                        'armv7l or aarch64 supported for now');
                }

                if (fs.existsSync("/dev/drpai0")) {
                    downloadType = 'runner-linux-aarch64-rzv2l';
                }
                else if (fs.existsSync('/dev/akida0')) {
                    downloadType = 'runner-linux-aarch64-akd1000';
                }
                else if (fs.existsSync('/dev/nvhost-as-gpu')) {

                    downloadType = 'runner-linux-aarch64-jetson-orin';

                    let firmwareModel;
                    // using /proc/device-tree as recommended in user space.
                    if (fs.existsSync('/proc/device-tree/model')) {
                        firmwareModel = await fs.promises.readFile('/proc/device-tree/model', 'utf-8');
                    }

                    if ((process.env.INFERENCE_CONTAINER_JETSON_NANO === '1') ||
                        (firmwareModel && firmwareModel.indexOf('NVIDIA Jetson Nano') > -1)) {
                        downloadType = 'runner-linux-aarch64-jetson-nano';
                    }

                    if (process.env.INFERENCE_CONTAINER_JETSON_ORIN_6_0 === '1') {
                        downloadType = 'runner-linux-aarch64-jetson-orin-6-0';
                    }

                    const cudaLib = (await spawnHelper('find', [ "/usr", "-type", "f", "-name", 'libcudart.so.1[0-9]' ])).trim();
                    const nvinferLib = (await spawnHelper('find', [ "/usr", "-type", "f", "-name", 'libnvinfer.so.[7-9]' ])).trim();
                    const cudnnLib = (await spawnHelper('find', [ "/usr", "-type", "f", "-name", 'libcudnn.so.[7-9]' ])).trim();

                    if ((cudaLib.indexOf('12') > -1)
                        && (nvinferLib.indexOf('8') > -1)
                        && (cudnnLib.indexOf('8') > -1)) {
                        downloadType = 'runner-linux-aarch64-jetson-orin-6-0';
                    }

                }
                else {
                    downloadType = 'runner-linux-aarch64';
                }
            }
            else if (process.arch === 'x64') {
                if (fs.existsSync('/dev/akida0')) {
                    downloadType = 'runner-linux-aarch64-akd1000';
                }
                else {
                    downloadType = 'runner-linux-x86_64';
                }
            }
            else {
                throw new Error('Unsupported architecture "' + process.arch + '", only ' +
                    'arm supported for now');
            }
        }
        else {
            throw new Error('Unsupported platform "' + process.platform + '"');
        }
        return downloadType;
    }

    async getLastDeploymentVersion() {
        let downloadType = await this.getDownloadType();

        let deployInfo = await this._api.deployment.getDeployment(
            this._projectId, {
                type: downloadType,
                modelType: this._modelType,
                impulseId: this._impulseId,
            });

        return deployInfo.hasDeployment && typeof deployInfo.version === 'number' ?
            deployInfo.version :
            null;
    }

    async downloadDeployment() {
        let downloadType = await this.getDownloadType();

        let deployInfo = await this._api.deployment.getDeployment(
            this._projectId, {
                type: downloadType,
                modelType: this._modelType,
                impulseId: this._impulseId,
            });

        if (!deployInfo.hasDeployment) {
            await this.buildModel(downloadType);
        }

        let deployment = await this._api.deployment.downloadBuild(
            this._projectId, {
                type: downloadType,
                modelType: this._modelType,
                impulseId: this._impulseId,
            });
        return deployment;
    }

    private async buildModel(downloadType: string) {
        // list all deploy targets
        const dt = await this._api.deployment.listDeploymentTargetsForProjectDataSources(this._projectId, {
            impulseId: this._impulseId,
        });

        let deployInfo = dt.targets.find(x => x.format === downloadType);
        if (!deployInfo) {
            throw new Error('Failed to find deployment type "' + downloadType + '", types found: ' +
                JSON.stringify(dt.targets.map(x => x.format)));
        }

        let engine: models.DeploymentTargetEngine = deployInfo.preferredEngine;
        if (this._forceEngine) {
            if (!deployInfo.supportedEngines.find(x => x === this._forceEngine)) {
                throw new Error('Engine type "' + this._forceEngine + '" is not supported for ' +
                    '"' + downloadType + '", valid engines: ' + JSON.stringify(deployInfo.supportedEngines));
            }
            engine = <models.DeploymentTargetEngine>this._forceEngine;
        }

        let buildRes = await this._api.jobs.buildOnDeviceModelJob(this._projectId, {
            engine: engine,
            modelType: this._modelType,
        }, {
            type: downloadType,
            impulseId: this._impulseId,
        });

        let jobId = buildRes.id;
        this.emit('build-progress', 'Created build job with ID ' + jobId);

        await this._api.runJobUntilCompletion({
            type: 'project',
            projectId: this._projectId,
            jobId: jobId
        }, d => {
            console.log(BUILD_PREFIX, d.trim());
        });
    }
}

export class RunnerModelPath {
    private _projectId: number;
    private _impulseId: number;
    private _modelType: 'int8' | 'float32';
    private _forceTarget: string | undefined;
    private _forceEngine: string | undefined;

    constructor(opts: {
        projectId: number,
        impulseId: number,
        modelType: 'int8' | 'float32',
        forceTarget: string | undefined,
        forceEngine: string | undefined
    }) {
        this._projectId = opts.projectId;
        this._impulseId = opts.impulseId;
        this._modelType = opts.modelType;
        this._forceTarget = opts.forceTarget;
        this._forceEngine = opts.forceEngine;
    }

    getModelPath(version: number) {
        let versionId = 'v' + version;
        if (this._modelType === 'int8') {
            versionId += '-quantized';
        }
        if (this._forceTarget) {
            versionId += '-' + this._forceTarget;
        }
        if (this._forceEngine) {
            versionId += '-' + this._forceEngine;
        }

        if (this._impulseId !== 1) {
            versionId += '-impulse' + this._impulseId;
        }

        return Path.join(os.homedir(), '.ei-linux-runner', 'models', this._projectId + '',
            versionId, 'model.eim');
    }
}

function checkFileExists(file: string) {
    return new Promise(resolve => {
        return fs.promises.access(file, fs.constants.F_OK)
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
}

export async function downloadModel(opts: {
    projectId: number,
    impulseId: number,
    api: EdgeImpulseApi,
    quantizedModel: boolean,
    forcedTarget: string | undefined,
    forcedEngine: string | undefined
}): Promise<{
       modelFile: string,
       modelPath: RunnerModelPath }> {

    const { projectId, impulseId, api, quantizedModel, forcedTarget, forcedEngine } = opts;

    let modelPath: RunnerModelPath | undefined;
    let modelFile: string;

    const downloader = new RunnerDownloader({
        projectId: projectId,
        impulseId: impulseId,
        modelType: quantizedModel ? 'int8' : 'float32',
        api,
        forceTarget: forcedTarget,
        forceEngine: forcedEngine,
    });
    downloader.on('build-progress', msg => {
        console.log(BUILD_PREFIX, msg);
    });
    modelPath = new RunnerModelPath({
        projectId,
        impulseId,
        modelType: quantizedModel ? 'int8' : 'float32',
        forceTarget: forcedTarget,
        forceEngine: forcedEngine,
    });

    // no new version and already downloaded? return that model
    let currVersion = await downloader.getLastDeploymentVersion();
    if (currVersion && await checkFileExists(modelPath.getModelPath(currVersion))) {
        modelFile = modelPath.getModelPath(currVersion);
        console.log(RUNNER_PREFIX, 'Already have model', modelFile, 'not downloading...');
    }
    else {
        console.log(RUNNER_PREFIX, 'Downloading model...');

        let deployment = await downloader.downloadDeployment();
        let tmpDir = await fs.promises.mkdtemp(Path.join(os.tmpdir(), 'ei-' + Date.now()));
        tmpDir = Path.join(os.tmpdir(), tmpDir);
        await fs.promises.mkdir(tmpDir, { recursive: true });
        let ret = await downloader.getDownloadType();
        modelFile = Path.join(tmpDir, ret[0]);
        await fs.promises.writeFile(modelFile, deployment);
        await fs.promises.chmod(modelFile, 0o755);

        console.log(RUNNER_PREFIX, 'Downloading model OK');
    }

    return { modelFile, modelPath };
}
