import assert from 'node:assert';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import Path from 'node:path';
import { EventEmitter } from 'tsee';
import sharp from 'sharp';
import { AgentClient, AgentCommandProcessor, PreparedAgentInput } from '../cli-common/agent-client';
import { AgentCaptureController } from '../cli/linux/agent-capture';
import { AudioClassifier } from '../library/classifier/audio-classifier';
import { ImageClassifier } from '../library/classifier/image-classifier';
import {
    LinuxImpulseRunner,
    ModelInformation,
    RunnerClassifyResponseSuccess,
    RunnerHelloHasAnomaly,
    RunnerHelloInferencingEngine,
} from '../library/classifier/linux-impulse-runner';
import {
    ICamera,
    ICameraProfilingInfoEvent,
    ICameraSnapshotForInferenceEvent,
    ICameraStartOptions,
} from '../library/sensors/icamera';
import { CaptureSample, Command, CommandResult } from '../shared/device-protocol/application-contract';
import { mockAgentServer, testRegistration, waitFor } from './helpers/mock-agent';

/** Covers live sensor capture, registration metadata, result redelivery and spool cleanup. */
describe('Agent capture', () => {
    describe('AgentCaptureController', () => {
        // Camera registration uses an observed source frame and capture returns metadata for the command frame.
        it('advertises and captures from the live camera', async () => {
            const frames = [
                { buffer: Buffer.from('registration'), capturedAt: 1, width: 640, height: 480 },
                { buffer: Buffer.from('capture'), capturedAt: 2, width: 640, height: 480 },
            ];
            const classifier = {
                captureNextFrame: () => Promise.resolve(frames.shift()!),
            } as unknown as ImageClassifier;
            const controller = new AgentCaptureController();

            await controller.useCamera(classifier);
            const captured = await controller.capture({ sensor: 'Camera (640x480)' });

            assert.deepStrictEqual(controller.sensors(), [{
                name: 'Camera (640x480)', frequencies: [], maxSampleLengthS: 60000,
            }]);
            assert.strictEqual(captured.format, 'jpg');
            assert.deepStrictEqual(captured.metadata, {
                sensor: 'Camera (640x480)', capturedAt: 2, width: 640, height: 480,
            });
        });

        // Registration and capture use the same live sample rate, while shutdown removes capture availability.
        it('uses canonical microphone metadata and rejects capture after shutdown', async () => {
            const classifier = {
                sampleRateHz: () => 16_000,
                captureWindow: () => Promise.resolve({
                    buffer: Buffer.from('wav'), capturedAt: 3, durationMs: 1000, sampleRateHz: 16_000,
                }),
            } as unknown as AudioClassifier;
            const controller = new AgentCaptureController();
            controller.useMicrophone(classifier);

            assert.deepStrictEqual(controller.sensors(), [{
                name: 'Microphone', frequencies: [ 16_000 ], maxSampleLengthS: 60,
            }]);
            await controller.capture({ sensor: 'Microphone', lengthMs: 1000 });
            controller.disable();
            await assert.rejects(
                controller.capture({ sensor: 'Microphone', lengthMs: 1000 }),
                /no live sensor is registered/);
        });
    });

    describe('ImageClassifier capture', () => {
        // Registration can inspect a live frame while inference stays paused until activation commits.
        it('captures while paused without running inference', async () => {
            const camera = new TestCamera();
            const classifier = new ImageClassifier(fakeRunner(), camera);
            const results: RunnerClassifyResponseSuccess[] = [];
            classifier.on('result', result => results.push(result));
            await classifier.start();
            classifier.pause();

            const capturing = classifier.captureNextFrame();
            const jpeg = await sharp({
                create: { width: 3, height: 2, channels: 3, background: 'white' },
            }).jpeg().toBuffer();
            camera.emit('snapshot', jpeg, 'source.jpg');
            camera.emit('snapshotForInference', frame('before-activation.jpg'));
            const captured = await capturing;

            assert.strictEqual(captured.width, 3);
            assert.strictEqual(captured.height, 2);
            assert.deepStrictEqual(captured.buffer, jpeg);
            assert.strictEqual(results.length, 0);

            classifier.resume();
            camera.emit('snapshotForInference', frame('after-capture.jpg'));
            await waitFor(() => results.length === 1);
            await classifier.stop();
        });
    });

    describe('AudioClassifier capture', () => {
        // A capture reads an exact window while other listeners continue receiving the same recorder data.
        it('captures PCM from the live recorder without removing inference listeners', async () => {
            const classifier = classifierWithStream();
            const stream = liveStream(classifier);
            let inferenceChunks = 0;
            stream.on('data', () => inferenceChunks++);

            const capturing = classifier.captureWindow(2);
            stream.emit('data', Buffer.from([ 1, 0, 2, 0, 3, 0 ]));
            const captured = await capturing;

            assert.strictEqual(inferenceChunks, 1);
            assert.strictEqual(captured.sampleRateHz, 1000);
            assert.strictEqual(captured.durationMs, 2);
            assert.deepStrictEqual(captured.buffer.subarray(44), Buffer.from([ 1, 0, 2, 0 ]));
        });

        // Pausing the lifecycle must reject a pending capture so it cannot block the ordered command queue.
        it('rejects a capture interrupted by lifecycle pause', async () => {
            const classifier = classifierWithStream();
            const capturing = classifier.captureWindow(10);

            classifier.pause();

            await assert.rejects(capturing, /interrupted because the classifier was paused/);
        });

        // The classifier enforces the same one-minute limit advertised by the agent capture API.
        it('rejects capture lengths above the advertised maximum', async () => {
            const classifier = classifierWithStream();

            await assert.rejects(classifier.captureWindow(60_001), /between 1 and 60000 ms/);
        });
    });

    describe('Capture result retention', () => {
        // A lost capture result retains its exact sample until redelivery succeeds, then releases it once.
        it('reuses and releases a prepared capture after acknowledgement', async () => {
            let handlerCalls = 0;
            let releases = 0;
            const acknowledged: CommandResult[] = [];
            const processor = new AgentCommandProcessor(result => {
                acknowledged.push(result);
                return acknowledged.length === 1 ?
                    Promise.reject(new Error('result was lost')) : Promise.resolve();
            });
            const command = captureCommand('capture-retry');
            const sample = captureSample();
            processor.on('capture', () => {
                handlerCalls++;
                return Promise.resolve({
                    capture: sample,
                    preparedInput: preparedInput(sample, 8, () => releases++),
                });
            });

            await assert.rejects(processor.process(command), /result was lost/);
            assert.strictEqual(releases, 0);
            await processor.process(command);

            assert.strictEqual(handlerCalls, 1);
            assert.strictEqual(releases, 1);
            assert.deepStrictEqual(acknowledged[1], acknowledged[0]);
        });

        // Retention pressure replaces old samples with tombstones so redelivery cannot recapture them.
        it('bounds failed capture retention without repeating physical capture', async () => {
            let handlerCalls = 0;
            const releases: string[] = [];
            const acknowledged: CommandResult[] = [];
            const processor = new AgentCommandProcessor(result => {
                acknowledged.push(result);
                return acknowledged.length <= 2 ?
                    Promise.reject(new Error('agent unavailable')) : Promise.resolve();
            }, () => 5);
            processor.on('capture', command => {
                handlerCalls++;
                const sample = captureSample();
                return Promise.resolve({
                    capture: sample,
                    preparedInput: preparedInput(sample, 4, () => releases.push(command.id)),
                });
            });

            await assert.rejects(processor.process(captureCommand('capture-old')), /agent unavailable/);
            await assert.rejects(processor.process(captureCommand('capture-new')), /agent unavailable/);
            await processor.process(captureCommand('capture-old'));
            await processor.process(captureCommand('capture-new'));

            assert.strictEqual(handlerCalls, 2);
            assert.deepStrictEqual(releases, [ 'capture-old', 'capture-new' ]);
            assert.deepStrictEqual(acknowledged[2], {
                commandId: 'capture-old',
                type: 'capture',
                success: false,
                reason: 'Capture result expired before delivery; capture was not repeated',
            });
        });

        // Shutdown releases an unacknowledged sample and refuses later delivery so spool ownership cannot leak.
        it('releases retained capture input when closing', async () => {
            let releases = 0;
            const processor = new AgentCommandProcessor(() => Promise.reject(new Error('agent unavailable')));
            const sample = captureSample();
            processor.on('capture', () => Promise.resolve({
                capture: sample,
                preparedInput: preparedInput(sample, 8, () => releases++),
            }));

            await assert.rejects(processor.process(captureCommand('capture-close')), /agent unavailable/);
            await processor.close(100);

            assert.strictEqual(releases, 1);
            await assert.rejects(
                processor.process(captureCommand('capture-after-close')),
                /processor has closed/
            );
        });
    });

    describe('Capture transport', () => {
        let tempDir: string;
        let socketPath: string;
        let server: http.Server | undefined;

        beforeEach(async () => {
            server = undefined;
            tempDir = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-agent-capture-'));
            socketPath = Path.join(tempDir, 'contract.sock');
        });

        afterEach(async () => {
            const activeServer = server;
            server = undefined;
            await new Promise<void>((resolve, reject) => {
                if (!activeServer?.listening) {
                    resolve();
                    return;
                }
                activeServer.close(error => error ? reject(error) : resolve());
            });
            await fs.rm(tempDir, { recursive: true, force: true });
        });

        // Verifies command handlers receive the validated, type-specific command.
        it('delivers application commands to their registered handler', async () => {
            let delivered: Command | undefined;
            server = await mockAgentServer(socketPath, [
                {
                    method: 'POST',
                    path: '/v1/register',
                    response: {
                        body: {
                            applicationId: 'vision',
                            inputPolicy: { mode: 'none' },
                            inlineSizeLimitBytes: 1024,
                        },
                    },
                },
                {
                    method: 'GET',
                    path: '/v1/commands',
                    response: {
                        headers: { 'content-type': 'text/event-stream' },
                        body: 'data: {"id":"capture-1","type":"capture",' +
                            '"capture":{"sensor":"Microphone","lengthMs":2000}}\n\n',
                        keepOpen: true,
                    },
                },
                {
                    method: 'POST',
                    path: '/v1/commands/capture-1/result',
                    response: { body: {} },
                },
            ]);

            const client = new AgentClient(socketPath);
            client.commands.on('capture', command => {
                delivered = command;
                return client.prepareCapture({ type: 'wav', buffer: Buffer.from('sample') }, {
                    capturedAt: Date.now(),
                    sensor: command.capture.sensor,
                });
            });
            await client.connect(testRegistration());
            await waitFor(() => delivered !== undefined);

            assert.strictEqual(delivered?.type, 'capture');
            await client.close();
        });

        // Closing after a failed result post releases the retained spool file owned by that capture.
        it('removes an unacknowledged capture spool when closing', async () => {
            const spoolDirectory = Path.join(tempDir, 'capture-spool');
            await fs.mkdir(spoolDirectory);
            let spoolPath: string | undefined;
            let results = 0;
            server = await mockAgentServer(socketPath, [
                {
                    method: 'POST',
                    path: '/v1/register',
                    response: {
                        body: {
                            applicationId: 'vision',
                            inputPolicy: { mode: 'none' },
                            inlineSizeLimitBytes: 1,
                            spoolDirectory,
                        },
                    },
                },
                {
                    method: 'GET',
                    path: '/v1/commands',
                    response: {
                        headers: { 'content-type': 'text/event-stream' },
                        body: 'data: {"id":"capture-close","type":"capture",' +
                            '"capture":{"sensor":"Microphone","lengthMs":1000}}\n\n',
                        keepOpen: true,
                    },
                },
                {
                    method: 'POST',
                    path: '/v1/commands/capture-close/result',
                    response: request => {
                        results++;
                        const result = request.body as CommandResult;
                        assert(result.success && result.type === 'capture');
                        const input = result.capture.input;
                        if (input.location !== 'spool') throw new Error('Expected a spooled capture result');
                        spoolPath = Path.join(spoolDirectory, input.path);
                        return { statusCode: 503, body: { message: 'Unavailable' } };
                    },
                },
            ]);

            const client = new AgentClient(socketPath);
            client.commands.on('capture', command => client.prepareCapture({
                type: 'wav',
                buffer: Buffer.from('sample'),
            }, {
                capturedAt: Date.now(),
                sensor: command.capture.sensor,
            }));
            const originalWarn = console.warn;
            console.warn = () => undefined;
            try {
                await client.connect(testRegistration());
                await waitFor(() => results === 1 && spoolPath !== undefined);
                await client.commands.waitForIdle(100);
                assert(spoolPath);
                await fs.access(spoolPath);

                await client.close();

                await assert.rejects(fs.access(spoolPath), error =>
                    (error as NodeJS.ErrnoException).code === 'ENOENT');
            }
            finally {
                console.warn = originalWarn;
                await client.close();
            }
        });

    });
});

/** Minimal camera whose frames are controlled directly by the test. */
class TestCamera extends EventEmitter<{
    snapshot: (buffer: Buffer, filename: string) => void;
    snapshotForInference: (event: ICameraSnapshotForInferenceEvent) => void;
    error: (message: string) => void;
    profilingInfo: (event: ICameraProfilingInfoEvent) => void;
}> implements ICamera {
    async init(): Promise<void> { return Promise.resolve(); }
    async listDevices(): Promise<string[]> { return [ 'test' ]; }
    async start(_options: ICameraStartOptions): Promise<void> { return Promise.resolve(); }
    async stop(): Promise<void> { return Promise.resolve(); }
    getLastOptions(): ICameraStartOptions | undefined { return undefined; }
}

/** Creates the runner surface used by ImageClassifier without transport concerns. */
function fakeRunner(): LinuxImpulseRunner {
    return {
        getModel: () => cameraModel(),
        classify: () => Promise.resolve({
            result: { classification: { live: 1 } },
            timing: { dsp: 1, classification: 1, anomaly: 0 },
            info: undefined,
        }),
        stop: () => Promise.resolve(''),
    } as unknown as LinuxImpulseRunner;
}

/** Returns one 1x1 RGB frame so the test reaches inference without image decoding. */
function frame(filename: string): ICameraSnapshotForInferenceEvent {
    return {
        filename,
        imageForInferenceRgb: Buffer.from([ 1, 2, 3 ]),
        imageForInferenceJpg: Buffer.from('jpeg'),
        imageFromCameraJpg: Buffer.from('jpeg'),
    };
}

/** Returns model metadata for the fixed camera pipeline used by the test. */
function cameraModel(): ModelInformation {
    return {
        project: { id: 1, name: 'Test', owner: 'Owner', deploy_version: 1 },
        inferencingEngine: { inferencing_engine: RunnerHelloInferencingEngine.Tflite },
        modelParameters: {
            axis_count: 1,
            frequency: 1,
            has_anomaly: RunnerHelloHasAnomaly.None,
            input_features_count: 1,
            image_input_height: 1,
            image_input_width: 1,
            image_input_frames: 1,
            image_channel_count: 3,
            image_resize_mode: 'squash',
            interval_ms: 1,
            label_count: 1,
            sensor: 3,
            sensorType: 'camera',
            labels: [ 'live' ],
            model_type: 'classification',
            slice_size: undefined,
            use_continuous_mode: false,
            has_performance_calibration: false,
            inferencing_engine: RunnerHelloInferencingEngine.Tflite,
            thresholds: [],
        },
    };
}

/** Creates a classifier with a controlled live stream instead of opening a physical recorder. */
function classifierWithStream(): AudioClassifier {
    const classifier = new AudioClassifier({
        getModel: () => microphoneModel(),
    } as unknown as LinuxImpulseRunner);
    Object.assign(classifier as unknown as Record<string, unknown>, {
        _audio: {
            ee: new EventEmitter<{ data: (buffer: Buffer) => void }>(),
            stop: () => Promise.resolve(),
        },
        _stopped: false,
    });
    return classifier;
}

/** Returns the controlled stream installed by classifierWithStream(). */
function liveStream(classifier: AudioClassifier): EventEmitter<{ data: (buffer: Buffer) => void }> {
    return (classifier as unknown as {
        _audio: { ee: EventEmitter<{ data: (buffer: Buffer) => void }> };
    })._audio.ee;
}

/** Returns a 1 kHz microphone model so millisecond windows have simple byte counts. */
function microphoneModel(): ModelInformation {
    return {
        project: { id: 1, name: 'Test', owner: 'Owner', deploy_version: 1 },
        inferencingEngine: { inferencing_engine: RunnerHelloInferencingEngine.Tflite },
        modelParameters: {
            axis_count: 1,
            frequency: 1000,
            has_anomaly: RunnerHelloHasAnomaly.None,
            input_features_count: 2,
            image_input_height: 0,
            image_input_width: 0,
            image_input_frames: 1,
            image_channel_count: 0,
            image_resize_mode: 'none',
            interval_ms: 1,
            label_count: 1,
            sensor: 1,
            sensorType: 'microphone',
            labels: [ 'sound' ],
            model_type: 'classification',
            slice_size: undefined,
            use_continuous_mode: false,
            has_performance_calibration: false,
            inferencing_engine: RunnerHelloInferencingEngine.Tflite,
            thresholds: [],
        },
    };
}

/** Creates a valid capture command for result-shape tests. */
function captureCommand(id: string): Extract<Command, { type: 'capture' }> {
    return {
        id,
        type: 'capture',
        capture: { sensor: 'Microphone', lengthMs: 1000 },
    };
}

/** Creates the sample returned by a successful capture handler. */
function captureSample(): CaptureSample {
    return {
        input: {
            bufferBase64: 'c2FtcGxl',
            location: 'inline',
            type: 'wav',
        },
        metadata: {
            capturedAt: 1234,
            durationMs: 1000,
            sampleRateHz: 16000,
            sensor: 'Microphone',
        },
    };
}

/** Wraps a capture input with observable retention ownership for processor tests. */
function preparedInput(sample: CaptureSample, retainedBytes: number, release: () => void): PreparedAgentInput {
    return {
        input: sample.input,
        retainedBytes,
        release: () => {
            release();
            return Promise.resolve();
        },
    };
}
