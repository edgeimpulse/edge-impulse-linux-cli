/**
 * Exercise real Hello negotiation, reconnect handlers and summary delivery without a server.
 * Sockets and device/API lookups are simulated; the stream cases use real monitoring and file storage.
 * Policy support controls cadence independently of the capability that permits telemetry transmission.
 */
import assert from 'assert';
import { EventEmitter } from 'events';
import { RemoteMgmt } from '../cli-common/remote-mgmt-service';
import { MonitoringSummaryPolicy } from '../shared/device-protocol/remote-management';
import { InferenceMetrics, ModelMonitor } from '../cli-common/model-monitor';
import { MgmtInterfaceInferenceInfo } from '../shared/MgmtInterfaceTypes';
import { MonitoringClock, monitoringFixture, monitoringModel, monitoringResult } from './monitoring-fixture';

/** Outbound protocol fields inspected by these tests; not a replacement for the full wire contract. */
type SentMessage = {
    hello?: { mode: string, supportsMonitoringSummaryPolicy?: boolean, inferenceInfo?: MgmtInterfaceInferenceInfo };
    inferenceSummary?: InferenceMetrics;
    modelUpdateSuccess?: boolean;
};

/** Capture outgoing JSON and let tests deliver socket events in a chosen order, without networking. */
class MonitoringSocket extends EventEmitter {
    readonly sent: SentMessage[] = [];
    /** Decode the actual outgoing payload so assertions observe what RemoteMgmt sends. */
    send(data: string | Buffer): void { this.sent.push(JSON.parse(data.toString())); }
    /** No-op: these tests exercise policy requests, not network ping/pong delivery. */
    ping(): void { /* No network in protocol tests. */ }
    /** Trigger the production close handler, including its reconnect scheduling. */
    close(): void { this.emit('close'); }
    /** Treat forced termination as closure; there is no underlying connection to destroy. */
    terminate(): void { this.close(); }
}

/**
 * Attach real RemoteMgmt methods to a monitor, substituting sockets and device/API responses.
 * Skip the constructor's perpetual ping interval, as the existing protocol tests do. The caller
 * must disconnect and dispose the monitor; create a new harness if the monitor itself is restarted.
 */
function monitoringRemote(monitor: ModelMonitor) {
    const sockets: MonitoringSocket[] = [];
    // As in the existing protocol test, use real methods but avoid the constructor's perpetual ping timer.
    const remote = Object.assign(Object.create(RemoteMgmt.prototype), {
        _projectId: 1, _isConnected: false, _devKeys: { apiKey: 'test' }, _monitor: monitor,
        _eiConfig: { command: 'test', endpoints: { internal: { api: 'http://localhost/v1', ws: 'ws://localhost' } } },
        _createWebsocket: () => {
            const socket = new MonitoringSocket();
            sockets.push(socket);
            return socket;
        },
        _device: { connected: () => true, beforeConnect: async () => undefined,
            getDeviceId: async () => 'device', getDeviceType: async () => 'test', getConnectionType: () => 'ip',
            getSensors: () => [], supportsSnapshotStreaming: () => false },
        checkName: async () => 'test', getProjectInfo: async () => ({ name: 'project' }),
    }) as RemoteMgmt;
    const methods = remote as unknown as { sendHello(): Promise<void> };
    monitor.on('inference-summary', summary => remote.inferenceSummaryListener(summary));
    return {
        remote, sockets,
        /** Connect through production handlers, then send Hello explicitly instead of a network open event. */
        async connect() {
            await remote.connect(true, { projectId: 1, projectOwner: 'test', projectName: 'monitoring',
                deploymentVersion: 1, modelType: 'classification' });
            await methods.sendHello();
            return sockets[sockets.length - 1];
        },
        /** Deliver a server Hello with independently chosen telemetry and policy support, then await its handler. */
        async accept(socket: MonitoringSocket, supportsTelemetry: boolean | undefined, supportsPolicy: boolean) {
            socket.emit('message', Buffer.from(JSON.stringify({ hello: true,
                ...(supportsTelemetry === undefined ? {} :
                    { capabilities: { summaryRulesVersion: supportsTelemetry } }),
                ...(supportsPolicy ? { supportsMonitoringSummaryPolicy: true, monitoringSummaryPolicy: {
                    intervalMs: 5_000, minimumIntervalMs: 5_000, preparationWindowMs: 0, requirementsMet: true,
                } } : {}),
            })));
            // Allow the asynchronous Hello handler to finish setting connection state.
            await new Promise<void>(resolve => setImmediate(resolve));
            assert.strictEqual(remote.isConnected, true, 'Hello was accepted');
        },
        /** Send Hello on the socket created by the real scheduled reconnect callback. */
        sendHello: () => methods.sendHello(),
    };
}

describe('monitoring policy protocol', () => {
    for (const supportsPolicy of [ false, true ]) {
        const name = `handles servers ${supportsPolicy ? 'with' : 'without'} summary-policy support ` +
            'and keeps policy messages separate from record ACKs';
        it(name, async () => {
            const policies: (MonitoringSummaryPolicy | undefined)[] = [];
            const sent: { hello?: { supportsMonitoringSummaryPolicy: boolean };
                getMonitoringSummaryPolicy?: boolean }[] = [];
            const ws = Object.assign(new EventEmitter(), {
                send: (data: string) => { sent.push(JSON.parse(data)); }, ping: () => undefined,
            });
            const policy: MonitoringSummaryPolicy = { intervalMs: 5_000, minimumIntervalMs: 5_000,
                preparationWindowMs: 120_000, requirementsMet: true };
            // Use the real dispatch/Hello methods without opening sockets or installing the reconnect timer.
            const remote = Object.assign(Object.create(RemoteMgmt.prototype), {
                _ws: ws, _projectId: 1, _devKeys: { apiKey: 'test' },
                _eiConfig: { command: 'test', endpoints: { internal: { api: 'http://localhost/v1' } } },
                _device: { connected: () => true, getDeviceId: async () => 'device',
                    getDeviceType: async () => 'test', getConnectionType: () => 'ip',
                    getSensors: () => [], supportsSnapshotStreaming: () => false },
                _inferenceInfo: {},
                _monitor: { getStorageStatus: async () => undefined,
                    applySummaryPolicy: (value: MonitoringSummaryPolicy | undefined) => policies.push(value),
                    abortImpulseRecordsRequest: () => { throw new Error('policy consumed as a record ACK'); } },
                checkName: async () => 'test',
                getProjectInfo: async () => ({ name: 'project' }),
            }) as { attachWsHandlers(): void; sendHello(): Promise<void>; registerPingPong(): void };
            remote.attachWsHandlers();
            await remote.sendHello();
            assert.strictEqual(sent[0].hello?.supportsMonitoringSummaryPolicy, true);
            ws.emit('message', Buffer.from(JSON.stringify({ hello: true, serverTimestamp: 123,
                ...(supportsPolicy ? { supportsMonitoringSummaryPolicy: true, monitoringSummaryPolicy: policy } : {}),
            })));
            await new Promise(resolve => setImmediate(resolve));
            assert.deepStrictEqual(policies, [ supportsPolicy ? policy : undefined ]);
            const originalInterval = global.setInterval;
            const originalTimeout = global.setTimeout;
            try {
                global.setInterval = ((fn: () => void, delay: number) => {
                    assert.strictEqual(delay, 30_000);
                    fn();
                    return 0;
                }) as unknown as typeof setInterval;
                global.setTimeout = (() => 0) as unknown as typeof setTimeout;
                remote.registerPingPong();
            }
            finally {
                global.setInterval = originalInterval;
                global.setTimeout = originalTimeout;
            }
            assert.strictEqual(sent.some(message => message.getMonitoringSummaryPolicy), supportsPolicy);
            ws.emit('message', Buffer.from(JSON.stringify({ monitoringSummaryPolicyUpdate: { ...policy, intervalMs: 60_000 } })));
            ws.emit('message', Buffer.from(JSON.stringify({ impulseRecordAck: true, index: 1 })));
            ws.emit('message', Buffer.from(JSON.stringify({ err: 'Policy lookup failed' })));
            assert.strictEqual(policies.length, supportsPolicy ? 2 : 1);
            if (supportsPolicy) assert.strictEqual(policies[1]?.intervalMs, 60_000);
        });
    }
});

describe('monitoring telemetry transmission', () => {
    let clock: MonitoringClock;
    const input = { type: 'wav' as const, buffer: Buffer.from([ 0, 1 ]) };

    beforeEach(() => { clock = new MonitoringClock(); });
    afterEach(() => { clock.restore(); });

    for (const supportsTelemetry of [ undefined, false ]) {
        it(`does not send telemetry when support is ${supportsTelemetry}`, async () => {
            const fixture = await monitoringFixture();
            const connection = monitoringRemote(fixture.monitor);
            const warnings: string[] = [];
            const warn = console.warn;
            try {
                console.warn = (...args: Parameters<typeof console.warn>) => warnings.push(args.join(' '));
                const socket = await connection.connect();
                await connection.accept(socket, supportsTelemetry, true);
                await fixture.monitor.processResult(monitoringResult({ cat: 1 }), input);
                await fixture.monitor.flushMetrics();
                assert.strictEqual(socket.sent.some(message => message.inferenceSummary), false);
                assert.strictEqual(warnings.some(message => message.includes(
                    'Model monitoring summaries are disabled because this server does not support')), true);
            }
            finally {
                console.warn = warn;
                connection.remote.disconnect();
                await fixture.dispose();
            }
        });
    }

    /** Send one exact summary after telemetry support is negotiated, without requiring policy support. */
    it('sends telemetry after negotiation', async () => {
        const fixture = await monitoringFixture();
        const connection = monitoringRemote(fixture.monitor);
        try {
            const socket = await connection.connect();
            await fixture.monitor.processResult(monitoringResult({ beforeHello: 1 }), input);
            await fixture.monitor.flushMetrics();
            assert.strictEqual(socket.sent.some(message => message.inferenceSummary), false,
                'summaries are not sent before an accepted Hello');

            await connection.accept(socket, true, false);
            const timestamp = ++clock.now;
            await fixture.monitor.processResult(monitoringResult({ cat: 0.75, dog: 0.25 }), input);
            await fixture.monitor.flushMetrics();
            assert.deepStrictEqual(socket.sent.filter(message => message.inferenceSummary)
                .map(message => message.inferenceSummary), [{
                    rulesVersion: 2,
                    start: { index: 2, timestamp }, end: { index: 2, timestamp },
                    classificationCounter: [{ label: 'cat', value: 1 }],
                    mean: [{ label: 'cat', value: 0.75 }, { label: 'dog', value: 0.25 }],
                    standardDeviation: [{ label: 'cat', value: 0 }, { label: 'dog', value: 0 }],
                    metrics: { avg_inference_time: { dsp: 2, classification: 4 } },
                }]);
        }
        finally {
            connection.remote.disconnect();
            await fixture.dispose();
        }
    });

    /** Start a window, reconnect, and verify results on both connections close as one summary. */
    it('preserves an open window across reconnects', async () => {
        const fixture = await monitoringFixture();
        const connection = monitoringRemote(fixture.monitor);
        try {
            const old = await connection.connect();
            await connection.accept(old, true, false);
            const timestamp = clock.now;
            await fixture.monitor.processResult(monitoringResult({ cat: 1 }), input);

            const current = await connection.connect();
            await connection.accept(current, true, false);
            clock.now++;
            await fixture.monitor.processResult(monitoringResult({ dog: 1 }), input);
            await fixture.monitor.flushMetrics();
            const summaries = current.sent.filter(message => message.inferenceSummary)
                .map(message => message.inferenceSummary!);
            assert.strictEqual(summaries.length, 1);
            assert.deepStrictEqual([ summaries[0].start, summaries[0].end ],
                [{ index: 1, timestamp }, { index: 2, timestamp: timestamp + 1 }]);
            assert.strictEqual(old.sent.some(message => message.inferenceSummary), false);
        }
        finally {
            connection.remote.disconnect();
            await fixture.dispose();
        }
    });

    /** Preserve replacement deployment metadata while disconnected and advertise it on the next Hello. */
    it('reports an offline replacement deployment on reconnect', async () => {
        const fixture = await monitoringFixture();
        const connection = monitoringRemote(fixture.monitor);
        try {
            const socket = await connection.connect();
            await connection.accept(socket, true, false);
            connection.remote.disconnect();
            await connection.remote.sendModelUpdateStatus(monitoringModel(2), true);
            clock.fireDue(clock.now + 1_000);
            await new Promise<void>(resolve => setImmediate(resolve));
            await connection.sendHello();
            const reconnected = connection.sockets[connection.sockets.length - 1];
            assert.strictEqual(reconnected.sent[0].hello?.inferenceInfo?.deploymentVersion, 2);
        }
        finally {
            connection.remote.disconnect();
            await fixture.dispose();
        }
    });
});
