import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import Path from 'node:path';
import { ActivateBundleCommand, BlockThreshold } from '../../shared/device-protocol/application-contract';

/** Selects the model identity and behavior exposed by a staged bundle fixture. */
export type BundleFixtureOptions = {
    deploymentVersion: number;
    producerLayout?: boolean;
    mock?: MockEimOptions;
    sensor?: number;
    inferencingEngine?: number;
    manifestEngine?: string;
    thresholds?: BlockThreshold[];
    classifyScore?: number;
};

/** Selects the protocol responses and termination behavior of a mock `.eim` process. */
export type MockEimOptions = {
    deploymentVersion?: number;
    pidPath?: string;
    imageWidth?: number;
    imageHeight?: number;
    resizeMode?: string;
    sensor?: number;
    inferencingEngine?: number;
    thresholds?: BlockThreshold[];
    classifyScore?: number;
    exitAfterHello?: boolean;
    killAfterHello?: boolean;
};

/** Stages a valid model bundle beneath a test-owned directory. */
export async function writeBundle(
    rootDirectory: string,
    options: BundleFixtureOptions
): Promise<ActivateBundleCommand> {
    const {
        deploymentVersion,
        producerLayout = false,
        mock = {},
        sensor = 3,
        inferencingEngine = 2,
        manifestEngine = 'tflite',
        thresholds = [],
        classifyScore,
    } = options;
    const bundlePath = Path.join(rootDirectory, `bundle-${deploymentVersion}`);
    const relativeModelPath = producerLayout ? 'models/model.eim' : 'model.eim';
    const modelPath = Path.join(bundlePath, relativeModelPath);
    await fs.mkdir(Path.dirname(modelPath), { recursive: true });
    const source = mockEimSource({
        deploymentVersion,
        sensor,
        inferencingEngine,
        thresholds,
        classifyScore,
        ...mock,
    });
    await fs.writeFile(modelPath, source, { mode: 0o755 });
    await fs.writeFile(Path.join(bundlePath, 'manifest.json'), JSON.stringify({
        manifestVersion: 1,
        kind: 'model',
        target: 'test-target',
        runtime: { kind: 'inference_runner', minVersion: '1.0.0' },
        models: [{
            id: producerLayout ? 'impulse-1' : `model-${deploymentVersion}`,
            projectId: 1,
            impulseId: 1,
            deploymentVersion,
            engine: manifestEngine,
            modelType: 'classification',
            path: relativeModelPath,
            sha256: createHash('sha256').update(source).digest('hex'),
        }],
    }));
    return {
        id: `activate-${deploymentVersion}`,
        type: 'activateBundle',
        bundle: { kind: 'model', path: bundlePath, deploymentVersion },
    };
}

/** Returns a protocol-compatible `.eim` executable with test-selected behavior. */
export function mockEimSource(options: MockEimOptions = {}): string {
    const {
        deploymentVersion = 1,
        pidPath,
        imageWidth = 1,
        imageHeight = 1,
        resizeMode = 'squash',
        sensor = 2,
        inferencingEngine = 2,
        thresholds = [],
        classifyScore,
        exitAfterHello = false,
        killAfterHello = false,
    } = options;
    return `#!/usr/bin/env node
const net = require('net');
if (${pidPath !== undefined}) require('fs').writeFileSync(${JSON.stringify(pidPath ?? '')}, String(process.pid));
const socketPath = process.argv[2];
const server = net.createServer(socket => {
    let buffered = '';
    socket.on('data', chunk => {
        buffered += chunk.toString('utf8');
        const lines = buffered.split('\\n');
        buffered = lines.pop() || '';
        for (const line of lines) {
            if (!line) continue;
            const request = JSON.parse(line);
            if (request.hello === 1) {
                socket.write(JSON.stringify({
                    id: request.id,
                    success: true,
                    project: { id: 1, name: 'Test', owner: 'Owner', deploy_version: ${deploymentVersion} },
                    model_parameters: {
                        axis_count: 1, frequency: 1, has_anomaly: 0, input_features_count: 1,
                        image_input_height: ${imageHeight}, image_input_width: ${imageWidth}, image_input_frames: 1,
                        image_channel_count: 3, image_resize_mode: ${JSON.stringify(resizeMode)}, interval_ms: 1,
                        label_count: 1, sensor: ${sensor}, labels: [ 'value' ], model_type: 'classification',
                        use_continuous_mode: false, has_performance_calibration: false,
                        inferencing_engine: ${inferencingEngine}, thresholds: ${JSON.stringify(thresholds)}
                    },
                    inferencing_engine: { inferencing_engine: ${inferencingEngine}, properties: [] }
                }) + '\\n');
                if (${exitAfterHello}) setTimeout(() => process.exit(0), 20);
                if (${killAfterHello}) setTimeout(() => process.kill(process.pid, 'SIGKILL'), 20);
            }
            else if (request.set_threshold) {
                socket.write(JSON.stringify({ id: request.id, success: true }) + '\\n');
            }
            else if (request.classify && ${classifyScore !== undefined}) {
                socket.write(JSON.stringify({
                    id: request.id,
                    success: true,
                    result: { classification: { value: ${classifyScore ?? 0} } },
                    timing: { dsp: 1, classification: 1, anomaly: 0 }
                }) + '\\n');
            }
        }
    });
});
server.listen(socketPath);
process.on('SIGINT', () => server.close(() => process.exit(0)));
`;
}
