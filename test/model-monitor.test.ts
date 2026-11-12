import assert from 'assert';
import fs from 'fs/promises';
import os from 'os';
import Path from 'path';
import { Config } from '../cli-common/config';
import { ImpulseRecord, ModelMonitor } from '../cli-common/model-monitor';
import { ModelInformation } from '../library/classifier/linux-impulse-runner-types';

describe('model monitoring summary cadence', () => {
    for (const interval of [ undefined, 5_000, 10_000, 60_000, 120_000 ]) {
        it(`starts safely with configured interval ${interval ?? 'automatic'}`, async () => {
            const storagePath = await fs.mkdtemp(Path.join(os.tmpdir(), 'mm-cadence-'));
            try {
                const config = {
                    getDeploymentVersion: async () => 1,
                    getStoragePath: async () => Path.join(storagePath, '1', '1'),
                    getDefaultStoragePath: () => storagePath,
                    getStorageMaxSizeMb: async () => undefined,
                    getStorageIndex: async () => 0,
                    getMonitorSummaryIntervalMs: async () => interval,
                } as unknown as Config;
                const model = {
                    project: { id: 1 },
                    modelParameters: {
                        model_type: 'classification', has_anomaly: 0,
                        thresholds: [{ type: 'classification', min_score: 0.5 }],
                    },
                } as unknown as ModelInformation;
                const monitor = await ModelMonitor.getModelMonitor(config, model);
                const calculator = (monitor as unknown as {
                    _metricsCalculator: { updateMetrics(record: ImpulseRecord): Promise<boolean> };
                })._metricsCalculator;
                const expectedInterval = Math.max(interval ?? 60_000, 60_000);
                for (const elapsed of [ 0, expectedInterval - 1, expectedInterval ]) {
                    const record: ImpulseRecord = {
                        timestamp: 1_000_000 + elapsed,
                        index: elapsed,
                        rawData: { type: 'wav', bufferBase64: '' },
                        impulseRecord: {
                            result: { classification: { keyword: 0.9 } },
                            timing: { dsp: 1, classification: 1, anomaly: 0 },
                            info: undefined,
                        },
                    };
                    assert.strictEqual(await calculator.updateMetrics(record), elapsed === expectedInterval);
                }
            }
            finally {
                await fs.rm(storagePath, { recursive: true, force: true });
            }
        });
    }
});


describe('adaptive model monitoring cadence', () => {
    for (const configured of [ undefined, 5_000, 10_000, 60_000 ]) {
        it(`adapts an in-flight aggregate and preserves preference ${configured}`, async () => {
            const storagePath = await fs.mkdtemp(Path.join(os.tmpdir(), 'mm-adaptive-'));
            try {
                const config = {
                    getDeploymentVersion: async () => 1,
                    getStoragePath: async () => Path.join(storagePath, '1', '1'),
                    getDefaultStoragePath: () => storagePath,
                    getStorageMaxSizeMb: async () => undefined,
                    getStorageIndex: async () => 0,
                    getMonitorSummaryIntervalMs: async () => configured,
                } as unknown as Config;
                const model = {
                    project: { id: 1 },
                    modelParameters: {
                        model_type: 'classification', has_anomaly: 0,
                        thresholds: [{ type: 'classification', min_score: 0.5 }],
                    },
                } as unknown as ModelInformation;
                const monitor = await ModelMonitor.getModelMonitor(config, model);
                const calculator = (monitor as unknown as {
                    _metricsCalculator: {
                        updateMetrics(record: ImpulseRecord): Promise<boolean>;
                        getMetrics(): { start: { index: number }; end: { index: number } };
                    };
                })._metricsCalculator;
                const policy = { intervalMs: 60_000, minimumIntervalMs: 5_000,
                    preparationWindowMs: 0, requirementsMet: true };
                monitor.applySummaryPolicy(policy);
                assert.strictEqual(monitor.effectiveSummaryIntervalMs, configured ?? 60_000);
                const update = (index: number, elapsed: number) => calculator.updateMetrics({
                    timestamp: 1_000_000 + elapsed, index,
                    rawData: { type: 'wav', bufferBase64: '' },
                    impulseRecord: { result: { classification: { keyword: 0.9 } },
                        timing: { dsp: 1, classification: 1, anomaly: 0 }, info: undefined },
                });
                assert.strictEqual(await update(0, 0), false);
                assert.strictEqual(await update(1, 4_000), false);
                monitor.applySummaryPolicy({ ...policy, intervalMs: 5_000, preparationWindowMs: 120_000 });
                assert.strictEqual(await update(2, 5_100), true);
                assert.deepStrictEqual([ calculator.getMetrics().start.index, calculator.getMetrics().end.index ],
                    [ 0, 2 ]);
                assert.strictEqual(await update(3, 5_450), false);
                monitor.applySummaryPolicy(policy);
                const slower = configured ?? 60_000;
                assert.strictEqual(await update(4, 5_450 + slower - 1), false);
                assert.strictEqual(await update(5, 5_450 + slower), true);
                assert.deepStrictEqual([ calculator.getMetrics().start.index, calculator.getMetrics().end.index ],
                    [ 3, 5 ]);
                assert.strictEqual(monitor.configuredSummaryIntervalMs, configured);
                monitor.applySummaryPolicy({ ...policy, intervalMs: NaN });
                assert.strictEqual(monitor.effectiveSummaryIntervalMs, slower, 'invalid policy preserves last cadence');
                monitor.applySummaryPolicy({ ...policy, intervalMs: 60_000, minimumIntervalMs: 60_000,
                    preparationWindowMs: 120_000, requirementsMet: false });
                assert.strictEqual(monitor.effectiveSummaryIntervalMs, 60_000);
                monitor.applySummaryPolicy(undefined);
                assert.strictEqual(monitor.effectiveSummaryIntervalMs, 60_000,
                    'a server without policy support restores the safe legacy cadence');
            }
            finally {
                await fs.rm(storagePath, { recursive: true, force: true });
            }
        });
    }
});
