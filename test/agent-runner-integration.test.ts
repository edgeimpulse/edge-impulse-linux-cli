import assert from 'node:assert';
import { spawn, ChildProcess } from 'node:child_process';
import fs from 'node:fs/promises';
import http, { ServerResponse } from 'node:http';
import net from 'node:net';
import os from 'node:os';
import Path from 'node:path';
import {
    ActivateBundleCommand,
    CommandResult,
    EventBatch,
    InferenceRunnerRegistration,
} from '../shared/device-protocol/workload-contract';
import { writeBundle } from './utils/agent-runner-fixtures';

/** Requests observed by the fake agent across the retiring and replacement workload sessions. */
type AgentObservations = {
    registrations: InferenceRunnerRegistration[];
    results: CommandResult[];
    events: EventBatch[];
    commandStreams: number;
    commandStream?: ServerResponse;
    pendingEventResponse?: ServerResponse;
    holdNextEvent: boolean;
};

/** Exit details retained before assertions begin so an early runner failure cannot be missed. */
type ProcessExit = {
    code: number | null;
    signal: NodeJS.Signals | null;
};

/** Retains one runner process, its diagnostics and its single eventual exit observation. */
type SpawnedRunner = {
    child: ChildProcess;
    output: Buffer[];
    exited: Promise<ProcessExit>;
};

/**
 * Exercises the externally visible agent-managed CLI flow using real runner processes and a fake
 * workload API. Startup registers empty state, activation commits model 1 and serves inference, and
 * replacement closes inference, flushes pending events and exits for supervisor restart. A fresh
 * process then registers empty state, receives the replayed command, prepares changed sensor metadata,
 * commits model 2 and reports subsequent inference against that new canonical identity.
 */
describe('agent-managed runner process', () => {
    // The real process must commit canonical metadata, serve inference, then retire atomically for replacement.
    it('activates an initial bundle, retires, then activates the replayed replacement', async () => {
        // Arrange a complete local workload boundary: staged bundles, agent socket and inference port.
        const tempDir = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-agent-runner-'));
        const socketPath = Path.join(tempDir, 'agent.sock');
        const observations: AgentObservations = {
            registrations: [],
            results: [],
            events: [],
            commandStreams: 0,
            holdNextEvent: true,
        };
        const agentServer = await startAgentServer(socketPath, observations);
        const port = await availablePort();
        const bundleOptions = {
            thresholds: [{ id: 1, type: 'classification', min_score: 0.5 }],
            classifyScore: 0.6,
        };
        // Replacement changes accelerometer to positional input, proving the fresh process prepares
        // runtime metadata from the replayed bundle rather than retaining properties from model 1.
        const first = await writeBundle(tempDir, { ...bundleOptions, deploymentVersion: 1, sensor: 2 });
        const replacement = await writeBundle(tempDir, { ...bundleOptions, deploymentVersion: 2, sensor: 4 });
        const runnerPath = Path.resolve(__dirname, '..', 'build', 'cli', 'linux', 'runner.js');

        // Run the compiled CLI so this test covers its argument handling, lifecycle wiring and process exit.
        const firstProcess = spawnRunner(runnerPath, socketPath, port);
        let secondProcess: SpawnedRunner | undefined;

        try {
            // Initial startup registers an empty workload before the agent is allowed to select a bundle.
            await waitFor(() => observations.commandStream !== undefined, 'runner command stream');
            sendCommand(observations, first);

            // Activation completes only after the model is prepared, the HTTP pipeline is serving and
            // the agent has accepted a registration containing that model.
            await waitFor(() => observations.registrations.length === 2, 'active model registration');
            await waitFor(() => observations.results.some(result => result.commandId === first.id),
                'initial activation result');

            assert.deepStrictEqual(observations.registrations[0].models, []);
            // Registration describes the original `.eim`; the 0.8 CLI override belongs only to runtime state.
            assert.deepStrictEqual(observations.registrations[1].models[0]?.thresholds, [
                { id: 1, type: 'classification', min_score: 0.5 },
            ]);
            assert.strictEqual(observations.results.find(result => result.commandId === first.id)?.success, true);

            // A 0.6 result is filtered by the runtime 0.8 threshold while its raw event is posted to the agent.
            const inference = await requestJson(port, '/api/features', { features: [ 0 ] });
            assert.strictEqual(inference.statusCode, 200);
            assert.deepStrictEqual((JSON.parse(inference.body) as { result: { classification: object } })
                .result.classification, { value: 0 });
            await waitFor(() => observations.events.length === 1, 'pending inference event');
            assert.deepStrictEqual(
                observations.events[0]?.events[0]?.results?.[0]?.result.classification,
                { value: 0.6 }
            );

            // Keep that event request pending, then replace the bundle. The retiring process must close
            // inference immediately, leave the activation command unanswered and wait for the event flush.
            sendCommand(observations, replacement);
            await waitForAsync(async () => (await requestJson(port, '/', undefined)).statusCode === 503,
                'inference shutdown gate');

            // Accepting the pending event releases graceful shutdown and allows the supervisor restart exit.
            observations.pendingEventResponse?.writeHead(200, { 'content-type': 'application/json' });
            observations.pendingEventResponse?.end(JSON.stringify({ accepted: 1, dropped: 0 }));
            observations.pendingEventResponse = undefined;

            const termination = await firstProcess.exited;
            assert.deepStrictEqual(
                termination,
                { code: 75, signal: null },
                Buffer.concat(firstProcess.output).toString('utf8')
            );
            assert.strictEqual(observations.results.some(result => result.commandId === replacement.id), false);
            assert.strictEqual(observations.events[0]?.events[0]?.results?.[0]?.modelId, 'model-1');

            // A fresh process advertises empty state before the agent replays the unanswered command.
            secondProcess = spawnRunner(runnerPath, socketPath, port);
            await waitFor(
                () => observations.commandStreams === 2 && observations.registrations.length === 3,
                'replacement runner session'
            );
            assert.deepStrictEqual(observations.registrations[2].models, []);
            sendCommand(observations, replacement);

            // Replay completes only after model 2 is serving and registered as canonical.
            await waitFor(() => observations.registrations.length === 4, 'replacement model registration');
            await waitFor(
                () => observations.results.some(result => result.commandId === replacement.id),
                'replacement activation result'
            );
            assert.strictEqual(observations.registrations[3].models[0]?.id, 'model-2');
            assert.strictEqual(
                observations.results.find(result => result.commandId === replacement.id)?.success,
                true
            );

            // Inference from the replacement process must report the new canonical model identity.
            const replacementInference = await requestJson(port, '/api/features', { features: [ 0 ] });
            assert.strictEqual(replacementInference.statusCode, 200);
            await waitFor(() => observations.events.length === 2, 'replacement inference event');
            assert.strictEqual(observations.events[1]?.events[0]?.results?.[0]?.modelId, 'model-2');
        }
        finally {
            // Keep a failed assertion from leaving the fake agent or child runner alive for later tests.
            observations.pendingEventResponse?.end();
            observations.commandStream?.end();
            await stopRunner(secondProcess);
            await stopRunner(firstProcess);
            await closeServer(agentServer);
            await fs.rm(tempDir, { recursive: true, force: true });
        }
    }).timeout(15_000);
});

/** Starts the workload API needed to drive and observe a real runner process. */
async function startAgentServer(socketPath: string, observations: AgentObservations): Promise<http.Server> {
    const server = http.createServer(async (request, response) => {
        const body = await requestBody(request);
        if (request.method === 'POST' && request.url === '/v1/register') {
            // Retain both the empty startup registration and the canonical committed model registration.
            observations.registrations.push(JSON.parse(body) as InferenceRunnerRegistration);
            respondJson(response, {
                workloadId: 'runner',
                inputPolicy: { mode: 'none' },
                inlineSizeLimitBytes: 1024,
            });
            return;
        }
        if (request.method === 'GET' && request.url === '/v1/commands') {
            // Hold the stream open so the test can deliver initial activation and replacement in order.
            response.writeHead(200, {
                'content-type': 'text/event-stream',
                'cache-control': 'no-cache',
            });
            response.flushHeaders();
            observations.commandStreams++;
            observations.commandStream = response;
            return;
        }
        if (request.method === 'POST' && request.url?.startsWith('/v1/commands/') &&
            request.url.endsWith('/result')) {
            // Results reveal whether each command completed in this process or was left for replay.
            observations.results.push(JSON.parse(body) as CommandResult);
            respondJson(response, {});
            return;
        }
        if (request.method === 'POST' && request.url === '/v1/events') {
            observations.events.push(JSON.parse(body) as EventBatch);
            if (observations.holdNextEvent) {
                // Hold the first event so replacement shutdown proves that close() flushes started events.
                observations.holdNextEvent = false;
                observations.pendingEventResponse = response;
            }
            else {
                respondJson(response, { accepted: 1, dropped: 0 });
            }
            return;
        }
        response.writeHead(404).end();
    });
    await new Promise<void>(resolve => server.listen(socketPath, resolve));
    return server;
}

/** Sends one command record over the fake agent's established server-sent event stream. */
function sendCommand(observations: AgentObservations, command: ActivateBundleCommand): void {
    if (!observations.commandStream) throw new Error('Command stream is not open');
    observations.commandStream.write(`data: ${JSON.stringify(command)}\n\n`);
}

/** Starts the production CLI with the arguments shared by both supervised process generations. */
function spawnRunner(runnerPath: string, socketPath: string, port: number): SpawnedRunner {
    const child = spawn(process.execPath, [
        runnerPath,
        '--agent', socketPath,
        '--run-http-server', String(port),
        '--force-target', 'test-target',
        '--thresholds', '1.min_score=0.8',
        '--shm-behavior', 'never',
        '--dont-print-predictions',
    ], {
        cwd: Path.resolve(__dirname, '..'),
        env: { ...process.env, EI_RUNNER_IMAGE: 'runner:test' },
    });
    const output: Buffer[] = [];
    child.stdout?.on('data', data => output.push(data));
    child.stderr?.on('data', data => output.push(data));
    return { child, output, exited: processExit(child) };
}

/** Terminates a surviving fixture process and waits briefly for its exit listener to settle. */
async function stopRunner(runner: SpawnedRunner | undefined): Promise<void> {
    if (!runner) return;
    if (runner.child.exitCode === null && runner.child.signalCode === null) runner.child.kill('SIGKILL');
    await Promise.race([ runner.exited, new Promise(resolve => setTimeout(resolve, 1000)) ]);
}

/** Reserves and releases an ephemeral TCP port for the child runner's inference server. */
async function availablePort(): Promise<number> {
    const server = net.createServer();
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Cannot allocate an HTTP port');
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    return address.port;
}

/** Posts optional JSON to the runner and returns its complete HTTP response. */
function requestJson(port: number, path: string, body: object | undefined): Promise<{
    statusCode: number | undefined;
    body: string;
}> {
    const encoded = body === undefined ? undefined : JSON.stringify(body);
    return new Promise((resolve, reject) => {
        const request = http.request({
            host: '127.0.0.1',
            port,
            path,
            method: body === undefined ? 'GET' : 'POST',
            headers: encoded === undefined ? undefined : {
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(encoded),
            },
        }, response => {
            let responseBody = '';
            response.setEncoding('utf8');
            response.on('data', chunk => responseBody += chunk);
            response.on('end', () => resolve({ statusCode: response.statusCode, body: responseBody }));
        });
        request.on('error', reject);
        request.end(encoded);
    });
}

/** Resolves with one child exit even when it occurs before the test reaches its assertions. */
function processExit(child: ChildProcess): Promise<ProcessExit> {
    return new Promise(resolve => child.once('exit', (code, signal) => resolve({ code, signal })));
}

/** Reads one small JSON request body from the fake agent transport. */
async function requestBody(request: http.IncomingMessage): Promise<string> {
    let body = '';
    request.setEncoding('utf8');
    for await (const chunk of request) body += chunk;
    return body;
}

/** Completes one fake-agent request with a JSON response. */
function respondJson(response: ServerResponse, body: object): void {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify(body));
}

/** Waits for a synchronous observation without coupling the test to process scheduling. */
async function waitFor(predicate: () => boolean, description: string): Promise<void> {
    const deadline = Date.now() + 10_000;
    while (!predicate()) {
        if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${description}`);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

/** Waits for an HTTP-observed state transition while tolerating connection setup races. */
async function waitForAsync(predicate: () => Promise<boolean>, description: string): Promise<void> {
    const deadline = Date.now() + 10_000;
    while (true) {
        try {
            if (await predicate()) return;
        }
        catch {
            // The HTTP server may not yet be listening or may be between lifecycle operations.
        }
        if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${description}`);
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

/** Stops the fake agent after its runner has released the open command stream. */
function closeServer(server: http.Server): Promise<void> {
    return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
