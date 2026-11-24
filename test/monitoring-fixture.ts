/**
 * Shared setup for monitoring stream and protocol tests. ModelMonitor and its file storage
 * are real; model inputs, CLI configuration and time are controlled by the test. Expected summaries
 * belong in the tests, not here. Always dispose the fixture and restore the clock in cleanup.
 */
import fs from 'fs/promises';
import os from 'os';
import Path from 'path';
import { Config } from '../cli-common/config';
import { ImpulseRecord, InferenceMetrics, ModelMonitor } from '../cli-common/model-monitor';
import { ModelInformation, RunnerBlockThreshold,
    RunnerClassifyResponseSuccess } from '../library/classifier/linux-impulse-runner-types';

/**
 * Controls wall time and timeout delivery independently, so tests can choose whether a timer or
 * prediction arrives first without sleeping. Replaces globals: use only in sequential tests.
 * This is not a full Node clock; intervals and asynchronous callback completion are not controlled.
 */
export class MonitoringClock {
    now = 1_000_000;
    private readonly _now = Date.now;
    private readonly _setTimeout = global.setTimeout;
    private readonly _clearTimeout = global.clearTimeout;
    private readonly _timers = new Map<object, { at: number, callback: () => void }>();

    /** Install the clock, retaining the original globals for restore(). */
    constructor() {
        Date.now = () => this.now;
        global.setTimeout = ((callback: () => void, delay = 0) => {
            // Production timers call unref(); this fake handle has no process-lifetime effect.
            const timer = { unref: () => undefined };
            this._timers.set(timer, { at: this.now + delay, callback });
            return timer;
        }) as unknown as typeof setTimeout;
        global.clearTimeout = ((timer: object) => this._timers.delete(timer)) as unknown as typeof clearTimeout;
    }

    /**
     * Set wall time and invoke currently due callbacks in deadline order, without awaiting their
     * asynchronous work. Callers must separately await the monitoring operation they trigger.
     */
    fireDue(now: number): void {
        this.now = now;
        // Iterate a snapshot: timers created by these callbacks wait for the next fireDue() call.
        for (const [ timer, task ] of [ ...this._timers ].sort((a, b) => a[1].at - b[1].at)) {
            if (task.at <= now && this._timers.delete(timer)) task.callback();
        }
    }

    /** Restore all replaced globals and discard outstanding fake timers, including after failures. */
    restore(): void {
        Date.now = this._now;
        global.setTimeout = this._setTimeout;
        global.clearTimeout = this._clearTimeout;
        this._timers.clear();
    }
}

/** Hold a prediction or storage operation pending until the test explicitly resolves it. */
export function deferred<T>() {
    let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
    const promise = new Promise<T>(accept => resolve = accept);
    return { promise, resolve };
}

/** Build a prediction with fixed timings, so summary timing averages have known inputs. */
export function monitoringResult(classification: Record<string, number>): RunnerClassifyResponseSuccess {
    return { result: { classification }, timing: { dsp: 2, classification: 4, anomaly: 0 }, info: undefined };
}

/**
 * Build the minimal project-1 classification metadata used by monitoring tests.
 * null means that the model reported no threshold, not a zero cutoff. Tests applying local settings
 * before creating a monitor must copy the original thresholds and pass them explicitly to the fixture.
 * This is not a complete trained model.
 */
export function monitoringModel(version = 1, cutoff: number | null = 0.5): ModelInformation {
    const model = {
        project: { id: 1, owner: 'test', name: 'monitoring', deploy_version: version },
        modelParameters: {
            model_type: 'classification', has_anomaly: 0, labels: [ 'cat', 'dog' ],
            thresholds: cutoff === null ? [] : [{ id: 42, type: 'classification', min_score: cutoff }],
        },
    } as unknown as ModelInformation;
    return model;
}

/**
 * Create a real monitor with an isolated temporary storage root and in-memory CLI configuration.
 * Models must use project 1, matching the storage paths below. Records are read back from
 * production-written files; delivered summaries accumulate from the real monitor event.
 * Supply reportedThresholds explicitly if the model already contains local threshold overrides.
 * Otherwise its current thresholds stand in for the Hello snapshot, copied before monitor creation.
 * The caller must dispose() in finally, and restore any MonitoringClock separately afterwards.
 */
export async function monitoringFixture(model = monitoringModel(),
    {
        reportedThresholds = model.modelParameters.thresholds ?? [],
        configuredSummaryIntervalMs,
    }: {
        reportedThresholds?: readonly RunnerBlockThreshold[];
        configuredSummaryIntervalMs?: number;
    } = {}) {
    const thresholds = reportedThresholds.map(block => ({ ...block }));
    const root = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-monitoring-'));
    let deploymentVersion = model.project.deploy_version;
    let storagePath = Path.join(root, '1', deploymentVersion.toString());
    let nextIndex = 0;
    const config = {
        /** Read the selected deployment, which tests can change before replacing the model. */
        getDeploymentVersion: async () => deploymentVersion,
        /** Select a deployment without touching the user's CLI configuration. */
        setDeploymentVersion: async (version: number) => { deploymentVersion = version; },
        /** Read the storage directory currently selected by the production storage manager. */
        getStoragePath: async () => storagePath,
        /** Retain directory changes made during storage initialization or model replacement. */
        storeStoragePath: async (path: string) => { storagePath = path; },
        /** Keep all deployment directories inside this fixture's temporary root. */
        getDefaultStoragePath: () => root,
        /** Supply no explicit storage size limit. */
        getStorageMaxSizeMb: async () => undefined,
        /** Read the record index retained between monitor instances. */
        getStorageIndex: async () => nextIndex,
        /** Retain the production index update; tests may delay this write to exercise queue ordering. */
        storeStorageIndex: async (index: number) => { nextIndex = index; },
        /** Supply the saved cadence preference selected by this test, or automatic cadence by default. */
        getMonitorSummaryIntervalMs: async () => configuredSummaryIntervalMs,
    } as unknown as Config;
    const monitor = await ModelMonitor.getModelMonitor(config, model, { reportedThresholds: thresholds })
        .catch(async error => {
            await fs.rm(root, { recursive: true, force: true });
            throw error;
        });
    const summaries: InferenceMetrics[] = [];
    monitor.on('inference-summary', summary => summaries.push(summary));

    return {
        root, config, summaries, monitor,
        /**
         * Read a deployment's persisted records in index order, without calculating expected values.
         * Raw JPEG bytes live in separate files; record JSON contains their paths.
         */
        async saved(version = deploymentVersion) {
            const path = Path.join(root, '1', version.toString());
            const records: ImpulseRecord[] = [];
            for (const segment of await fs.readdir(path, { withFileTypes: true })) {
                if (!segment.isDirectory() || !/^\d+$/.test(segment.name)) continue;
                for (const name of await fs.readdir(Path.join(path, segment.name))) {
                    // Segment directories also contain raw image files, which are not record JSON.
                    if (!name.endsWith('.json')) continue;
                    records.push(JSON.parse(await fs.readFile(Path.join(path, segment.name, name), 'utf8')));
                }
            }
            records.sort((left, right) => left.index - right.index);
            return { records };
        },
        /** Drain/stop the monitor, remove listeners and delete only this fixture's temporary root. */
        async dispose() {
            try {
                await monitor.stop();
            }
            finally {
                monitor.removeAllListeners();
                await fs.rm(root, { recursive: true, force: true });
            }
        },
    };
}
