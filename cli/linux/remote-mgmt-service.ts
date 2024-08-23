import TypedEmitter from "typed-emitter";
import {
    MgmtInterfaceHelloResponse,
    MgmtInterfaceHelloV4,
    MgmtInterfaceInferenceInfo,
    MgmtInterfaceInferenceSummary,
    MgmtInterfaceImpulseRecordAck,
    MgmtInterfaceStartInferenceStreamRequest,
    MgmtInterfaceStopInferenceStreamRequest,
    MgmtInterfaceInferenceStreamStartedResponse,
    MgmtInterfaceInferenceStreamStoppedResponse,
    MgmtInterfaceNewModelAvailable,
    MgmtInterfaceNewModelUpdated,
    MgmtInterfaceImpulseRecordsRequest,
    MgmtInterfaceImpulseRecordsResponse,
} from "../../shared/MgmtInterfaceTypes";
import { IWebsocket } from "../iwebsocket";
import { ImpulseRecord, ImpulseRecordError, InferenceMetrics, ModelMonitor } from './model-monitor';
import { EventEmitter } from '../../shared/daemon/events';
import { ModelInformation } from "../../library";

const TCP_PREFIX = '\x1b[32m[WS ]\x1b[0m';

export interface RemoteMgmtInferenceDevice extends TypedEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void;
}>  {
    getDeviceId: () => Promise<string>;
    getDeviceType: () => string;
}

export interface RemoteMgmtConfig {
    command: 'edge-impulse-linux' | 'edge-impulse-daemon';
    endpoints: {
        internal: {
            ws: string;
            api: string;
            ingestion: string;
        };
    };
    api: {
        projects: {
            // eslint-disable-next-line max-len
            getProjectInfo(projectId: number, queryParams: { impulseId?: number }): Promise<{ success: boolean, error?: string, project: { name: string, whitelabelId: number | null } }>;
        };
        devices: {
            // eslint-disable-next-line max-len
            renameDevice(projectId: number, deviceId: string, opts: { name: string }): Promise<{ success: boolean, error?: string }>;
            // eslint-disable-next-line max-len
            createDevice(projectId: number, opts: { deviceId: string, deviceType: string, ifNotExists: boolean }): Promise<{ success: boolean, error?: string }>;
            // eslint-disable-next-line max-len
            getDevice(projectId: number, deviceId: string): Promise<{ success: boolean, error?: string, device?: { name: string; } }>;
        };
        whitelabels: {
            // eslint-disable-next-line max-len
            getWhitelabelDomain(whitelabelId: number | null): Promise<{ success: boolean, domain?: string }>;
        }
    };
}

export class RemoteMgmt extends (EventEmitter as new () => TypedEmitter<{
    authenticationFailed: () => void,
    newModelAvailable: () => void,
}>) {
    private _ws: IWebsocket | undefined;
    private _projectId: number;
    private _inferenceInfo: MgmtInterfaceInferenceInfo;
    private _devKeys: { apiKey: string, hmacKey: string };
    private _eiConfig: RemoteMgmtConfig;
    private _device: RemoteMgmtInferenceDevice;
    private _createWebsocket: (url: string) => IWebsocket;
    private _checkNameCb: (currName: string) => Promise<string>;
    private _monitor: ModelMonitor;
    private _isConnected = false;

    constructor(projectId: number,
                inferenceInfo: MgmtInterfaceInferenceInfo,
                devKeys: { apiKey: string, hmacKey: string },
                eiConfig: RemoteMgmtConfig,
                device: RemoteMgmtInferenceDevice,
                monitor: ModelMonitor,
                createWebsocket: (url: string) => IWebsocket,
                checkNameCb: (currName: string) => Promise<string>) {

        // eslint-disable-next-line constructor-super
        super();

        this._projectId = projectId;
        this._inferenceInfo = inferenceInfo;
        this._devKeys = devKeys;
        this._eiConfig = eiConfig;
        this._device = device;
        this._monitor = monitor;
        this._createWebsocket = createWebsocket;
        this._checkNameCb = checkNameCb;

        this.registerPingPong();
    }

    get isConnected() {
        return this._isConnected;
    }

    async connect(reconnectOnFailure = true) {
        console.log(TCP_PREFIX, `Connecting to ${this._eiConfig.endpoints.internal.ws}`);
        try {
            // @todo handle reconnect?
            this._ws = this._createWebsocket(this._eiConfig.endpoints.internal.ws);
            this.attachWsHandlers();
        }
        catch (ex) {
            console.error(TCP_PREFIX, 'Failed to connect to', this._eiConfig.endpoints.internal.ws, ex);
            if (reconnectOnFailure) {
                setTimeout(() => {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this.connect();
                }, 1000);
            }
            else {
                throw ex;
            }
        }
    }

    disconnect() {
        if (this._ws) {
            this._ws.terminate();
            this._isConnected = false;
        }
    }

    inferenceSummaryListener(ev: InferenceMetrics) {
        let req: MgmtInterfaceInferenceSummary = {
            inferenceSummary: {
                firstIndex: ev.firstIndex,
                lastIndex: ev.lastIndex,
                classificationCounter: ev.classificationCounter.map((counter) => {
                    return { label: counter.label, value: counter.value };
                }),
                mean: ev.mean.map((mean) => {
                    return { label: mean.label, value: mean.value };
                }),
                standardDeviation: ev.standardDeviation.map((std) => {
                    return { label: std.label, value: std.value };
                }),
                metrics: ev.metrics.map((metric) => {
                    return { name: metric.name, value: metric.value };
                }),
            }
        };
        if (this._ws) {
            this._ws.send(JSON.stringify(req));
        }
    }

    impulseRecordListener(ev: ImpulseRecord) {
        if (!this._ws) {
            return console.error(TCP_PREFIX, 'Not connected to remote management service');
        }

        this._ws.once('message', (data: Buffer) => {
            let ret = <MgmtInterfaceImpulseRecordAck>JSON.parse(data.toString('utf-8'));
            if (!ret.impulseRecordAck) {
                this._monitor.impulseDebug = false;
                console.error(TCP_PREFIX, 'Failed to send record to remote management service', ret.error);
            }
        });
        this._ws.send(JSON.stringify(ev));
    }

    impulseRecordsResponseListener(ev: ImpulseRecord | ImpulseRecordError) {
        if (!this._ws) {
            return console.error(TCP_PREFIX, 'Not connected to remote management service');
        }

        let resp: MgmtInterfaceImpulseRecordsResponse;

        if (typeof (<ImpulseRecord>ev).impulseRecord !== 'undefined') {
            resp = {
                impulseRecordsResponse: true,
                index: (<ImpulseRecord>ev).index,
                record: (<ImpulseRecord>ev).impulseRecord,
                timestamp: (<ImpulseRecord>ev).timestamp,
                rawData: (<ImpulseRecord>ev).rawData
            };
        }
        else {
            resp = {
                impulseRecordsResponse: false,
                index: (<ImpulseRecordError>ev).index,
                error: (<ImpulseRecordError>ev).error
            };
        }

        this._ws.once('message', (data: Buffer) => {
            let ret = <MgmtInterfaceImpulseRecordAck>JSON.parse(data.toString('utf-8'));
            if (!ret.impulseRecordAck) {
                this._monitor.abortImpulseRecordsRequest();
                console.error(TCP_PREFIX, 'Failed to send record to remote management service', ret.error);
            }
        });
        this._ws.send(JSON.stringify(resp));
    }

    private registerPingPong() {
        setInterval(() => {
            let myws = this._ws;
            if (myws) {
                let received = false;
                myws.ping();
                myws.once('pong', () => {
                    received = true;
                });
                setTimeout(() => {
                    if (!received && this._ws && this._ws === myws) {
                        console.log(TCP_PREFIX, 'Not received pong from server within six seconds, re-connecting');
                        this.disconnect();
                    }
                }, 6000);
            }
        }, 30000);
    }

    private attachWsHandlers() {
        if (!this._ws) {
            return console.log(TCP_PREFIX, 'attachWsHandlers called without ws instance!');
        }

        this._ws.on('message', async (data: Buffer | string) => {
            let d;
            try {
                if (typeof data === 'string') {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    d = JSON.parse(data);
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    d = JSON.parse(data.toString('utf-8'));
                }
            }
            catch (ex) {
                return;
            }
            // hello messages are handled in sendHello()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (typeof (<any>d).hello !== 'undefined') return;

            if (typeof (<MgmtInterfaceStartInferenceStreamRequest>d).startInferenceStream !== 'undefined') {
                this._monitor.impulseDebug = true;

                let resp: MgmtInterfaceInferenceStreamStartedResponse = {
                    inferenceStreamStarted: true,
                };
                if (this._ws) {
                    this._ws.send(JSON.stringify(resp));
                }
                return;
            }

            if (typeof (<MgmtInterfaceStopInferenceStreamRequest>d).stopInferenceStream !== 'undefined') {
                this._monitor.impulseDebug = false;

                let resp: MgmtInterfaceInferenceStreamStoppedResponse = {
                    inferenceStreamStopped: true,
                };
                if (this._ws) {
                    this._ws.send(JSON.stringify(resp));
                }
                return;
            }

            if (typeof (<MgmtInterfaceNewModelAvailable>d).newModelAvailable !== 'undefined') {
                console.log(TCP_PREFIX, 'New model available, requesting download');
                this.emit('newModelAvailable');
                return;
            }

            if (typeof (<MgmtInterfaceImpulseRecordsRequest>d).impulseRecordRequest !== 'undefined') {
                let req = <MgmtInterfaceImpulseRecordsRequest>d;
                this._monitor.getImpulseRecords(req.impulseRecordRequest);
                return;
            }

            // // let d = data.toString('ascii');
            // if (d.indexOf('EI_PUBLIC_IP') > -1) {
            //     d = d.replace('EI_PUBLIC_IP', ips[0].address + ':4810');
            //     data = Buffer.from(d, 'ascii');
            // }

            // console.log(TCP_PREFIX, 'Received over TCP', data.toString('ascii'));
            // serial.write(data);
        });

        this._ws.on('error', err => {
            console.error(TCP_PREFIX,
                `Error connecting to ${this._eiConfig.endpoints.internal.ws}`,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (<any>err).code || err);
        });

        this._ws.on('close', () => {
            console.log(TCP_PREFIX, 'Trying to connect in 1 second...');
            setTimeout(this.connect.bind(this), 1000);
            if (this._ws) {
                this._ws.removeAllListeners();
            }
            this._ws = undefined;
        });

        this._ws.on('open', async () => {
            // TODO: this print inteferes with selecting the sensor
            // console.log(TCP_PREFIX, `Connected to ${this._eiConfig.endpoints.internal.ws}`);

            try {
                await this.sendHello();
            }
            catch (ex2) {
                let ex = <Error>ex2;
                console.error(TCP_PREFIX,
                    'Failed to connect to remote management service', ex.message || ex.toString(),
                    'retrying in 5 seconds...');
                setTimeout(this.sendHello.bind(this), 5000);
            }
        });
    }

    async sendModelUpdateStatus(model: ModelInformation, success: boolean, error?: string) {
        if (!this._ws) return;

        let req: MgmtInterfaceNewModelUpdated;
        if (success) {
            req = {
                modelUpdateSuccess: true,
                inferenceInfo: {
                    projectId: model.project.id,
                    projectOwner: model.project.owner,
                    projectName: model.project.name,
                    deploymentVersion: model.project.deploy_version,
                    modelType: model.modelParameters.model_type,
                }
            };
        }
        else {
            req = {
                modelUpdateSuccess: false,
                error: error || 'No error message',
            };
        }

        this._ws.send(JSON.stringify(req));
    }

    private async sendHello() {
        if (!this._ws) return;

        let deviceId = await this._device.getDeviceId();
        let storageStatus = await this._monitor.getStorageStatus();

        let req: MgmtInterfaceHelloV4 = {
            hello: {
                version: 4,
                apiKey: this._devKeys.apiKey,
                deviceId: deviceId,
                deviceType: this._device.getDeviceType(),
                connection: 'ip',
                sensors: [],
                supportsSnapshotStreaming: false,
                inferenceInfo: this._inferenceInfo,
                mode: 'inference',
                availableRecords: storageStatus
            }
        };
        this._ws.once('message', async (helloResponse: Buffer) => {
            let ret = <MgmtInterfaceHelloResponse>JSON.parse(helloResponse.toString('utf-8'));
            if (!ret.hello) {
                console.error(TCP_PREFIX, 'Failed to authenticate, API key not correct?', ret.err);
                this.emit('authenticationFailed');
                if (this._ws) {
                    this._ws.removeAllListeners();
                    this.disconnect();
                    this._ws = undefined;
                }
            }
            else {
                if (!deviceId) {
                    throw new Error('Could not read serial number for device');
                }
                // TODO: should we care about the device name here?
                // potentially we can hangup here waiting for the device name from user
                let name = await this.checkName(deviceId);

                const projectInfo = await this.getProjectInfo();
                let studioUrl = this._eiConfig.endpoints.internal.api.replace('/v1', '');
                if (projectInfo.whitelabelId) {
                    const whitelabelRes = await this._eiConfig.api.whitelabels.getWhitelabelDomain(
                        projectInfo.whitelabelId
                    );
                    if (whitelabelRes.domain) {
                        const protocol = this._eiConfig.endpoints.internal.api.startsWith('https') ? 'https' : 'http';
                        studioUrl = `${protocol}://${whitelabelRes.domain}`;
                    }
                }

                console.log(TCP_PREFIX, "Server timestamp: ", new Date(ret.serverTimestamp).toLocaleString());
                // TODO: adjust system time to server timestamp?

                console.log(TCP_PREFIX, 'Connected to Remote Management Service');
                this._isConnected = true;
                // TODO: this print inteferes with selecting the sensor
                // console.log(TCP_PREFIX, 'Device "' + name + '" is now connected to project ' +
                //     '"' + projectInfo.name + '". ' +
                //     'To connect to another project, run `' + this._eiConfig.command + ' --clean`.');
                // console.log(TCP_PREFIX,
                //     `Go to ${studioUrl}/studio/${this._projectId}/acquisition/training ` +
                //     `to build your machine learning model!`);
            }
        });
        this._ws.send(JSON.stringify(req));
    }

    private async checkName(deviceId: string) {
        try {
            let create = (await this._eiConfig.api.devices.createDevice(this._projectId, {
                deviceId: await this._device.getDeviceId(),
                deviceType: this._device.getDeviceType(),
                ifNotExists: true
            }));

            let device = (await this._eiConfig.api.devices.getDevice(this._projectId, deviceId)).device;

            let currName = device ? device.name : deviceId;
            if (currName !== deviceId) return currName;

            let newName = await this._checkNameCb(currName);

            if (newName !== currName) {
                (await this._eiConfig.api.devices.renameDevice(
                    this._projectId, deviceId, { name: newName }));
            }
            return newName;
        }
        catch (ex2) {
            let ex = <Error>ex2;
            throw ex.message || ex;
        }
    }

    private async getProjectInfo() {
        try {
            let projectBody = (await this._eiConfig.api.projects.getProjectInfo(this._projectId, { }));
            return projectBody.project;
        }
        catch (ex2) {
            let ex = <Error>ex2;
            throw ex.message || ex;
        }
    }

    private sleep(ms: number) {
        return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }
}
