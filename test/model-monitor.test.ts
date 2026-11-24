/**
 * Cover monitoring cadence and complete result streams using production calculators and storage.
 * Stream tests control time and delay selected record writes to check window boundaries, delivery,
 * and deployment replacement. Registry arithmetic cases live in summary-rules-fixtures.test.ts.
 */
import assert from 'assert';
import fs from 'fs/promises';
import os from 'os';
import Path from 'path';
import { Config } from '../cli-common/config';
import { ImpulseRecord, ModelMonitor } from '../cli-common/model-monitor';
import { ModelInformation } from '../library/classifier/linux-impulse-runner-types';
import { deferred, MonitoringClock, monitoringFixture, monitoringModel, monitoringResult } from './monitoring-fixture';

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
                const monitor = await ModelMonitor.getModelMonitor(config, model, {
                    reportedThresholds: model.modelParameters.thresholds ?? [],
                });
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

describe('monitoring result streams', () => {
    let clock: MonitoringClock;

    beforeEach(() => { clock = new MonitoringClock(); });
    afterEach(() => { clock.restore(); });

    const input = { type: 'wav' as const, buffer: Buffer.from([ 0, 1 ]) };
    const policy = { intervalMs: 5_000, minimumIntervalMs: 5_000,
        preparationWindowMs: 0, requirementsMet: true };

    /**
     * Feed a summary window, trigger its timer, then submit a boundary result while closure is queued.
     * Exercise result- and timer-triggered closure of the next windows. Boundary results start new
     * windows, while a late result stays retrievable without changing summaries. Idle time, repeated
     * flushes and stop add no deliveries.
     */
    it('closes an idle window once while a boundary result waits behind timer closure', async () => {
        const fixture = await monitoringFixture();
        const initialTime = clock.now;
        try {
            fixture.monitor.applySummaryPolicy(policy);
            await fixture.monitor.processResult(monitoringResult({ cat: 0.75, dog: 0.25 }), input);
            clock.now = initialTime + 4_999;
            await fixture.monitor.processResult(monitoringResult({ cat: 0.25, dog: 0.75 }), input);

            clock.fireDue(initialTime + 5_000);
            const boundary = fixture.monitor.processResult(monitoringResult({ cat: 0.5, dog: 0.5 }), input);
            await boundary;
            // Do not fire the next timer: this boundary result must itself close the previous window.
            clock.now = initialTime + 10_000;
            await fixture.monitor.processResult(monitoringResult({ cat: 0.75, dog: 0.25 }), input);
            clock.fireDue(initialTime + 15_000);
            await fixture.monitor.flushMetrics();
            clock.now = initialTime + 14_999;
            await fixture.monitor.processResult(monitoringResult({ obsolete: 1 }), input);
            clock.fireDue(initialTime + 30_000);
            await fixture.monitor.flushMetrics();
            await fixture.monitor.stop();

            assert.deepStrictEqual(fixture.summaries.map(summary => [ summary.start, summary.end ]), [
                [{ index: 1, timestamp: initialTime }, { index: 2, timestamp: initialTime + 4_999 }],
                [{ index: 3, timestamp: initialTime + 5_000 },
                    { index: 3, timestamp: initialTime + 5_000 }],
                [{ index: 4, timestamp: initialTime + 10_000 },
                    { index: 4, timestamp: initialTime + 10_000 }],
            ], 'boundary results start the next summary and idle periods add no empty summaries');
            assert.deepStrictEqual(fixture.summaries.map(summary => summary.classificationCounter), [
                [{ label: 'cat', value: 1 }, { label: 'dog', value: 1 }],
                [{ label: 'cat', value: 1 }],
                [{ label: 'cat', value: 1 }],
            ]);
            const saved = await fixture.saved();
            assert.deepStrictEqual(saved.records.map(record => [ record.index, record.timestamp ]),
                [ [ 1, initialTime ], [ 2, initialTime + 4_999 ], [ 3, initialTime + 5_000 ],
                    [ 4, initialTime + 10_000 ], [ 5, initialTime + 14_999 ] ]);
            assert.deepStrictEqual(saved.records.map(record => record.impulseRecord.result.classification),
                [{ cat: 0.75, dog: 0.25 }, { cat: 0.25, dog: 0.75 }, { cat: 0.5, dog: 0.5 },
                    { cat: 0.75, dog: 0.25 }, { obsolete: 1 }],
                'late results remain retrievable but cannot modify completed summaries');
        }
        finally {
            await fixture.dispose();
        }
    });

    /**
     * Stream one JPEG record live, then read the same record through retained-record delivery.
     * The live event must keep the original base64 image, while the JSON file stores a path and
     * the retained-record response loads that file back into base64.
     */
    it('keeps live JPEG data intact while storing and reloading the image file', async () => {
        const fixture = await monitoringFixture();
        const jpeg = Buffer.from([ 0xff, 0xd8, 0xff, 0xd9 ]);
        const live: ImpulseRecord[] = [];
        try {
            fixture.monitor.on('impulse-record', record => live.push(record));
            fixture.monitor.impulseDebug = true;
            await fixture.monitor.processResult(monitoringResult({ cat: 1 }), { type: 'jpg', buffer: jpeg });
            assert.strictEqual(live.length, 1);
            assert.strictEqual(live[0].rawData.bufferBase64, jpeg.toString('base64'));

            const retained = new Promise<ImpulseRecord>(resolve => {
                fixture.monitor.once('impulse-records-response', record => resolve(record as ImpulseRecord));
            });
            fixture.monitor.getImpulseRecords({ index: 1 });
            assert.strictEqual((await retained).rawData.bufferBase64, jpeg.toString('base64'));

            const saved = await fixture.saved();
            assert.strictEqual(saved.records.length, 1);
            assert.notStrictEqual(saved.records[0].rawData.bufferBase64, jpeg.toString('base64'));
            assert.strictEqual(Path.extname(saved.records[0].rawData.bufferBase64), '.jpg');
        }
        finally {
            await fixture.dispose();
        }
    });

    /**
     * Admit one result, reject a timestamp just within the backward-clock tolerance, then move farther
     * backwards. The old window must close once, the corrected timeline must accept a new result, and
     * its timer must close normally rather than repeatedly scheduling against the abandoned future grid.
     */
    it('starts a new window grid after a large backward wall-clock correction', async () => {
        const fixture = await monitoringFixture();
        const initialTime = clock.now;
        try {
            fixture.monitor.applySummaryPolicy(policy);
            await fixture.monitor.processResult(monitoringResult({ cat: 1 }), input);

            clock.now = initialTime - 10_000;
            await fixture.monitor.processResult(monitoringResult({ dog: 1 }), input);
            assert.strictEqual(fixture.summaries.length, 0, 'a slightly late result does not reset the grid');

            clock.now = initialTime - 10_001;
            await fixture.monitor.processResult(monitoringResult({ cat: 1 }), input);
            assert.deepStrictEqual(fixture.summaries.map(summary => [ summary.start.index, summary.end.index ]),
                [ [ 1, 1 ] ], 'the clock correction closes the future window without admitting late data');

            clock.fireDue(initialTime - 5_001);
            await fixture.monitor.flushMetrics();
            assert.deepStrictEqual(fixture.summaries.map(summary => [ summary.start.index, summary.end.index ]),
                [ [ 1, 1 ], [ 3, 3 ] ], 'the corrected grid closes once at its new deadline');
        }
        finally {
            await fixture.dispose();
        }
    });

    /**
     * Hold the first record's save, queue a second result and flush the deployment before replacing it.
     * Release the save and check that both accepted records contribute to the final old-model summary.
     * Replace the deployment with different original/local cutoffs and verify its own files and original cutoff,
     * retaining the reporting policy and leaving old files unchanged. A terminal stop remains terminal even if
     * deployment state is subsequently replaced, and returning to old storage does not replay prior summaries.
     */
    it('separates replacement deployment history and keeps terminal stop irreversible', async () => {
        const initialModel = monitoringModel();
        const initialThresholds = initialModel.modelParameters.thresholds ?? [];
        const fixture = await monitoringFixture(initialModel, { reportedThresholds: initialThresholds });
        const initialTime = clock.now;
        const saving = deferred<void>();
        const release = deferred<void>();
        const storeIndex = fixture.config.storeStorageIndex.bind(fixture.config);
        try {
            fixture.monitor.applySummaryPolicy(policy);
            // Pause the first record's index write so the second admission and flush queue behind it.
            fixture.config.storeStorageIndex = async index => {
                saving.resolve();
                await release.promise;
                await storeIndex(index);
            };
            const first = fixture.monitor.processResult(monitoringResult({ cat: 0.75, dog: 0.25 }), input);
            await saving.promise;
            clock.now++;
            const second = fixture.monitor.processResult(monitoringResult({ cat: 0.25, dog: 0.75 }), input);
            const flushed = fixture.monitor.flushMetrics();
            release.resolve();
            await Promise.all([ first, second, flushed ]);
            assert.strictEqual(fixture.summaries.length, 1);
            const old = await fixture.saved(1);
            assert.deepStrictEqual(old.records.map(record => record.index), [ 1, 2 ]);

            const replacement = monitoringModel(2, 0.8);
            const reportedThresholds = replacement.modelParameters.thresholds!.map(block => ({ ...block }));
            replacement.modelParameters.thresholds![0].min_score = 0.1;
            await fixture.config.setDeploymentVersion(2);
            await fixture.monitor.replaceModel(fixture.config, replacement, { reportedThresholds });
            assert.strictEqual(fixture.monitor.effectiveSummaryIntervalMs, 5_000, 'replacement retains the policy');
            clock.now = initialTime + 10_000;
            await fixture.monitor.processResult(monitoringResult({ cat: 0.75, dog: 0.25 }), input);
            await fixture.monitor.flushMetrics();
            assert.strictEqual(fixture.summaries.length, 2);
            assert.deepStrictEqual(fixture.summaries[1].classificationCounter, [{ label: 'no prediction', value: 1 }]);
            const current = await fixture.saved(2);
            assert.strictEqual(current.records.length, 1);
            assert.deepStrictEqual(await fixture.saved(1), old, 'replacement does not rewrite old deployment files');

            // Returning to a prior deployment must not replay summaries delivered earlier in this session.
            await fixture.config.setDeploymentVersion(1);
            const replacing = fixture.monitor.replaceModel(fixture.config, initialModel, {
                reportedThresholds: initialThresholds,
            });
            const stopped = fixture.monitor.stop();
            await Promise.all([ replacing, stopped ]);
            await fixture.monitor.processResult(monitoringResult({ discarded: 1 }), input);
            assert.strictEqual(fixture.summaries.length, 2);
            assert.deepStrictEqual(await fixture.saved(1), old);
        }
        finally {
            // Failure cleanup must also unblock the queue before stopping the monitor.
            release.resolve();
            fixture.config.storeStorageIndex = storeIndex;
            await fixture.dispose();
        }
    });
});


describe('adaptive model monitoring cadence', () => {
    for (const configured of [ undefined, 5_000, 10_000, 60_000 ]) {
        it(`adapts an in-flight aggregate and preserves preference ${configured ?? 'automatic'}`, async () => {
            const clock = new MonitoringClock();
            const fixture = await monitoringFixture(monitoringModel(), {
                configuredSummaryIntervalMs: configured,
            });
            const initialTime = clock.now;
            const input = { type: 'wav' as const, buffer: Buffer.from([ 0, 1 ]) };
            const policy = { intervalMs: 60_000, minimumIntervalMs: 5_000,
                preparationWindowMs: 0, requirementsMet: true };
            try {
                fixture.monitor.applySummaryPolicy(policy);
                assert.strictEqual(fixture.monitor.effectiveSummaryIntervalMs, configured ?? 60_000);
                await fixture.monitor.processResult(monitoringResult({ cat: 0.9 }), input);
                clock.now = initialTime + 4_000;
                await fixture.monitor.processResult(monitoringResult({ cat: 0.9 }), input);

                fixture.monitor.applySummaryPolicy({
                    ...policy,
                    intervalMs: 5_000,
                    preparationWindowMs: 120_000,
                });
                clock.now = initialTime + 5_000;
                await fixture.monitor.processResult(monitoringResult({ cat: 0.9 }), input);
                assert.deepStrictEqual(fixture.summaries.map(summary => [ summary.start.index, summary.end.index ]),
                    [ [ 1, 2 ] ], 'the boundary result starts the accelerated window');

                const slower = configured ?? 60_000;
                fixture.monitor.applySummaryPolicy(policy);
                assert.strictEqual(fixture.monitor.effectiveSummaryIntervalMs, slower);
                clock.now = initialTime + 5_000 + slower - 1;
                await fixture.monitor.processResult(monitoringResult({ cat: 0.9 }), input);
                clock.now = initialTime + 5_000 + slower;
                await fixture.monitor.processResult(monitoringResult({ cat: 0.9 }), input);
                assert.deepStrictEqual(fixture.summaries.map(summary => [ summary.start.index, summary.end.index ]),
                    [ [ 1, 2 ], [ 3, 4 ] ], 'the relaxed cadence keeps the established window grid');

                assert.strictEqual(fixture.monitor.configuredSummaryIntervalMs, configured);
                fixture.monitor.applySummaryPolicy({ ...policy, intervalMs: NaN });
                assert.strictEqual(fixture.monitor.effectiveSummaryIntervalMs, slower,
                    'invalid policy preserves last cadence');
                fixture.monitor.applySummaryPolicy({ ...policy, intervalMs: 60_000, minimumIntervalMs: 60_000,
                    preparationWindowMs: 120_000, requirementsMet: false });
                assert.strictEqual(fixture.monitor.effectiveSummaryIntervalMs, 60_000);
                fixture.monitor.applySummaryPolicy(undefined);
                assert.strictEqual(fixture.monitor.effectiveSummaryIntervalMs, 60_000,
                    'a server without policy support restores the conservative cadence');
            }
            finally {
                await fixture.dispose();
                clock.restore();
            }
        });
    }
});
