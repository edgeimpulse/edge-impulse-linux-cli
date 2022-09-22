import { EdgeImpulseConfig } from "../config";
import { EventEmitter } from 'tsee';
import { spawnHelper } from "../../library/sensors/spawn-helper";
import fs from 'fs';

const BUILD_PREFIX = '\x1b[32m[BLD]\x1b[0m';

export class RunnerDownloader extends EventEmitter<{
    'build-progress': (msg: string) => void
}> {
    private _projectId: number;
    private _config: EdgeImpulseConfig;
    private _modelType: 'int8' | 'float32';
    private _forceTarget: string | undefined;

    constructor(projectId: number, modelType: 'int8' | 'float32',
                config: EdgeImpulseConfig, forceTarget: string | undefined) {
        super();

        this._projectId = projectId;
        this._config = config;
        this._modelType = modelType;
        this._forceTarget = forceTarget;
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
            // AKD1000 is target independent (Python based)
            if (fs.existsSync('/dev/akida0')) {
                downloadType = 'runner-linux-akd1000';
            }
            else if (process.arch === 'arm') {
                let uname = (await spawnHelper('uname', ['-m'])).trim();
                if (uname !== 'armv7l') {
                    throw new Error('Unsupported architecture "' + uname + '", only ' +
                        'armv7l or aarch64 supported for now');
                }

                downloadType = 'runner-linux-armv7';
            }
            else if (process.arch === 'arm64') {
                let uname = (await spawnHelper('uname', ['-m'])).trim();
                if (uname !== 'aarch64') {
                    throw new Error('Unsupported architecture "' + uname + '", only ' +
                        'armv7l or aarch64 supported for now');
                }

                if (fs.existsSync("/dev/drpai0")) {
                    downloadType = 'runner-linux-aarch64-rzv2l';
                } else {
                    downloadType = 'runner-linux-aarch64';
                }
            }
            else if (process.arch === 'x64') {
                downloadType = 'runner-linux-x86_64';
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

        let deployInfo = await this._config.api.deployment.getDeployment(
            this._projectId, downloadType, this._modelType);

        return deployInfo.hasDeployment && typeof deployInfo.version === 'number' ?
            deployInfo.version :
            null;
    }

    async downloadDeployment() {
        let downloadType = await this.getDownloadType();

        let deployInfo = await this._config.api.deployment.getDeployment(
            this._projectId, downloadType, this._modelType);

        if (!deployInfo.hasDeployment) {
            await this.buildModel(downloadType);
        }

        let deployment = await this._config.api.deployment.downloadBuild(
            this._projectId, downloadType, this._modelType);
        return deployment;
    }

    private async buildModel(downloadType: string) {
        let buildRes = await this._config.api.jobs.buildOnDeviceModelJob(this._projectId, downloadType, {
            engine: 'tflite',
            modelType: this._modelType
        });

        let jobId = buildRes.id;
        this.emit('build-progress', 'Created build job with ID ' + jobId);

        await this._config.api.runJobUntilCompletion({
            type: 'project',
            projectId: this._projectId,
            jobId: jobId
        }, d => {
            console.log(BUILD_PREFIX, d.trim());
        });
    }
}
