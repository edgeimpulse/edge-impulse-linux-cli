/**
 * Verifies that agent registration uses stable workload API metadata before and after the runner
 * has loaded a model, including safe handling of inferencing engines newer than this CLI.
 */
import assert from 'node:assert';
import { ModelInformation, RunnerHelloInferencingEngine } from '../library/classifier/linux-impulse-runner';
import { agentEngineName, agentRunnerMode } from '../cli/linux/agent-runner-metadata';

describe('agent runner metadata', () => {
    // Ensures the initial registration identifies an explicitly configured mode before model loading.
    it('reports modes from explicit configuration before a model is loaded', () => {
        assert.strictEqual(agentRunnerMode(1337, undefined, undefined, undefined), 'http');
        assert.strictEqual(agentRunnerMode(undefined, '/dev/video0', undefined, undefined), 'camera');
        assert.strictEqual(agentRunnerMode(undefined, undefined, 'default', undefined), 'microphone');
        assert.strictEqual(agentRunnerMode(undefined, undefined, undefined, undefined), undefined);
    });

    // Falls back to `.eim` metadata when startup arguments could not identify the streaming sensor.
    it('reports the mode from a loaded model when no input was selected explicitly', () => {
        const model = <ModelInformation>{ modelParameters: { sensorType: 'camera' } };
        assert.strictEqual(agentRunnerMode(undefined, undefined, undefined, model), 'camera');
    });

    // Keeps workload metadata stable across enum names and prevents a newer engine from crashing startup.
    it('uses stable engine names and accepts future engine values', () => {
        assert.strictEqual(agentEngineName(RunnerHelloInferencingEngine.Tflite), 'tflite');
        assert.strictEqual(agentEngineName(RunnerHelloInferencingEngine.TfliteFull), 'tflite');
        assert.strictEqual(agentEngineName(RunnerHelloInferencingEngine.TensorRT), 'tensorrt');
        assert.strictEqual(agentEngineName(18), 'unknown');
    });
});
