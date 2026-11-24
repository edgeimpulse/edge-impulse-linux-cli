import assert from 'node:assert';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import Path from 'node:path';
import { mockAgentServer, MockAgentRequest, MockAgentResponse, MockAgentRoute, testRegistration, waitFor } from './helpers/mock-agent';
import { AgentClient } from '../cli-common/agent-client';
import {
    Command,
    CommandResult,
    CompletedInferenceEvent,
    EventBatch,
    InferenceRunnerRegistration,
} from '../shared/device-protocol/application-contract';

/**
 * Exercises `AgentClient`, the Unix-socket application transport for registration, commands and inference
 * events. Normal flows register canonical state, maintain the command stream, post results, apply input
 * policy and send inline or spooled inference inputs. Failure flows cover unavailable or malformed agent
 * responses, registration recovery, command-result retry and expiry, spool failure, request timeout,
 * stream reconnection and graceful shutdown while event requests are still pending.
 */
describe('AgentClient', () => {
    let tempDir: string;
    let socketPath: string;
    let server: http.Server | undefined;

    beforeEach(async () => {
        server = undefined;
        tempDir = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-agent-client-'));
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

    // Proves the basic session sequence: register local runner state, then listen for agent commands.
    it('registers over a Unix socket and opens the command stream', async () => {
        let registration: InferenceRunnerRegistration | undefined;
        let commandStreamOpened = false;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: mockRequest => {
                    registration = mockRequest.body as InferenceRunnerRegistration;
                    return {
                        body: {
                            applicationId: 'vision',
                            inputPolicy: { mode: 'none' },
                            inlineSizeLimitBytes: 1024,
                        },
                    };
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: () => {
                    commandStreamOpened = true;
                    return {
                        headers: { 'content-type': 'text/event-stream' },
                        keepOpen: true,
                    };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        const request = testRegistration();
        const response = await client.connect(request);
        await waitFor(() => commandStreamOpened);

        assert.deepStrictEqual(registration, request);
        assert.strictEqual(response.applicationId, 'vision');
        await client.close();
    });

    // Rejects incomplete agent settings before the runner uses invalid limits or input policy state.
    it('validates the registration response', async () => {
        server = await mockAgentServer(socketPath, [{
            method: 'POST',
            path: '/v1/register',
            response: { body: { applicationId: 'vision' } },
        }]);

        const client = new AgentClient(socketPath);
        await assert.rejects(
            client.connect(testRegistration()),
            /Invalid register response/
        );
        await client.close();
    });

    // Allows agent and runner containers to start in either order instead of failing on a missing socket.
    it('waits for the agent socket before completing the initial connection', async () => {
        const client = new AgentClient(socketPath, { reconnectDelayMs: 10 });
        // Begin connecting before the mock agent creates its Unix socket.
        const connecting = client.connect(testRegistration());
        await new Promise(resolve => setTimeout(resolve, 20));

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
                    keepOpen: true,
                },
            },
        ]);

        const response = await connecting;
        assert.strictEqual(response.applicationId, 'vision');
        await client.close();
    });

    // Lets the runner's SIGTERM path interrupt startup instead of waiting for another retry delay.
    it('stops an initial connection when the client closes', async () => {
        const client = new AgentClient(socketPath, { reconnectDelayMs: 1000 });
        const connecting = client.connect(testRegistration());
        const rejected = assert.rejects(connecting, /Agent client closed/);
        await new Promise(resolve => setTimeout(resolve, 20));

        await client.close();
        await rejected;
    });

    // Rejects an unconfirmed model registration and reconnects with the last confirmed state.
    it('restores the previous registration after an update transport failure', async () => {
        let registrations = 0;
        let commandStreams = 0;
        let recoveredRegistration: InferenceRunnerRegistration | undefined;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: mockRequest => {
                    registrations++;
                    if (registrations === 2) {
                        // Hold the model registration until the request timeout simulates an agent
                        // that stopped responding during model initialization.
                        return new Promise<MockAgentResponse>(() => undefined);
                    }
                    if (registrations === 3) {
                        recoveredRegistration = mockRequest.body as InferenceRunnerRegistration;
                    }
                    return {
                        body: {
                            applicationId: 'vision',
                            inputPolicy: { mode: 'none' },
                            inlineSizeLimitBytes: 1024,
                        },
                    };
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: () => {
                    commandStreams++;
                    return {
                        headers: { 'content-type': 'text/event-stream' },
                        keepOpen: true,
                    };
                },
            },
        ]);

        const client = new AgentClient(socketPath, { requestTimeoutMs: 20, reconnectDelayMs: 10 });
        await client.connect(testRegistration());
        const updatedRegistration = {
            ...testRegistration(),
            models: [{
                id: 'model-1',
                projectId: 1,
                projectName: 'Project',
                projectOwner: 'Owner',
                impulseId: 2,
                deploymentVersion: 3,
                engine: 'tflite',
                modelType: 'classification',
                labels: [ 'object' ],
            }],
        } satisfies InferenceRunnerRegistration;

        await assert.rejects(
            client.updateRegistration(updatedRegistration),
            /timed out after 20 ms/
        );
        await waitFor(() => registrations === 3 && commandStreams === 2);

        assert.deepStrictEqual(recoveredRegistration, testRegistration());
        await client.close();
    });

    // Keeps invalid registration data fatal because reconnecting cannot make the same response valid.
    it('rejects an invalid registration update response', async () => {
        let registrations = 0;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: () => {
                    registrations++;
                    return registrations === 1 ? {
                        body: {
                            applicationId: 'vision',
                            inputPolicy: { mode: 'none' },
                            inlineSizeLimitBytes: 1024,
                        },
                    } : {
                        body: { applicationId: 'vision' },
                    };
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: {
                    headers: { 'content-type': 'text/event-stream' },
                    keepOpen: true,
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        await assert.rejects(
            client.updateRegistration(testRegistration()),
            /Invalid register response/
        );
        await client.close();
    });

    // Ensures one malformed command cannot permanently stop command delivery to an otherwise healthy runner.
    it('re-registers and reopens the command stream after an invalid command', async () => {
        let registrations = 0;
        let commandStreams = 0;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: () => {
                    registrations++;
                    return {
                        body: {
                            applicationId: 'vision',
                            inputPolicy: { mode: 'none' },
                            inlineSizeLimitBytes: 1024,
                        },
                    };
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: () => {
                    commandStreams++;
                    // Corrupt only the first stream; the replacement stays open to prove recovery completed.
                    return {
                        headers: { 'content-type': 'text/event-stream' },
                        body: commandStreams === 1 ? 'data: {"bogus":true}\n\n' : undefined,
                        keepOpen: true,
                    };
                },
            },
        ]);

        const client = new AgentClient(socketPath, { reconnectDelayMs: 10 });
        await client.connect(testRegistration());
        await waitFor(() => registrations === 2 && commandStreams === 2);

        assert.strictEqual(registrations, 2);
        assert.strictEqual(commandStreams, 2);
        await client.close();
    });

    // An expired command result is final; it must not disrupt a healthy stream or repeat the action.
    it('does not reconnect when the agent refuses an expired command result', async () => {
        let registrations = 0;
        let commandStreams = 0;
        let results = 0;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: () => {
                    registrations++;
                    return {
                        body: {
                            applicationId: 'vision',
                            inputPolicy: { mode: 'none' },
                            inlineSizeLimitBytes: 1024,
                        },
                    };
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: () => {
                    commandStreams++;
                    return {
                        headers: { 'content-type': 'text/event-stream' },
                        body: 'data: {"id":"policy-expired","type":"updateInputPolicy",' +
                            '"inputPolicy":{"mode":"all"}}\n\n',
                        keepOpen: true,
                    };
                },
            },
            {
                method: 'POST',
                path: '/v1/commands/policy-expired/result',
                response: () => {
                    results++;
                    return {
                        statusCode: 404,
                        body: { code: 'unknown_command', message: 'The command has expired' },
                    };
                },
            },
        ]);

        const client = new AgentClient(socketPath, { reconnectDelayMs: 10 });
        await client.connect(testRegistration());
        await waitFor(() => results === 1);
        await client.commands.waitForIdle(100);
        await new Promise(resolve => setTimeout(resolve, 30));

        assert.strictEqual(registrations, 1);
        assert.strictEqual(commandStreams, 1);
        await client.close();
    });

    // A request timeout response is ambiguous, so retry the identical result without applying the command twice.
    it('retries a command result after HTTP 408', async () => {
        let handlerCalls = 0;
        const results: CommandResult[] = [];
        server = await mockAgentServer(socketPath, commandResultRetryRoutes('activate-timeout', results, attempt =>
            attempt === 1 ? { statusCode: 408, body: { message: 'Timed out' } } : { body: {} }));

        const client = new AgentClient(socketPath, { reconnectDelayMs: 10 });
        client.commands.on('activateBundle', () => {
            handlerCalls++;
            return Promise.resolve();
        });
        await client.connect(testRegistration());
        await waitFor(() => results.length === 2);

        assert.strictEqual(handlerCalls, 1);
        assert.deepStrictEqual(results[1], results[0]);
        await client.close();
    });

    // An internal contract response requires same-ID delivery retry because the first result may have been accepted.
    it('retries a command result after an internal response', async () => {
        let handlerCalls = 0;
        const results: CommandResult[] = [];
        server = await mockAgentServer(socketPath, commandResultRetryRoutes('activate-internal', results, attempt =>
            attempt === 1 ? {
                statusCode: 500,
                body: { code: 'internal', message: 'Result state is uncertain' },
            } : { body: {} }));

        const client = new AgentClient(socketPath, { reconnectDelayMs: 10 });
        client.commands.on('activateBundle', () => {
            handlerCalls++;
            return Promise.resolve();
        });
        await client.connect(testRegistration());
        await waitFor(() => results.length === 2);

        assert.strictEqual(handlerCalls, 1);
        assert.deepStrictEqual(results[1], results[0]);
        await client.close();
    });

    // A permanently ambiguous result must eventually be logged and released so rollback can run.
    it('bounds ambiguous result retries and processes the next queued command', async () => {
        let handlerCalls = 0;
        let ambiguousResults = 0;
        let nextResults = 0;
        const warnings: string[] = [];
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
                    body: 'data: {"id":"activate-stuck","type":"activateBundle",' +
                        '"bundle":{"kind":"model","path":"/models/version-2",' +
                        '"deploymentVersion":2}}\n\n' +
                        'data: {"id":"policy-next","type":"updateInputPolicy",' +
                        '"inputPolicy":{"mode":"none"}}\n\n',
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/commands/activate-stuck/result',
                response: () => {
                    ambiguousResults++;
                    return {
                        statusCode: 500,
                        body: { code: 'internal', message: 'Result state is uncertain' },
                    };
                },
            },
            {
                method: 'POST',
                path: '/v1/commands/policy-next/result',
                response: () => {
                    nextResults++;
                    return { body: {} };
                },
            },
        ]);

        const client = new AgentClient(socketPath, {
            reconnectDelayMs: 10,
            commandResultRetryTimeoutMs: 25,
        });
        client.commands.on('activateBundle', () => {
            handlerCalls++;
            return Promise.resolve();
        });
        const originalWarn = console.warn;
        console.warn = (...args: unknown[]) => warnings.push(args.map(String).join(' '));
        try {
            await client.connect(testRegistration());
            await waitFor(() => nextResults === 1);
            await client.commands.waitForIdle(100);

            assert.strictEqual(handlerCalls, 1);
            assert(ambiguousResults >= 2);
            assert(warnings.some(message =>
                message.includes('Stopped retrying result for command "activate-stuck" after 25 ms')));
        }
        finally {
            console.warn = originalWarn;
            await client.close();
        }
    });

    it('acknowledges activation failure and then handles rollback on the same stream', async () => {
        const results: CommandResult[] = [];
        let handled = 0;
        server = await mockAgentServer(socketPath, [
            { method: 'POST', path: '/v1/register', response: { body: {
                applicationId: 'vision', inputPolicy: { mode: 'none' }, inlineSizeLimitBytes: 1024,
            } } },
            { method: 'GET', path: '/v1/commands', response: {
                headers: { 'content-type': 'text/event-stream' }, keepOpen: true,
                body: [ 7, 3 ].map(version => 'data: ' + JSON.stringify({ id: 'activate-' + version,
                    type: 'activateBundle', bundle: { kind: 'model', deploymentVersion: version,
                        path: '/models/12345/' + version } }) + '\n\n').join(''),
            } },
            ...[ 7, 3 ].map(version => ({ method: 'POST' as const,
                path: '/v1/commands/activate-' + version + '/result',
                response: (request: MockAgentRequest) => {
                    results.push(request.body as CommandResult); return { statusCode: 204 };
                },
            })),
        ]);
        const client = new AgentClient(socketPath);
        try {
            client.commands.on('activateBundle', command => {
                    handled++;
                    if (command.bundle.deploymentVersion === 7) {
                        throw new Error('failed executable');
                    }
                    return Promise.resolve();
            });
            await client.connect(testRegistration());
            await waitFor(() => results.length === 2);
            assert.strictEqual(handled, 2);
            assert.deepStrictEqual(results, [
                { commandId: 'activate-7', type: 'activateBundle', success: false, reason: 'failed executable' },
                { commandId: 'activate-3', type: 'activateBundle', success: true },
            ]);
        }
        finally { await client.close(); }
    });

    // Confirms a selected small input is embedded in the event JSON and acknowledged by the agent.
    it('posts an inference with an inline input selected by the agent policy', async () => {
        let eventBody: EventBatch | undefined;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: {
                    body: {
                        applicationId: 'vision',
                        inputPolicy: { mode: 'all' },
                        inlineSizeLimitBytes: 1024,
                    },
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: {
                    headers: { 'content-type': 'text/event-stream' },
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                response: mockRequest => {
                    eventBody = mockRequest.body as EventBatch;
                    return { body: { accepted: 1, dropped: 0 } };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        const response = await client.postInference(testInference(), {
            type: 'jpg',
            buffer: Buffer.from('image'),
        });

        assert.strictEqual(response.accepted, 1);
        assert(eventBody);
        const reportedInput = eventBody.events[0].input;
        assert(reportedInput && reportedInput.location === 'inline');
        assert.strictEqual(reportedInput.type, 'jpg');
        assert.strictEqual(reportedInput.bufferBase64, Buffer.from('image').toString('base64'));
        await client.close();
    });

    // Confirms large inputs use the shared spool and remain readable until the agent finishes handling the event.
    it('spools an oversized input and removes it after the agent acknowledges the event', async () => {
        const spoolDirectory = Path.join(tempDir, 'spool');
        await fs.mkdir(spoolDirectory);
        let spoolPath: string | undefined;
        let releaseEventResponse: () => void = () => undefined;
        const eventResponse = new Promise<void>(resolve => releaseEventResponse = resolve);
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: {
                    body: {
                        applicationId: 'vision',
                        inputPolicy: { mode: 'all' },
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
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                response: async mockRequest => {
                    // Inspect the file while the event request is deliberately held before its acknowledgement.
                    const event = (mockRequest.body as EventBatch).events[0];
                    assert(event.input && event.input.location === 'spool');
                    spoolPath = Path.join(spoolDirectory, event.input.path);
                    assert.deepStrictEqual(await fs.readFile(spoolPath), Buffer.from('image'));
                    await eventResponse;
                    return { body: { accepted: 1, dropped: 0 } };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        const posting = client.postInference(testInference(), {
            type: 'jpg',
            buffer: Buffer.from('image'),
        });
        await waitFor(() => spoolPath !== undefined);
        assert(spoolPath);
        await fs.access(spoolPath);

        // The successful acknowledgement permits AgentClient to remove the temporary spool file.
        releaseEventResponse();
        await posting;
        await assert.rejects(fs.access(spoolPath), error =>
            (error as NodeJS.ErrnoException).code === 'ENOENT');
        await client.close();
    });

    // Preserves the inference result when the shared input volume is missing or cannot be written.
    it('posts an event without its input when writing the spool fails', async () => {
        let eventBody: EventBatch | undefined;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: {
                    body: {
                        applicationId: 'vision',
                        inputPolicy: { mode: 'all' },
                        inlineSizeLimitBytes: 1,
                        spoolDirectory: Path.join(tempDir, 'missing-spool'),
                    },
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: {
                    headers: { 'content-type': 'text/event-stream' },
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                response: mockRequest => {
                    eventBody = mockRequest.body as EventBatch;
                    return { body: { accepted: 1, dropped: 0 } };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        const response = await client.postInference(testInference(), {
            type: 'jpg',
            buffer: Buffer.from('image'),
        });

        assert.strictEqual(response.accepted, 1);
        assert(eventBody);
        assert.strictEqual(eventBody.events[0].input, undefined);
        await client.close();
    });

    // Proves fraction sampling omits only the input while still delivering the inference event itself.
    it('applies the input fraction before attaching input bytes', async () => {
        let eventBody: EventBatch | undefined;
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: {
                    body: {
                        applicationId: 'vision',
                        inputPolicy: { mode: 'fraction', fraction: 0.5 },
                        inlineSizeLimitBytes: 1024,
                    },
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: {
                    headers: { 'content-type': 'text/event-stream' },
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                response: mockRequest => {
                    eventBody = mockRequest.body as EventBatch;
                    return { body: { accepted: 1, dropped: 0 } };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        const originalRandom = Math.random;
        // A value above the configured fraction deterministically excludes this test input.
        Math.random = () => 0.75;
        try {
            await client.postInference(testInference(), {
                type: 'jpg',
                buffer: Buffer.from('image'),
            });
        }
        finally {
            Math.random = originalRandom;
        }

        assert(eventBody);
        assert.strictEqual(eventBody.events[0].input, undefined);
        await client.close();
    });

    // Prevents rapid inference streams from exceeding the agent's input-capture rate limit.
    it('enforces the maximum attached inputs per second', async () => {
        const eventBodies: EventBatch[] = [];
        server = await mockAgentServer(socketPath, [
            {
                method: 'POST',
                path: '/v1/register',
                response: {
                    body: {
                        applicationId: 'vision',
                        inputPolicy: { mode: 'all', maxPerSecond: 1 },
                        inlineSizeLimitBytes: 1024,
                    },
                },
            },
            {
                method: 'GET',
                path: '/v1/commands',
                response: {
                    headers: { 'content-type': 'text/event-stream' },
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                response: mockRequest => {
                    eventBodies.push(mockRequest.body as EventBatch);
                    return { body: { accepted: 1, dropped: 0 } };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        const input = { type: <const>'jpg', buffer: Buffer.from('image') };
        await client.postInference(testInference(), input);
        await client.postInference(testInference(), input);

        assert(eventBodies[0].events[0].input);
        assert.strictEqual(eventBodies[1].events[0].input, undefined);
        await client.close();
    });

    // Verifies a policy command takes effect before its success result and subsequent inference event.
    it('applies and acknowledges an input policy command', async () => {
        let eventBody: EventBatch | undefined;
        let commandResult: CommandResult | undefined;
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
                    body: 'data: {"id":"policy-1","type":"updateInputPolicy",' +
                        '"inputPolicy":{"mode":"all"}}\n\n',
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/commands/policy-1/result',
                response: mockRequest => {
                    commandResult = mockRequest.body as CommandResult;
                    return { statusCode: 204 };
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                response: mockRequest => {
                    eventBody = mockRequest.body as EventBatch;
                    return { body: { accepted: 1, dropped: 0 } };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        // Wait for the command result so the following event must use the newly applied policy.
        await waitFor(() => commandResult !== undefined);
        await client.postInference(testInference(), {
            type: 'jpg',
            buffer: Buffer.from('image'),
        });

        assert.deepStrictEqual(commandResult, {
            commandId: 'policy-1',
            type: 'updateInputPolicy',
            success: true,
        });
        assert(eventBody);
        assert.strictEqual(eventBody.events[0].input?.type, 'jpg');
        await client.close();
    });

    // Ensures graceful shutdown does not discard an event that the runner already started sending.
    it('waits for pending inference events when closing', async () => {
        let eventReceived = false;
        let releaseEventResponse: () => void = () => undefined;
        const eventResponse = new Promise<void>(resolve => releaseEventResponse = resolve);
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
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                response: async () => {
                    eventReceived = true;
                    await eventResponse;
                    return { body: { accepted: 1, dropped: 0 } };
                },
            },
        ]);

        const client = new AgentClient(socketPath);
        await client.connect(testRegistration());
        const posting = client.postInference(testInference());
        await waitFor(() => eventReceived);

        // Hold the agent acknowledgement and prove close remains pending until it is released.
        let closed = false;
        const closing = client.close().then(() => closed = true);
        await new Promise(resolve => setTimeout(resolve, 10));
        assert.strictEqual(closed, false);

        releaseEventResponse();
        await closing;
        await posting;
        assert.strictEqual(closed, true);
    });

    // Bounds a stalled agent request so HTTP inference and streaming callbacks cannot accumulate forever.
    it('rejects an event request when the agent does not respond', async () => {
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
                    keepOpen: true,
                },
            },
            {
                method: 'POST',
                path: '/v1/events',
                // Accept the request but never produce an HTTP response.
                response: () => new Promise<MockAgentResponse>(() => undefined),
            },
        ]);

        const client = new AgentClient(socketPath, { requestTimeoutMs: 20 });
        await client.connect(testRegistration());
        await assert.rejects(client.postInference(testInference()), /timed out after 20 ms/);
        await client.close();
    });
});

/** Creates a complete agent session that initially refuses one command-result delivery. */
function commandResultRetryRoutes(
    commandId: string,
    results: CommandResult[],
    response: (attempt: number) => MockAgentResponse
): MockAgentRoute[] {
    return [
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
                body: `data: {"id":"${commandId}","type":"activateBundle",` +
                    '"bundle":{"kind":"model","path":"/models/version-2",' +
                    '"deploymentVersion":2}}\n\n',
                keepOpen: true,
            },
        },
        {
            method: 'POST',
            path: `/v1/commands/${commandId}/result`,
            response: request => {
                results.push(request.body as CommandResult);
                return response(results.length);
            },
        },
    ];
}

/**
 * Returns one valid completed event so transport tests exercise the generated event validation.
 */
function testInference(): CompletedInferenceEvent {
    return {
        id: 'event-1',
        inferenceTimestamp: 1,
        results: [{
            modelId: 'inference-container:test',
            result: { classification: { object: 0.9 } },
            timing: { dsp: 1, classification: 2, anomaly: 0 },
        }],
    };
}
