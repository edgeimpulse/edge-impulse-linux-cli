import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import Path from 'node:path';
import { ActivateBundleCommand, BlockThreshold } from '../../shared/device-protocol/workload-contract';

/** Selects the model identity and behavior exposed by a staged bundle fixture. */
export type BundleFixtureOptions = {
    deploymentVersion: number;
    sensor?: number;
    inferencingEngine?: number;
    manifestEngine?: string;
    thresholds?: BlockThreshold[];
    classifyScore?: number;
};

/** Selects the protocol responses and termination behavior of a mock `.eim` process. */
export type MockEimOptions = {
    deploymentVersion?: number;
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
        sensor = 3,
        inferencingEngine = 2,
        manifestEngine = 'tflite',
        thresholds = [],
        classifyScore,
    } = options;
    const bundlePath = Path.join(rootDirectory, `bundle-${deploymentVersion}`);
    const modelPath = Path.join(bundlePath, 'model.eim');
    await fs.mkdir(bundlePath);
    const source = mockEimSource({
        deploymentVersion,
        sensor,
        inferencingEngine,
        thresholds,
        classifyScore,
    });
    await fs.writeFile(modelPath, source, { mode: 0o755 });
    await fs.writeFile(Path.join(bundlePath, 'manifest.json'), JSON.stringify({
        manifestVersion: 1,
        kind: 'model',
        target: 'test-target',
        runtime: { kind: 'inference_runner', minVersion: '1.0.0' },
        models: [{
            id: `model-${deploymentVersion}`,
            projectId: 1,
            impulseId: 1,
            deploymentVersion,
            engine: manifestEngine,
            modelType: 'classification',
            path: 'model.eim',
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
        sensor = 2,
        inferencingEngine = 2,
        thresholds = [],
        classifyScore,
        exitAfterHello = false,
        killAfterHello = false,
    } = options;
    return `#!/usr/bin/env node
const net = require('net');
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
                        image_input_height: 1, image_input_width: 1, image_input_frames: 1,
                        image_channel_count: 3, image_resize_mode: 'squash', interval_ms: 1,
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
