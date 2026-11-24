import assert from 'node:assert';
import { EventEmitter } from 'tsee';
import { agentEngineName, agentRunnerMode } from '../cli/linux/agent-runner-metadata';
import { AudioClassifier } from '../library/classifier/audio-classifier';
import {
    LinuxImpulseRunner,
    ModelInformation,
    RunnerHelloInferencingEngine,
} from '../library/classifier/linux-impulse-runner';
import { AudioRecorder } from '../library/sensors/recorder';
import { selectNonInteractiveDevice } from '../library/sensors/sensors-helper';

/**
 * Exercises the startup decisions that let an agent-managed runner describe and acquire its input
 * without user interaction. It verifies explicit and model-derived serving modes, stable engine
 * names, explicit or unambiguous device selection, and managed handling of silent audio. Ambiguous
 * hardware must fail with configuration guidance instead of blocking on an interactive prompt.
 */
describe('agent runner configuration', () => {
    // Empty registration needs a mode derived from startup configuration before a bundle exists.
    it('reports modes from explicit configuration before a model is loaded', () => {
        assert.strictEqual(agentRunnerMode(1337, undefined, undefined, undefined), 'http');
        assert.strictEqual(agentRunnerMode(undefined, '/dev/video0', undefined, undefined), 'camera');
        assert.strictEqual(agentRunnerMode(undefined, undefined, 'default', undefined), 'microphone');
        assert.strictEqual(agentRunnerMode(undefined, undefined, undefined, undefined), undefined);
    });

    // Model metadata supplies the mode when startup arguments did not select a streaming input.
    it('reports the mode from a loaded model when no input was selected explicitly', () => {
        const model = <ModelInformation>{ modelParameters: { sensorType: 'camera' } };
        assert.strictEqual(agentRunnerMode(undefined, undefined, undefined, model), 'camera');
    });

    // Registration uses stable names and must tolerate an engine introduced after this CLI version.
    it('uses stable engine names and accepts future engine values', () => {
        assert.strictEqual(agentEngineName(RunnerHelloInferencingEngine.Tflite), 'tflite');
        assert.strictEqual(agentEngineName(RunnerHelloInferencingEngine.TfliteFull), 'tflite');
        assert.strictEqual(agentEngineName(RunnerHelloInferencingEngine.TensorRT), 'tensorrt');
        assert.strictEqual(agentEngineName(18), 'unknown');
    });

    // Agent mode cannot prompt, so an explicit device must win when several devices are available.
    it('uses an explicitly selected input device', () => {
        assert.strictEqual(selectNonInteractiveDevice(
            [ 'camera-1', 'camera-2' ], 'camera-2', '--camera', 'EI_CAMERA'), 'camera-2');
    });

    // A sole device is unambiguous and should start without redundant container configuration.
    it('automatically uses the only available input device', () => {
        assert.strictEqual(selectNonInteractiveDevice(
            [ 'microphone-1' ], undefined, '--microphone', 'EI_MICROPHONE'), 'microphone-1');
    });

    // Ambiguous hardware must fail rather than blocking a headless application on an interactive prompt.
    it('rejects ambiguous input device selection', () => {
        assert.throws(
            () => selectNonInteractiveDevice(
                [ 'camera-1', 'camera-2' ], undefined, '--camera', 'EI_CAMERA'),
            /set --camera or EI_CAMERA/
        );
    });

    // Managed applications accept silence because it does not reliably identify a broken microphone.
    it('classifies a silent first audio frame when the legacy diagnostic is disabled', async () => {
        const originalStart = AudioRecorder.prototype.start;
        const audio = new EventEmitter<{ data: (data: Buffer) => void }>();
        AudioRecorder.prototype.start = async () => ({ ee: audio, stop: async () => undefined });
        let classifyCount = 0;
        const classifier = new AudioClassifier(fakeRunner(async () => {
            classifyCount++;
            return classifyResponse();
        }), false, { rejectSilentFirstFrame: false });
        const result = new Promise<void>(resolve => classifier.on('result', () => resolve()));

        try {
            await classifier.start('test');
            audio.emit('data', Buffer.alloc(2));
            await result;
            assert.strictEqual(classifyCount, 1);
            await classifier.stop();
        }
        finally {
            AudioRecorder.prototype.start = originalStart;
        }
    });
});

/** Creates the minimal initialized runner contract consumed by `AudioClassifier`. */
function fakeRunner(classify: (values: number[]) => Promise<ReturnType<typeof classifyResponse>>): LinuxImpulseRunner {
    return <LinuxImpulseRunner><unknown>{
        getModel: () => <ModelInformation><unknown>{
            modelParameters: {
                sensorType: 'microphone',
                input_features_count: 1,
                frequency: 1,
                use_continuous_mode: false,
            },
        },
        classify,
        stop: async () => undefined,
    };
}

/** Returns the minimal successful inference response consumed by `AudioClassifier`. */
function classifyResponse() {
    return {
        result: { classification: { silence: 1 } },
        timing: { dsp: 1, classification: 1, anomaly: 0 },
    };
}
