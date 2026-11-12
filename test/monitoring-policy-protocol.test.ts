import assert from 'assert';
import { EventEmitter } from 'events';
import { RemoteMgmt } from '../cli-common/remote-mgmt-service';
import { MonitoringSummaryPolicy } from '../shared/device-protocol/remote-management';

describe('monitoring policy protocol', () => {
    for (const supportsPolicy of [ false, true ]) {
        it(`handles ${supportsPolicy ? 'new' : 'old'} servers and keeps policy messages separate from record ACKs`, async () => {
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
