import { EdgeImpulseConfig } from "../config";
import WebSocket from 'ws';
import { EventEmitter } from 'tsee';
import { spawnHelper } from "../../library/sensors/spawn-helper";

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
            if (process.arch !== 'x64') {
                throw new Error('Unsupported architecture "' + process.arch + '", only ' +
                    'x64 supported for now');
            }
            downloadType = 'runner-mac-x86_64';
        }
        else if (process.platform === 'linux') {
            if (process.arch === 'arm') {
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

                downloadType = 'runner-linux-aarch64';
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

        let deployInfo = await this._config.api.deploy.getDeployment(
            this._projectId, downloadType, this._modelType);

        if (!deployInfo.body.success) {
            throw deployInfo.body.error;
        }

        return deployInfo.body.hasDeployment && typeof deployInfo.body.version === 'number' ?
            deployInfo.body.version :
            null;
    }

    async downloadDeployment() {
        let downloadType = await this.getDownloadType();

        let deployInfo = await this._config.api.deploy.getDeployment(
            this._projectId, downloadType, this._modelType);

        if (!deployInfo.body.success) {
            throw deployInfo.body.error;
        }

        if (!deployInfo.body.hasDeployment) {
            await this.buildModel(downloadType);
        }

        let deployment = await this._config.api.deploy.downloadBuild(
            this._projectId, downloadType, this._modelType);
        return deployment.body;
    }

    private async buildModel(downloadType: string) {
        let ws = await this.getWebsocket();

        let buildRes = await this._config.api.jobs.buildOnDeviceModelJob(this._projectId, downloadType, {
            engine: 'tflite',
            modelType: this._modelType
        });
        if (!buildRes.body.success) {
            throw new Error(buildRes.body.error);
        }

        let jobId = buildRes.body.id;
        this.emit('build-progress', 'Created build job with ID ' + jobId);

        let allData: string[] = [];

        let p = new Promise<void>((resolve2, reject2) => {
            let pingIv = setInterval(() => {
                ws.send('2');
            }, 25000);

            let checkJobStatusIv = setInterval(async () => {
                try {
                    let status = await this._config.api.jobs.getJobStatus(this._projectId, jobId);
                    if (!status.body.success || !status.body.job) {
                        // tslint:disable-next-line: no-unsafe-any
                        throw new Error(status.body.error || (<any>status.response).toString());
                    }
                    if (status.body.job.finished) {
                        if (status.body.job.finishedSuccessful) {
                            clearInterval(checkJobStatusIv);
                            resolve2();
                        }
                        else {
                            clearInterval(checkJobStatusIv);
                            reject2('Failed to build binary');
                        }
                    }
                }
                catch (ex2) {
                    let ex = <Error>ex2;
                    console.warn(BUILD_PREFIX, 'Failed to check job status', ex.message || ex.toString());
                }
            }, 3000);

            ws.onmessage = (msg) => {
                let data = <string>msg.data;
                try {
                    let m = <any[]>JSON.parse(data.replace(/^[0-9]+/, ''));
                    if (m[0] === 'job-data-' + jobId) {
                        // tslint:disable-next-line: no-unsafe-any
                        this.emit('build-progress', ((<any>m[1]).data).trim());
                        allData.push(<string>(<any>m[1]).data);
                    }
                    else if (m[0] === 'job-finished-' + jobId) {
                        let success = (<any>m[1]).success;
                        // console.log(BUILD_PREFIX, 'job finished', success);
                        if (success) {
                            clearInterval(checkJobStatusIv);
                            resolve2();
                        }
                        else {
                            clearInterval(checkJobStatusIv);
                            reject2('Failed to build binary');
                        }
                    }
                }
                catch (ex) {
                    // console.log(BUILD_PREFIX, 'Failed to parse', data);
                }
            };

            ws.onclose = async () => {
                reject2('Websocket was closed');
                clearInterval(pingIv);
            };

            setTimeout(() => {
                reject2('Building did not succeed within 5 minutes: ' + allData.join(''));
            }, 300000);
        });

        p.then(() => {
            ws.close();
        }).catch((err) => {
            ws.close();
        });

        return p;
    }

    private async getWebsocket() {
        let token = await this._config.api.projects.getSocketToken(this._projectId);
        if (!token.body.success || !token.body.token) {
            throw new Error(token.body.error);
        }

        let ws = new WebSocket(this._config.endpoints.internal.apiWs +
            '/socket.io/?token=' + token.body.token.socketToken + '&EIO=3&transport=websocket');

        return new Promise<WebSocket>((resolve, reject) => {
            let pingInterval: NodeJS.Timeout | undefined;

            ws.onopen = () => {
                // console.log('websocket is open');
                pingInterval = setInterval(() => {
                    ws.ping();
                }, 3000);
            };
            ws.onclose = () => {
                reject('websocket was closed');
                if (pingInterval) {
                    clearInterval(pingInterval);
                }
            };
            ws.onerror = err => {
                reject('websocket error: ' + (err.message || err.toString()));
            };
            ws.onmessage = msg => {
                let data = <string>msg.data;
                try {
                    let m = <any[]>JSON.parse(data.replace(/^[0-9]+/, ''));
                    if (m[0] === 'hello') {
                        // tslint:disable-next-line: no-unsafe-any
                        if (m[1].hello && m[1].hello.version === 1) {
                            resolve(ws);
                        }
                        else {
                            reject(JSON.stringify(m[1]));
                        }
                    }
                }
                catch (ex) {
                    // first message is numeric, so let's skip that
                    if (isNaN(Number(data))) {
                        this.emit('build-progress', 'Failed to parse websocket message: ' + data);
                    }
                }
            };

            setTimeout(() => {
                reject('Did not authenticate with the websocket API within 10 seconds');
            }, 10000);
        });
    }
}
