import fs from 'fs/promises';
import { MonitoringSummaryPolicy } from '../shared/device-protocol/remote-management';
import Path from 'path';
import { Config } from './config';
import { RunnerClassifyResponseSuccess, ModelInformation, RunnerHelloHasAnomaly, RunnerBlockThreshold } from "../library/classifier/linux-impulse-runner-types";
import { EventEmitter } from 'tsee';
import { MgmtInterfaceImpulseRecordRawData, MgmtInterfaceInferenceSummary } from '../shared/MgmtInterfaceTypes';

// Use the conservative cadence until the server confirms that faster summaries can be ingested.
export const DEFAULT_MONITOR_SUMMARY_INTERVAL_MS = 60_000;
export const MIN_MONITOR_SUMMARY_INTERVAL_MS = 5_000;
const MONITOR_PREFIX = '\x1b[34m[MON]\x1b[0m';
const NO_SUMMARY_POLICY = 'no-policy';
const CLOCK_BACK_LIMIT_MS = 10_000;

const SUMMARY_CLOSE_RETRY_MS = 1000;

/** Return whether the path is accessible; inaccessible paths are treated as absent. */
function checkFileExists(file: string) {
    return new Promise(resolve => {
        return fs.access(file, fs.constants.F_OK)
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
}

/** Limit concurrent iterator calls while collecting their results in input order. */
async function asyncPool<IN, OUT>(poolLimit: number, array: ReadonlyArray<IN>,
    iteratorFn: (generator: IN) => Promise <OUT>): Promise<OUT[]> {
    const ret = [];
    const executing: Promise<OUT>[] = [];
    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (poolLimit <= array.length) {
            const e = <Promise<OUT>>p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

/**
 * Helper to check if the model has visual AD capabilities based on its parameters.
*/
export function hasVisualAd(model: Pick<MonitoredModel, 'modelParameters'>) {
    return [
        RunnerHelloHasAnomaly.VisualGMM,
        RunnerHelloHasAnomaly.VisualPatchcore,
        RunnerHelloHasAnomaly.VisualCustom
    ].includes(model.modelParameters.has_anomaly);
}

export type ImpulseRecord = {
    impulseRecord: RunnerClassifyResponseSuccess;
    timestamp: number;
    index: number;
    rawData: MgmtInterfaceImpulseRecordRawData;
};

export type ImpulseRecordError = {
    index: number;
    error: string;
};

export type StorageStatus = {
    firstIndex: number;
    firstTimestamp: number;
    lastIndex: number;
    lastTimestamp: number;
};

export type MetricsWindowBoundary = {
    index: number;
    timestamp: number;
};

export type InferenceMetrics = MgmtInterfaceInferenceSummary['inferenceSummary'];

/** Model metadata plus the original threshold snapshot used to calculate inference summaries. */
export type MonitoredModel = {
    modelParameters: Pick<ModelInformation['modelParameters'], 'model_type' | 'has_anomaly' | 'thresholds'>;
    // An empty snapshot means the model reported no thresholds; local runner defaults are not substituted.
    reportedThresholds: readonly RunnerBlockThreshold[];
};

/**
 * The part of the configuration that the metrics calculator reads.
 */
export interface MetricsConfig {
    getMonitorSummaryIntervalMs(): Promise<number | undefined>;
}

/**
 * Stores monitoring records by project/deployment. Records use indexed segments;
 * JPEG inputs are separate files, WAV inputs stay inline, and segment cleanup limits record storage.
 */
class StorageManager {
    private _storagePath: string = '';
    private _config: Config;
    private _model: ModelInformation;
    private _storageIndex: number = 0;
    private _isUpdatingStorageIndex: boolean = false;
    private _firstIndex: number = Number.MAX_SAFE_INTEGER;
    // this limits the number of records in a single directory
    private _storageIndexSegment: number = 1000;
    private _storageSizeMaxBytes: number = 250 * 1024 * 1024;
    private _storageSize: number = 0;
    // when the monitor stores the record, storage manager checks if the storage size
    // is above the limit, if it is, it will remove the oldest segment
    // beacues of that feature, it is important to configure segement size and storage limit
    // on a propers level (depending on ther record size and the number of records per second)
    // so there will be more than one segment in the storage

    /** Open the deployment's storage and recover its record bounds and tracked byte usage. */
    static async getStorageManager(conf: Config, model: ModelInformation) {
        let storageManager = new StorageManager(conf, model);
        await storageManager.initialize();
        return storageManager;
    }

    /** Retain configuration and model identity; the factory performs asynchronous storage setup. */
    private constructor(conf: Config, model: ModelInformation) {
        this._config = conf;
        this._model = model;
    }

    /** Find record-index bounds from numeric JSON filenames, returning zero bounds when none exist. */
    private async getHighestAndLowestIndexes(path: string): Promise<{ highest: number, lowest: number }> {
        let highest = 0;
        let lowest = Number.MAX_SAFE_INTEGER;

        // get a list of all json files in the storage directory
        let files = await fs.readdir(path);

        // filter out non-json files
        files = files.filter(file => file.endsWith('.json'));

        // filter out files that don't have a number as the name
        files = files.filter(file => !isNaN(Number(Path.basename(file, '.json'))));

        // find the highest and lowest indexes
        for (const file of files) {
            const index = Number(Path.basename(file, '.json'));
            if (index > highest) {
                highest = index;
            }
            if (index < lowest) {
                lowest = index;
            }
        }
        if (lowest === Number.MAX_SAFE_INTEGER) {
            lowest = 0;
        }

        return { highest, lowest };
    }

    /** Resolve a record's segment directory and create it if needed. */
    private async getPathByIndex(index: number): Promise<string> {
        const segment = Math.floor(index / this._storageIndexSegment);
        const path = Path.join(this._storagePath, segment.toString());

        if (await checkFileExists(path) === false) {
            await fs.mkdir(path, { recursive: true });
        }
        return path;
    }

    /** Sum file sizes recursively for storage accounting. */
    private async getStorageSize(path: string = this._storagePath): Promise<number> {

        const dirSize = async (dir: string) => {
            const files = await fs.readdir(dir, { withFileTypes: true });
            // create a list of promises that will return the size of each file
            const sizesPromiseArr: Promise<number>[] = files.map( async file => {
                const filePath = Path.join( dir, file.name );
                // if the file is a directory, then call the dirSize function recursively
                if (file.isDirectory()) return await dirSize(filePath);
                if (file.isFile()) return (await fs.stat(filePath)).size;
                // for any other types return 0 bytes size
                return 0;
            });
            // wait for all promises to resolve
            const sizesArr = (await asyncPool(10, sizesPromiseArr, async (fileSize) => {
                return await fileSize;
            })).flat();

            return sizesArr.reduce((acc, size) => acc + size, 0);
        };

        return await dirSize(path);
    }

    /** Select deployment storage, create directories, and recover indexes and usage from disk. */
    private async initialize(): Promise<void> {
        const modelProjectId = this._model.project.id;
        const deploymentVersion = await this._config.getDeploymentVersion();

        // We store inference records in a directory structure based on the model project ID
        // and deployment version.
        // TODO[MM] Verify that the deployment version is actually always set, since the
        // type system suggests otherwise.
        const currentStoragePath = await this._config.getStoragePath();
        const expectedStoragePath = Path.join(
            this._config.getDefaultStoragePath(),
            modelProjectId.toString(),
            deploymentVersion?.toString() ?? '',
        );

        if (currentStoragePath !== expectedStoragePath) {
            this._storagePath = expectedStoragePath;

            await this._config.storeStoragePath(this._storagePath);
        }
        else {
            this._storagePath = currentStoragePath;
        }

        // If a storage max size is set in config, use it (in MB, converted to bytes). Otherwise, use the default.
        // TODO[MM] Consider if a minimum/maximum should be enforced, probably yes.
        const storageMaxSizeMb = await this._config.getStorageMaxSizeMb();
        if (storageMaxSizeMb !== undefined) {
            this._storageSizeMaxBytes = storageMaxSizeMb * 1024 * 1024; // convert to bytes
        }

        // get the current storage index (the next index to be used for saving records)
        // storage index may be updated during the initialization if there is a record with higer index
        // we can't overwrite existing records, so we need to start from the next index
        this._storageIndex = await this._config.getStorageIndex();

        // check if storage directory exists
        if (await checkFileExists(this._storagePath) === false) {
            await fs.mkdir(this._storagePath, { recursive: true });
            // Empty monitoring storage historically reports zero bounds and allocates record 1 first.
            this._firstIndex = 0;
            this._storageIndex = 1;
        }
        else {
            // if storage exist, then try to restore first and last index
            // get list of all directories (segments) in the storage directory
            let dirs = await fs.readdir(this._storagePath, { withFileTypes: true });
            // filter out non-directories
            dirs = dirs.filter(dirent => dirent.isDirectory());
            // filter out directories that don't have a number as the name
            dirs = dirs.filter(dirent => !isNaN(Number(dirent.name)));
            let lowest = 0;
            let highest = 0;
            if (dirs.length === 0) {
                // if there are no directories, then we need to find the highest and lowest indexes
                ({ highest, lowest } = await this.getHighestAndLowestIndexes(this._storagePath));
            }
            else {
                let highestSegment = 0;
                let lowestSegment = Number.MAX_SAFE_INTEGER;
                // find the highest and lowest segments
                for (const dirent of dirs) {
                    const index = Number(dirent.name);
                    if (index > highestSegment) {
                        highestSegment = index;
                    }
                    if (index < lowestSegment) {
                        lowestSegment = index;
                    }
                }
                ({ highest } = await this.getHighestAndLowestIndexes(
                                    Path.join(this._storagePath, highestSegment.toString())
                                ));
                ({ lowest } = await this.getHighestAndLowestIndexes(
                                    Path.join(this._storagePath, lowestSegment.toString())
                                ));
            }
            this._firstIndex = lowest;
            this._storageIndex = highest + 1;
        }

        this._storageSize = await this.getStorageSize();
    }

    /**
     * Remove one record segment in the existing storage ordering, retaining at least one segment.
     */
    private async cleanupStorage(): Promise<void> {
        // get list of segment directories
        let dirs = await fs.readdir(this._storagePath, { withFileTypes: true });
        // filter out non-directories
        dirs = dirs.filter(dirent => dirent.isDirectory());
        // filter out directories that don't have a number as the name
        dirs = dirs.filter(dirent => !isNaN(Number(dirent.name)));
        if (dirs.length < 2) {
            return;
        }
        // sort the directories in ascending order
        dirs.sort((a, b) => a.name.localeCompare(b.name));
        // get the lowest segment number
        let lowestSegmentPath = Path.join(this._storagePath, dirs[0].name);

        // get the size of the lowest segment
        let lowestSegmentSize = await this.getStorageSize(lowestSegmentPath);

        // get number of records in the lowest segment
        let { highest, lowest } = await this.getHighestAndLowestIndexes(lowestSegmentPath);

        const stats = await fs.stat(lowestSegmentPath);
        if (stats.isDirectory()) {
            // In Node.js v16, fs.rmdir with recursive option is deprecated
            // fs.rm is the recommended replacement
            await fs.rm(lowestSegmentPath, { recursive: true, force: true });
        }
        else {
            await fs.unlink(lowestSegmentPath);
        }

        // update the first index
        this._firstIndex = highest + 1;
        // update the storage size
        this._storageSize -= lowestSegmentSize;
    }

    /** Report retained index bounds and their timestamps for Remote Management's record requests. */
    async getStorageStatus(): Promise<StorageStatus> {
        let temp = await this.getRecord(this._firstIndex);
        const firstTimestamp = temp ? temp.timestamp : 0;
        temp = await this.getRecord(this._storageIndex - 1);
        const lastTimestamp = temp ? temp.timestamp : 0;

        return {
            firstIndex: this._firstIndex,
            firstTimestamp: firstTimestamp,
            lastIndex: this._storageIndex - 1,
            lastTimestamp: lastTimestamp
        };
    }

    /** Allocate an index, persist the record/input, and update usage before applying segment cleanup. */
    async saveRecord(record: ImpulseRecord): Promise<void> {
        let recordSize: number = 0;
        let rawDataSize: number = 0;
        let storedRecord = record;

        record.index = this._storageIndex++;
        if (!this._isUpdatingStorageIndex) {
            this._isUpdatingStorageIndex = true;
            await this._config.storeStorageIndex(this._storageIndex);
            this._isUpdatingStorageIndex = false;
        }

        const recordPath = Path.join(await this.getPathByIndex(record.index), record.index.toString() + '.json');

        if (record.rawData.type === 'jpg') {
            const imgPath = Path.join(await this.getPathByIndex(record.index), record.index.toString() + '.jpg');
            const buf = Buffer.from(record.rawData.bufferBase64, 'base64');
            await fs.writeFile(imgPath, buf);
            rawDataSize = buf.length;
            // Persist the file reference without replacing the base64 image emitted to live debug clients.
            storedRecord = {
                ...record,
                rawData: { ...record.rawData, bufferBase64: imgPath },
            };
        }

        const recordStr = JSON.stringify(storedRecord, null, 4);
        await fs.writeFile(recordPath, recordStr, 'utf-8');
        recordSize = recordStr.length;

        this._storageSize += (recordSize + rawDataSize);

        if (this._storageSize > this._storageSizeMaxBytes) {
            console.log(MONITOR_PREFIX, 'Storage size exceeded the limit, cleaning up the storage');
            await this.cleanupStorage();
        }
    }

    /** Read a retained record and load its JPEG input into the response; absent records return undefined. */
    async getRecord(index: number): Promise<ImpulseRecord | undefined> {
        const recordPath = Path.join(await this.getPathByIndex(index), index.toString() + '.json');

        if (await checkFileExists(recordPath) === false) {
            return undefined;
        }

        let record = <ImpulseRecord>JSON.parse(await fs.readFile(recordPath, 'utf-8'));
        if (record.rawData.type === 'jpg') {
            let fileBuf: Buffer;
            if (await checkFileExists(record.rawData.bufferBase64) === false) {
                // looks like this record has the raw data embedded
                // try to decode the base64 and return it as a buffer
                try {
                    fileBuf = Buffer.from(record.rawData.bufferBase64, 'base64');
                }
                catch (ex) {
                    throw new Error(`Record ${index} doesn't have the raw data file and the base64 is invalid`);
                }
            }
            fileBuf = await fs.readFile(record.rawData.bufferBase64);
            record.rawData.bufferBase64 = fileBuf.toString('base64');
        }

        return record;
    }
}

/** Distinguish the active reporting interval from the saved CLI preference during construction. */
type MetricsCalculatorCadence = {
    summaryWindowMs: number;
    configuredSummaryIntervalMs: number | undefined;
};

/** Compare Unicode code points rather than JavaScript's UTF-16 code units or the host locale. */
function compareSummaryLabels(left: string, right: string): number {
    const a = Array.from(left, character => character.codePointAt(0)!);
    const b = Array.from(right, character => character.codePointAt(0)!);
    for (let index = 0; index < Math.min(a.length, b.length); index++) {
        if (a[index] !== b[index]) return a[index] - b[index];
    }
    return a.length - b.length;
}

/** Incremental mean and population variance for all supplied scores, not just winning predictions. */
class Moments {
    count = 0;
    mean = 0;
    private _squares = 0;

    /** Incorporate one score using Welford's update without retaining individual observations. */
    add(value: number): void {
        this.count++;
        const delta = value - this.mean;
        this.mean += delta / this.count;
        this._squares += delta * (value - this.mean);
    }

    /** Compute population deviation from the accumulated moments; callers require at least one score. */
    get deviation(): number {
        return Math.sqrt(Math.max(0, this._squares / this.count));
    }
}

/**
 * Accumulates the telemetry statistics for one admitted model and window, independently by result field.
 * Classification statistics include every reported label score, and timing counts actual results.
 * The calculator owns window admission and closure.
 */
class InferenceSummaryAccumulator {
    private _labels = new Map<string, { counted: number, scores: Moments }>();
    private _first: InferenceMetrics['start'] | undefined;
    private _last: InferenceMetrics['end'] | undefined;
    private _results = 0;
    private _dsp = 0;
    private _classification = 0;
    private _anomalyTime = 0;
    private _hasAnomalyTime = false;
    private _anomalyScores = new Moments();
    private _anomalyCount: number | undefined;
    private _visualMeans = new Moments();

    /** Start empty with the model's reported thresholds, without adding runner defaults. */
    constructor(private readonly _thresholds: readonly RunnerBlockThreshold[]) { }

    /** Read a numeric parameter from the first block of its type; absent parameters have no fallback. */
    private threshold(type: string, key: string): number | undefined {
        // A later block cannot supply a key missing from the first block of this type.
        const value = this._thresholds.find(block => block.type === type)?.[key];
        return typeof value === 'number' ? value : undefined;
    }

    /** Retrieve/create the shared counters and moments for a model or generated label. */
    private label(name: string) {
        const existing = this._labels.get(name);
        if (existing) return existing;
        const entry = { counted: 0, scores: new Moments() };
        this._labels.set(name, entry);
        return entry;
    }

    /** Count one prediction or qualifying box for a label. */
    private count(name: string): void {
        this.label(name).counted++;
    }

    /** Add a score to a label's mean/deviation independently of whether its prediction counter increments. */
    private score(name: string, value: number): void {
        this.label(name).scores.add(value);
    }

    /** Apply each present result field's summary rule and track result count and index-associated timestamps. */
    add(record: Pick<ImpulseRecord, 'impulseRecord' | 'timestamp' | 'index'>): void {
        const position = { index: record.index, timestamp: record.timestamp };
        if (!this._first || record.index < this._first.index) this._first = position;
        if (!this._last || record.index > this._last.index) this._last = position;
        this._results++;
        const { result, timing } = record.impulseRecord;
        this._dsp += timing.dsp;
        this._classification += timing.classification;
        this._anomalyTime += timing.anomaly;

        const classifications = Object.entries(result.classification ?? {});
        const top = classifications.reduce<[string, number] | undefined>((best, candidate) => {
            if (!best || candidate[1] > best[1] ||
                (candidate[1] === best[1] && compareSummaryLabels(candidate[0], best[0]) < 0)) return candidate;
            return best;
        }, undefined);
        if (top) {
            const threshold = this.threshold('classification', 'min_score');
            this.count(threshold !== undefined && top[1] < threshold ? 'no prediction' : top[0]);
            for (const [ label, value ] of classifications) this.score(label, value);
        }

        const detectionThreshold = this.threshold('object_detection', 'min_score');
        for (const box of result.bounding_boxes ?? []) {
            if (detectionThreshold === undefined || box.value > detectionThreshold) {
                this.count(box.label);
                this.score(box.label, box.value);
            }
        }

        const anomalyThreshold = this.threshold('anomaly_gmm', 'min_anomaly_score');
        if (result.visual_anomaly_max !== undefined) {
            this._hasAnomalyTime = true;
            if (anomalyThreshold !== undefined) {
                this.count(result.visual_anomaly_max > anomalyThreshold ? 'anomaly' : 'no anomaly');
            }
            this.score('anomaly', result.visual_anomaly_max);
        }
        else if (result.anomaly !== undefined) {
            this._hasAnomalyTime = true;
            this._anomalyScores.add(result.anomaly);
            if (anomalyThreshold !== undefined) {
                this._anomalyCount = (this._anomalyCount ?? 0) + (result.anomaly > anomalyThreshold ? 1 : 0);
            }
        }
        if (result.visual_anomaly_mean !== undefined) this._visualMeans.add(result.visual_anomaly_mean);
    }

    /**
     * Build a tagged, code-point-ordered snapshot; omit non-finite statistics
     * and suppress empty/invalid timing output.
     */
    getMetrics(): InferenceMetrics | undefined {
        if (!this._first || !this._last) return undefined;
        const dsp = this._dsp / this._results;
        const classification = this._classification / this._results;
        if (!Number.isFinite(dsp) || !Number.isFinite(classification)) return undefined;
        const labels = [ ...this._labels ].sort(([ left ], [ right ]) => compareSummaryLabels(left, right));
        const scored = labels.filter(([ , label ]) => label.scores.count > 0 &&
            Number.isFinite(label.scores.mean) && Number.isFinite(label.scores.deviation));
        const metrics: InferenceMetrics['metrics'] = { avg_inference_time: { dsp, classification } };
        const anomalyTime = this._anomalyTime / this._results;
        if (this._hasAnomalyTime && Number.isFinite(anomalyTime)) metrics.avg_inference_time!.anomaly = anomalyTime;
        if (this._anomalyScores.count && Number.isFinite(this._anomalyScores.mean)) {
            metrics.anomaly_mean = this._anomalyScores.mean;
        }
        if (this._anomalyCount !== undefined) metrics.anomaly_count = this._anomalyCount;
        if (this._visualMeans.count && Number.isFinite(this._visualMeans.mean)) {
            metrics.visual_anomaly_mean = this._visualMeans.mean;
        }
        return {
            rulesVersion: 2,
            start: { ...this._first }, end: { ...this._last },
            classificationCounter: labels.filter(([ , label ]) => label.counted > 0)
                .map(([ label, value ]) => ({ label, value: value.counted })),
            mean: scored.map(([ label, value ]) => ({ label, value: value.scores.mean })),
            standardDeviation: scored.map(([ label, value ]) => ({ label, value: value.scores.deviation })),
            metrics,
        };
    }
}

/**
 * Computes inference summaries from the model's original thresholds. Half-open windows close
 * before a boundary result or on a timer; late results are dropped, and empty windows produce no summary.
 */
export class MetricsCalculator {
    private _completedMetrics: InferenceMetrics | undefined;
    private _summaryWindowMs: number;
    readonly configuredSummaryIntervalMs: number | undefined;
    private _accumulator: InferenceSummaryAccumulator;
    private _windowStart: number | undefined;
    private _windowEnd: number | undefined;
    private _latestTimestamp: number | undefined;
    private _closedThrough: number | undefined;

    /** Prepare a fresh accumulator for one deployment and retain its configured and effective cadence. */
    constructor(
        private readonly _model: MonitoredModel,
        cadence: MetricsCalculatorCadence,
    ) {
        this._summaryWindowMs = cadence.summaryWindowMs;
        this.configuredSummaryIntervalMs = cadence.configuredSummaryIntervalMs;
        this._accumulator = this.createAccumulator();
    }

    /** Read the saved preference and create a fresh calculator for this monitoring session. */
    static async getMetricsInstance(
        config: MetricsConfig,
        model: MonitoredModel,
    ): Promise<MetricsCalculator> {
        const savedInterval = await config.getMonitorSummaryIntervalMs();
        const configuredInterval = savedInterval && Number.isFinite(savedInterval) && savedInterval > 0 ?
            savedInterval : undefined;
        return new MetricsCalculator(model, {
            summaryWindowMs: Math.max(configuredInterval ?? DEFAULT_MONITOR_SUMMARY_INTERVAL_MS,
                DEFAULT_MONITOR_SUMMARY_INTERVAL_MS),
            configuredSummaryIntervalMs: configuredInterval,
        });
    }

    /** Create empty statistics using this deployment's original thresholds, never mutable runner settings. */
    private createAccumulator(): InferenceSummaryAccumulator {
        return new InferenceSummaryAccumulator(this._model.reportedThresholds);
    }

    /** Expose the current half-open window's end, or undefined when no window has results. */
    get summaryDeadline(): number | undefined {
        return this._windowEnd;
    }

    /** Expose the policy-adjusted reporting interval. */
    get summaryIntervalMs(): number {
        return this._summaryWindowMs;
    }

    /** Update cadence while keeping the open window's end strictly after every already-admitted timestamp. */
    setSummaryIntervalMs(intervalMs: number) {
        this._summaryWindowMs = intervalMs;
        // Preserve results already admitted beyond a shortened deadline. Subsequent windows use
        // the new interval without manufacturing historical summaries.
        if (this._windowStart !== undefined) {
            this._windowEnd = Math.max(this._windowStart + intervalMs, this._latestTimestamp! + 1);
        }
    }

    /** Finish any valid snapshot before resetting statistics and advancing the late-result cutoff. */
    private async closeWindow(endTimestamp: number): Promise<InferenceMetrics | undefined> {
        const metrics = this._accumulator.getMetrics();
        this._accumulator = this.createAccumulator();
        this._windowStart = undefined;
        this._windowEnd = undefined;
        this._latestTimestamp = undefined;
        this._closedThrough = endTimestamp;
        return metrics;
    }

    /** Return whether wall time moved far enough behind known windows that the existing grid is unusable. */
    private clockMovedBack(timestamp: number): boolean {
        const known = Math.max(this._closedThrough ?? Number.NEGATIVE_INFINITY,
            this._windowStart ?? Number.NEGATIVE_INFINITY);
        return Number.isFinite(known) && timestamp + CLOCK_BACK_LIMIT_MS < known;
    }

    /** Close the current window, if any, and forget the future grid after a backward clock correction. */
    private async resetAfterClockCorrection(): Promise<InferenceMetrics | undefined> {
        const metrics = this._windowStart === undefined ? undefined : await this.closeWindow(this.summaryDeadline!);
        this._closedThrough = undefined;
        return metrics;
    }

    /** Close an elapsed window, or reset a stale future window after wall time moves backwards. */
    async closeDueWindow(timestamp: number): Promise<InferenceMetrics | undefined> {
        if (this.clockMovedBack(timestamp)) return this.resetAfterClockCorrection();
        const deadline = this.summaryDeadline;
        if (deadline === undefined || timestamp < deadline) return undefined;
        return this.closeWindow(deadline);
    }

    /** Close pending results once at a partial-window cutoff; leave empty windows unreported. */
    async flushMetrics(): Promise<InferenceMetrics | undefined> {
        if (this._windowStart === undefined) return undefined;
        return this.closeWindow(Math.max(this._latestTimestamp! + 1,
            Math.min(Date.now(), this.summaryDeadline!)));
    }

    /**
     * Reject late records, close a due window before admission,
     * and expose its summary separately from the new window.
     */
    async updateMetrics(record: Pick<ImpulseRecord, 'impulseRecord' | 'timestamp' | 'index'>): Promise<boolean> {
        let completed = false;
        if (this.clockMovedBack(record.timestamp)) {
            this._completedMetrics = await this.resetAfterClockCorrection();
            completed = this._completedMetrics !== undefined;
        }
        // Once a window closes, a late result cannot change it or enter a newer window.
        if (this._closedThrough !== undefined && record.timestamp < this._closedThrough) return false;
        if (this._windowStart !== undefined && record.timestamp < this._windowStart) return false;
        const deadline = this.summaryDeadline;
        if (deadline !== undefined && record.timestamp >= deadline) {
            this._completedMetrics = await this.closeWindow(deadline);
            completed = this._completedMetrics !== undefined;
        }
        if (this._windowStart === undefined) {
            const start = this._closedThrough ?? record.timestamp;
            this._windowStart = start +
                Math.floor((record.timestamp - start) / this._summaryWindowMs) * this._summaryWindowMs;
            this._windowEnd = this._windowStart + this._summaryWindowMs;
        }
        this._accumulator.add(record);
        this._latestTimestamp = Math.max(this._latestTimestamp ?? record.timestamp, record.timestamp);
        return completed;
    }

    /** Hand off a record-triggered completed summary once, independently of the new window's snapshot. */
    takeCompletedMetrics(): InferenceMetrics | undefined {
        const completed = this._completedMetrics;
        this._completedMetrics = undefined;
        return completed;
    }

}

/**
 * Coordinates record persistence, calculator updates and summary delivery through one serialized queue.
 * Keeps policy, deployment transitions and debug-record delivery separate from summary aggregation,
 * using the calculator's deadline for timer-driven closure.
 */
export class ModelMonitor extends EventEmitter<{
    'impulse-record': (ev: ImpulseRecord) => void,
    'impulse-records-response': (ev: ImpulseRecord | ImpulseRecordError) => void,
    'inference-summary': (ev: InferenceMetrics) => void,
}> {
    private _storageManager: StorageManager | undefined;
    private _metricsCalculator: MetricsCalculator | undefined;
    private _processing: Promise<void> = Promise.resolve();
    private _acceptingResults = true;
    private _summaryTimer: NodeJS.Timeout | undefined;
    private _streamState: 'idle' | 'debug' | 'records-request' = 'idle';
    private _lastPolicy: string | undefined;
    private _streamPrevState: 'idle' | 'debug' | 'records-request' = 'idle';

    /** Prepare event delivery; the factory initializes deployment storage and its calculator asynchronously. */
    private constructor(_config: Config) {
        super();
    }

    /**
     * Creates a new instance of ModelMonitor with the provided configuration and model information.
     * @param config The configuration object.
     * @param model The model information object.
     * @param options Original model thresholds supplied by the runner, before local settings are applied.
     * @returns A promise that resolves to a ModelMonitor instance.
     */
    static async getModelMonitor(config: Config, model: ModelInformation,
        options: Pick<MonitoredModel, 'reportedThresholds'>): Promise<ModelMonitor> {
        const monitor = new ModelMonitor(config);
        const reportedThresholds = options.reportedThresholds.map(block => ({ ...block }));

        monitor._storageManager = await StorageManager.getStorageManager(config, model);
        monitor._metricsCalculator = await MetricsCalculator.getMetricsInstance(config, {
            modelParameters: model.modelParameters,
            reportedThresholds,
        });

        return monitor;
    }

    /** Serialize record allocation, statistics and flushes while allowing later operations after a failure. */
    private enqueue(operation: () => Promise<void>): Promise<void> {
        const pending = this._processing.then(operation);
        this._processing = pending.catch(() => undefined);
        return pending;
    }

    /** Schedule the active deadline, delaying retries if closure fails. */
    private scheduleSummary(minimumDelayMs = 0): void {
        if (this._summaryTimer) clearTimeout(this._summaryTimer);
        this._summaryTimer = undefined;
        const deadline = this._metricsCalculator?.summaryDeadline;
        if (!this._acceptingResults || deadline === undefined) return;
        this._summaryTimer = setTimeout(() => {
            void this.enqueue(async () => {
                const summary = await this._metricsCalculator?.closeDueWindow(Date.now());
                if (summary) this.emit('inference-summary', summary);
                this.scheduleSummary();
            }).catch(error => {
                console.warn(MONITOR_PREFIX, 'Unable to close summary window', error);
                this.scheduleSummary(SUMMARY_CLOSE_RETRY_MS);
            });
        }, Math.max(minimumDelayMs, deadline - Date.now()));
        this._summaryTimer.unref();
    }

    /** Permanently stop admitting results, then drain and flush the current deployment. */
    async stop(): Promise<void> {
        this._acceptingResults = false;
        if (this._summaryTimer) clearTimeout(this._summaryTimer);
        this._summaryTimer = undefined;
        await this.flushMetrics();
    }

    /**
     * Replace deployment storage/statistics after the caller pauses inference and flushes the old model.
     * Retain listeners and policy without restarting a monitor that has been terminally stopped.
     */
    async replaceModel(config: Config, model: ModelInformation,
        options: Pick<MonitoredModel, 'reportedThresholds'>): Promise<void> {
        const reportedThresholds = options.reportedThresholds.map(block => ({ ...block }));
        await this.enqueue(async () => {
            const storage = await StorageManager.getStorageManager(config, model);
            const calculator = await MetricsCalculator.getMetricsInstance(config, {
                modelParameters: model.modelParameters,
                reportedThresholds,
            });
            this._storageManager = storage;
            this._metricsCalculator = calculator;
            const policy = this._lastPolicy && this._lastPolicy !== NO_SUMMARY_POLICY ?
                JSON.parse(this._lastPolicy) as MonitoringSummaryPolicy : undefined;
            this._lastPolicy = undefined;
            this.applySummaryPolicy(policy);
        });
    }

    /** Expose the saved CLI preference, independent of this session's server policy. */
    get configuredSummaryIntervalMs() {
        return this._metricsCalculator?.configuredSummaryIntervalMs;
    }

    /** Expose the calculator's current policy-adjusted reporting interval. */
    get effectiveSummaryIntervalMs() {
        return this._metricsCalculator?.summaryIntervalMs;
    }

    /**
     * Apply the server requirement to this session without overwriting the saved CLI preference.
     * With standard limits, saved 60s becomes 5s for a Default rule, then returns to 60s when it is
     * removed. Saved 10s stays at 10s when the policy relaxes to 60s, reducing potential volume savings.
     * The server's minimum interval takes precedence over a faster preference; incompatible settings
     * produce a warning. Preserving the in-flight aggregate means acceleration cannot backfill history.
     */
    applySummaryPolicy(policy: MonitoringSummaryPolicy | undefined) {
        const calculator = this._metricsCalculator;
        if (!calculator) return;
        if (policy && (!Number.isFinite(policy.intervalMs) || !Number.isFinite(policy.minimumIntervalMs) ||
            policy.minimumIntervalMs < MIN_MONITOR_SUMMARY_INTERVAL_MS ||
            policy.intervalMs < policy.minimumIntervalMs || !Number.isFinite(policy.preparationWindowMs) ||
            policy.preparationWindowMs < 0 || typeof policy.requirementsMet !== 'boolean')) {
            console.warn(MONITOR_PREFIX, 'Ignoring invalid summary policy');
            return;
        }
        const policyKey = JSON.stringify(policy) ?? NO_SUMMARY_POLICY;
        if (this._lastPolicy === policyKey) return;
        this._lastPolicy = policyKey;
        const configured = this.configuredSummaryIntervalMs;
        const effective = policy ? Math.max(policy.minimumIntervalMs,
            Math.min(configured ?? policy.intervalMs, policy.intervalMs)) :
            Math.max(configured ?? DEFAULT_MONITOR_SUMMARY_INTERVAL_MS,
                DEFAULT_MONITOR_SUMMARY_INTERVAL_MS);
        calculator.setSummaryIntervalMs(effective);
        this.scheduleSummary();
        console.log(MONITOR_PREFIX, `Summary interval: configured ${configured ?? 'automatic'}, effective ${effective} ms`);
        if (configured !== undefined && configured !== effective) {
            console.warn(MONITOR_PREFIX, 'The server policy overrides the saved interval for this session; ' +
                'the saved preference is unchanged.');
        }
        if (policy && !policy.requirementsMet) {
            console.warn(MONITOR_PREFIX, 'Server ingestion limits cannot satisfy all active alert windows. ' +
                'Metric alerts may lack sufficient summaries.');
        }
        if (policy && policy.preparationWindowMs > 0) {
            console.log(MONITOR_PREFIX, `Metric rules need fresh history: allow up to ` +
                `${policy.preparationWindowMs / 1000} seconds after a cadence increase. ` +
                'Evaluation still requires enough real summaries; gaps or slow inference can delay readiness.');
        }
        if (!policy) {
            console.warn(MONITOR_PREFIX, 'Server does not provide an adaptive summary policy; using a minimum ' +
                '60-second interval for compatibility. The saved preference is unchanged.');
        }
    }

    /** Queue a flush after admitted records, emit only a new summary, and refresh any remaining timer. */
    async flushMetrics(): Promise<void> {
        await this.enqueue(async () => {
            const metrics = await this._metricsCalculator?.flushMetrics();
            if (metrics) this.emit('inference-summary', metrics);
            this.scheduleSummary();
        });
    }

    /** Report whether processed records are currently streamed live for debugging. */
    get impulseDebug() {
        return this._streamState === 'debug';
    }

    /**
     * Switch between live debug-record streaming and idle, replacing any records-request state.
     * Summary collection remains active independently of debug streaming.
     */
    set impulseDebug(enabled: boolean) {
        if (this._streamState === 'records-request' && enabled === true) {
            // TODO: send abort/error message
            console.log(MONITOR_PREFIX, 'Stream was in records-request state, but impulseDebug was set to ' + enabled);
            console.log(MONITOR_PREFIX, 'Aborting the records-request state');
        }
        if (enabled) {
            this._streamState = 'debug';
            this._streamPrevState = 'idle';
        }
        else {
            this._streamState = 'idle';
            this._streamPrevState = 'idle';
        }
    }

    /** Return retained record bounds for Remote Management, or zero bounds before storage is available. */
    async getStorageStatus(): Promise<StorageStatus> {
        if (this._storageManager) {
            return await this._storageManager.getStorageStatus();
        }
        return {
            firstIndex: 0,
            firstTimestamp: 0,
            lastIndex: 0,
            lastTimestamp: 0
        };
    }

    /** Restore the previous streaming state when a record request is aborted. */
    abortImpulseRecordsRequest() {
        this._streamState = this._streamPrevState;
        this._streamPrevState = 'idle';
    }

    /**
     * Retrieves impulse records based on the provided request.
     * @param impulseRequest The request object specifying the index, range, or list of indices to retrieve.
     * One of the following properties must be provided:
     * - index: The index of the single impulse record to retrieve.
     * - range: An object with first and last properties specifying the range of impulse records to retrieve.
     * - list: An array of indices of impulse records to retrieve (in any order)
     * Missing records and inverted ranges emit error responses.
     * @throws Error if the request supplies none of the supported selectors.
     */
    getImpulseRecords(impulseRequest: {
                        index?: number,
                        range?: { first: number, last: number },
                        list?: number[]
    }): void {
        if (this._streamState === 'debug') {
            console.log(MONITOR_PREFIX, 'Stream is in debug mode, pausing the debug stream');
        }
        this._streamPrevState = this._streamState;
        this._streamState = 'records-request';

        if (typeof impulseRequest.index === 'number') {
            void this._storageManager?.getRecord(impulseRequest.index)
                .then(record => {
                    if (record) {
                        this.emit('impulse-records-response', record);
                    }
                    else {
                        // TODO: is this sanity check needed?
                        if (impulseRequest.index === undefined) {
                            throw new Error('Index is undefined');
                        }
                        this.emit('impulse-records-response', {
                            index: impulseRequest.index,
                            error: 'Record not found'
                        });
                    }
                });
        }
        else if (impulseRequest.range) {
            if (impulseRequest.range.first > impulseRequest.range.last) {
                this.emit('impulse-records-response', { index: impulseRequest.range.first, error: 'First index higher than the last one' });
                this.abortImpulseRecordsRequest();
                return;
            }
            for (let i = impulseRequest.range.first; i <= impulseRequest.range.last; i++) {
                void this._storageManager?.getRecord(i)
                    .then(record => {
                        if (record) {
                            this.emit('impulse-records-response', record);
                        }
                        else {
                            this.emit('impulse-records-response', { index: i, error: 'Record not found' });
                        }
                    });
                if (this._streamState !== 'records-request') {
                    console.log(MONITOR_PREFIX, 'Stream state changed, aborting the records-request');
                    break;
                }
            }
        }
        else if (impulseRequest.list) {
            // sort the list of indices in ascending order
            impulseRequest.list.sort((a, b) => a - b);
            for (const index of impulseRequest.list) {
                void this._storageManager?.getRecord(index)
                    .then(record => {
                        if (record) {
                            this.emit('impulse-records-response', record);
                        }
                        else {
                            this.emit('impulse-records-response', { index: index, error: 'Record not found' });
                        }
                    });
                if (this._streamState !== 'records-request') {
                    console.log(MONITOR_PREFIX, 'Stream state changed, aborting the records-request');
                    break;
                }
            }
        }
        else {
            throw new Error('Invalid impulse request');
        }

        // restore the previous state
        this._streamState = this._streamPrevState;
    }

    /**
     * Admit an active producer result, persist it before aggregation,
     * and deliver completed summaries/debug records.
     */
    async processResult(result: RunnerClassifyResponseSuccess, rawData: {
        type: 'wav' | 'jpg',
        buffer: Buffer,
    }): Promise<void> {
        if (!this._acceptingResults) return;
        let record: ImpulseRecord = {
            impulseRecord: result,
            timestamp: Date.now(),
            index: -1, // will be set by the storage manager later
            rawData: {
                type: rawData.type,
                bufferBase64: rawData.buffer.toString('base64'),
            },
        };

        await this.enqueue(async () => {
            // Allocation and disk persistence finish before the record contributes to a summary.
            await this._storageManager?.saveRecord(record);
            if (this._metricsCalculator && await this._metricsCalculator.updateMetrics(record)) {
                const metrics = this._metricsCalculator.takeCompletedMetrics();
                if (metrics) this.emit('inference-summary', metrics);
            }
            this.scheduleSummary();
            if (this.impulseDebug) this.emit('impulse-record', record);
        });
    }
}
