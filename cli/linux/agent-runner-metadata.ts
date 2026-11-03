import { InferenceRunnerRegistration } from '../../shared/device-protocol/workload-contract';
import {
    ModelInformation,
    RunnerHelloInferencingEngine,
} from '../../library/classifier/linux-impulse-runner';

const AGENT_ENGINE_NAMES: Partial<Record<RunnerHelloInferencingEngine, string>> = {
    [RunnerHelloInferencingEngine.Utensor]: 'utensor',
    [RunnerHelloInferencingEngine.Tflite]: 'tflite',
    [RunnerHelloInferencingEngine.Cubeai]: 'cubeai',
    [RunnerHelloInferencingEngine.TfliteFull]: 'tflite',
    [RunnerHelloInferencingEngine.TensaiFlow]: 'tensaiflow',
    [RunnerHelloInferencingEngine.TensorRT]: 'tensorrt',
    [RunnerHelloInferencingEngine.Drpai]: 'drpai',
    [RunnerHelloInferencingEngine.TfliteTidl]: 'tflite-tidl',
    [RunnerHelloInferencingEngine.Akida]: 'akida',
    [RunnerHelloInferencingEngine.Syntiant]: 'syntiant',
    [RunnerHelloInferencingEngine.OnnxTidl]: 'onnx-tidl',
    [RunnerHelloInferencingEngine.Memryx]: 'memryx',
    [RunnerHelloInferencingEngine.EthosLinux]: 'ethos-linux',
    [RunnerHelloInferencingEngine.Aton]: 'aton',
    [RunnerHelloInferencingEngine.CevaNpn]: 'ceva-npn',
    [RunnerHelloInferencingEngine.NordicAxon]: 'nordic-axon',
    [RunnerHelloInferencingEngine.VlmConnector]: 'vlm-connector',
};

/**
 * Returns the stable workload API name for an inferencing-engine number reported by the `.eim`.
 * Unknown future engine values remain reportable without preventing the runner from starting.
 *
 * @param engine Numeric inferencing-engine value reported by the loaded `.eim`.
 */
export function agentEngineName(engine: number): string {
    return AGENT_ENGINE_NAMES[engine as RunnerHelloInferencingEngine] ?? 'unknown';
}

/**
 * Determines the workload mode for initial registration from explicit runner configuration, then
 * falls back to loaded-model metadata once it is available.
 *
 * @param httpPort Configured inference HTTP port, when HTTP mode is active.
 * @param camera Explicit camera selected through the CLI or agent environment.
 * @param microphone Explicit microphone selected through the CLI or agent environment.
 * @param model Metadata reported by the loaded `.eim`, when model loading has completed.
 */
export function agentRunnerMode(
    httpPort: number | undefined,
    camera: string | undefined,
    microphone: string | undefined,
    model: ModelInformation | undefined
): InferenceRunnerRegistration['mode'] | undefined {
    if (httpPort) {
        return 'http';
    }
    if (camera && !microphone) {
        return 'camera';
    }
    if (microphone && !camera) {
        return 'microphone';
    }
    if (model?.modelParameters.sensorType === 'camera' || model?.modelParameters.sensorType === 'microphone') {
        return model.modelParameters.sensorType;
    }
    return undefined;
}
