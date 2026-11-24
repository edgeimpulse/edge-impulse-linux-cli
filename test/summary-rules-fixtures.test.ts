/**
 * Replay every current-rules corpus window through the Linux runner's production calculator and compare
 * complete summaries and ordering with the shared expected outputs. Persistence and continuous timer
 * behaviour are covered in model-monitor.test.ts; this suite owns arithmetic conformance.
 */
import assert from 'assert';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import Path from 'path';
import { InferenceEvent, RegisterRequest } from '../shared/device-protocol/application-contract';
import { InferenceSummary } from '../shared/device-protocol/remote-management';
import { InferenceMetrics, MetricsCalculator } from '../cli-common/model-monitor';

const RULES = Path.join(__dirname, '../../../device-services-contracts/summary-rules');

type Summary = InferenceSummary['inferenceSummary'];
type LabelValues = { label: string, value: number }[];

type Input = {
    registrations: { applicationId: string, atMs: number, request: RegisterRequest }[];
    records: { index: number, applicationId: string, event: InferenceEvent }[];
};

type WindowEntry = { cadence: number, startMs: number, endMs: number, summaries: InferenceSummary[] };

type Rules = {
    rules: { id: string, params?: { [name: string]: { value: unknown } } }[];
};

/**
 * Feed each non-empty series in one explicit, start-inclusive/end-exclusive corpus window to its
 * own calculator and close it at the supplied deadline. No expected arithmetic is calculated here.
 */
async function runnerSummaries(input: Input, window: WindowEntry): Promise<InferenceMetrics[]> {
    const series = new Map<string, MetricsCalculator>();
    for (const record of input.records) {
        const timestamp = record.event.inferenceTimestamp;
        if (timestamp < window.startMs || timestamp >= window.endMs) continue;
        const registration = registrationAt(input, record.applicationId, timestamp);
        // A failure does not exclude any results carried by that event.
        for (const result of record.event.results ?? []) {
            const model = registration.request.models.find(candidate => candidate.id === result.modelId);
            assert.ok(model, 'every result names a registered model');
            const key = JSON.stringify([ record.applicationId, model.id, model.deploymentVersion ]);
            let calculator = series.get(key);
            if (!calculator) {
                calculator = await MetricsCalculator.getMetricsInstance(
                    { getMonitorSummaryIntervalMs: async () => undefined },
                    { modelParameters: { model_type: model.modelType, has_anomaly: 0, thresholds: model.thresholds },
                        reportedThresholds: model.thresholds ?? [] });
                // Corpus windows are explicit; runner windows normally start at their first result.
                // Align this first window's deadline to the supplied end, then use real closure.
                calculator.setSummaryIntervalMs(window.endMs - timestamp);
                series.set(key, calculator);
            }
            assert.strictEqual(await calculator.updateMetrics({ index: record.index, timestamp,
                impulseRecord: { result: result.result, timing: result.timing, info: undefined } }), false,
            'a result inside the supplied window does not close it');
        }
    }
    const summaries: InferenceMetrics[] = [];
    for (const calculator of series.values()) {
        const summary = await calculator.closeDueWindow(window.endMs);
        assert.ok(summary, 'a non-empty series closes at its deadline');
        summaries.push(summary);
    }
    return summaries;
}

/** Index labels while rejecting duplicates and extra fields, regardless of the ordering policy. */
function byLabel(values: LabelValues) {
    const map = new Map<string, number>();
    for (const entry of values) {
        assert.deepStrictEqual(Object.keys(entry).sort(), [ 'label', 'value' ], 'fields of a label value');
        const { label, value } = entry;
        assert.strictEqual(typeof label, 'string', 'label type');
        assert.strictEqual(typeof value, 'number', 'label value type');
        assert.ok(!map.has(label), 'duplicate label ' + label);
        map.set(label, value);
    }
    return map;
}

/** Compare label values exactly or within tolerance, preserving the version's array-order requirement. */
function assertLabelValues(actual: LabelValues, expected: LabelValues, exact: boolean, tolerance: number,
    name: string, order: 'any' | 'codePoint') {
    const actualMap = byLabel(actual);
    const expectedMap = byLabel(expected);
    const actualLabels = [ ...actualMap.keys() ];
    const expectedLabels = [ ...expectedMap.keys() ];
    assert.deepStrictEqual(order === 'any' ? actualLabels.sort() : actualLabels,
        order === 'any' ? expectedLabels.sort() : expectedLabels, name + ': labels');
    for (const [ label, value ] of expectedMap) {
        const got = actualMap.get(label)!;
        if (exact) assert.strictEqual(got, value, name + '.' + label);
        else assert.ok(Math.abs(got - value) <= tolerance, name + '.' + label + ': ' + got + ' is not ' + value);
    }
}

/** Compare numeric metric keys within tolerance, but compare the anomaly counter exactly. */
function assertNumbers(actualObject: object | undefined, expectedObject: object | undefined, tolerance: number,
    name: string) {
    const actual = actualObject as { [key: string]: number };
    const expected = expectedObject as { [key: string]: number };
    assert.deepStrictEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), name + ': keys');
    for (const key of Object.keys(expected)) {
        // Do not let numeric strings pass through subtraction's implicit conversion.
        assert.strictEqual(typeof actual[key], 'number', name + '.' + key + ': type');
        if (key === 'anomaly_count') {
            assert.strictEqual(actual[key], expected[key], name + '.' + key);
        }
        else {
            assert.ok(Math.abs(actual[key] - expected[key]) <= tolerance,
                name + '.' + key + ': ' + actual[key] + ' is not ' + expected[key]);
        }
    }
}

/** Compare full summaries without hiding extra fields; only floating-point statistics permit tolerance. */
function assertSummary(actual: InferenceMetrics, expected: Summary, tolerance: number,
    labelOrder: 'any' | 'codePoint') {
    assert.deepStrictEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), 'fields of the summary');
    assert.deepStrictEqual(actual.start, expected.start, 'start');
    assert.deepStrictEqual(actual.end, expected.end, 'end');
    assert.strictEqual(actual.rulesVersion, expected.rulesVersion, 'rulesVersion');
    assertLabelValues(actual.classificationCounter, expected.classificationCounter, true, tolerance,
        'classificationCounter', labelOrder);
    assertLabelValues(actual.mean, expected.mean, false, tolerance, 'mean', labelOrder);
    assertLabelValues(actual.standardDeviation, expected.standardDeviation, false, tolerance,
        'standardDeviation', labelOrder);
    const { avg_inference_time: actualTime, ...actualRest } = actual.metrics;
    const { avg_inference_time: expectedTime, ...expectedRest } = expected.metrics;
    assertNumbers(actualTime, expectedTime, tolerance, 'avg_inference_time');
    assertNumbers(actualRest, expectedRest, tolerance, 'metrics');
}

/** Select the latest registration at/before the event time; file order breaks equal-time ties. */
function registrationAt(input: Input, applicationId: string, timeMs: number) {
    let latest: Input['registrations'][0] | undefined;
    for (const registration of input.registrations) {
        if (registration.applicationId === applicationId && registration.atMs <= timeMs &&
            (latest === undefined || registration.atMs >= latest.atMs)) {
            latest = registration;
        }
    }
    assert.ok(latest, `${applicationId} has a registration at ${timeMs}`);
    return latest;
}

/** Load every current-rules corpus case, verify complete window coverage, and compare production output. */
function summaryRulesConformanceSuite(): void {
    describe('summary rules conformance', () => {
        it('reproduces every corpus window through the runner calculator', async () => {
            const directory = Path.join(RULES, 'v2');
            const rules = JSON.parse(await fs.readFile(Path.join(directory, 'rules.json'), 'utf8')) as Rules;
            const params = rules.rules.find(rule => rule.id === 'output')!.params!;
            const tolerance = params.tolerance.value as number;
            const labelOrder = params.labelOrder.value as 'any' | 'codePoint';
            assert.ok(tolerance > 0, 'the rules give a tolerance');
            assert.ok(labelOrder === 'any' || labelOrder === 'codePoint', 'the rules give a label ordering');
            const names = (await fs.readdir(Path.join(directory, 'outputs')))
                .filter(name => name.endsWith('.json')).sort();
            assert.ok(names.length > 0, 'the corpus has cases');
            let checked = 0;
            for (const name of names) {
                const input = JSON.parse(await fs.readFile(Path.join(RULES, 'inputs', name), 'utf8')) as Input;
                const output = JSON.parse(await fs.readFile(Path.join(directory, 'outputs', name), 'utf8')) as {
                    windows: WindowEntry[];
                };
                assert.ok(output.windows.length > 0, name + ' has entries');
                for (const entry of output.windows) {
                    try {
                        const actual = await runnerSummaries(input, entry);
                        const expected = entry.summaries.map(summary => summary.inferenceSummary);
                        assert.strictEqual(actual.length, expected.length, 'number of summaries');
                        actual.forEach((summary, index) =>
                            assertSummary(summary, expected[index], tolerance, labelOrder));
                    }
                    catch (error) {
                        throw new Error(name + ' cadence ' + entry.cadence + ' window ' + entry.startMs +
                            ' entry ' + JSON.stringify(entry) + ': ' + (error as Error).message);
                    }
                    checked++;
                }
            }
            assert.ok(checked > 0, 'the entries are checked');
        });
    });
}

// Public exports lack the contracts workspace; register corpus suites only inside the monorepo.
if (existsSync(Path.join(__dirname, '../../../device-services-contracts'))) {
    summaryRulesConformanceSuite();
}
