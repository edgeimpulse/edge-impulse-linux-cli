import http, { ClientRequest, IncomingMessage } from 'node:http';
import fs from 'node:fs/promises';
import Path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
    Command,
    CommandResult,
    CompletedInferenceEvent,
    EventBatch,
    EventBatchResponse,
    InferenceRunnerRegistration,
    Input,
    RegisterResponse,
} from '../shared/device-protocol/workload-contract';
import {
    parseCommand,
    parseEventBatchResponse,
    parseRegisterResponse,
    serializeCommandResult,
    serializeEventBatch,
    serializeRegistration,
} from './workload-contract';

// Device agent endpoints:
// Registers or replaces the runner state held by the device agent.
const REGISTER_PATH = '/v1/register';
// Delivers completed inference events, with optional model inputs, to the device agent.
const EVENTS_PATH = '/v1/events';
// Opens the server-sent event stream on which the device agent delivers workload commands.
const COMMANDS_PATH = '/v1/commands';

const RECONNECT_DELAY_MS = 1000;
const INITIAL_CONNECT_MAX_DELAY_MS = 30000;
const REQUEST_TIMEOUT_MS = 10000;
const SHUTDOWN_FLUSH_TIMEOUT_MS = 3000;
const RETRYABLE_TRANSPORT_ERROR_CODES = new Set([
    'ENOENT',
    'ECONNREFUSED',
    'ECONNRESET',
    'EPIPE',
    'ETIMEDOUT',
]);

/**
 * Identifies socket failures that can succeed after the local agent starts or restarts. Contract,
 * JSON and HTTP response errors deliberately remain fatal because retrying cannot correct them.
 *
 * @param error Failure returned by an agent workload API request.
 */
function isRetryableTransportError(error: unknown): boolean {
    const code = (error as NodeJS.ErrnoException).code;
    return typeof code === 'string' && RETRYABLE_TRANSPORT_ERROR_CODES.has(code);
}

export interface AgentInferenceInput {
    type: 'jpg' | 'wav';
    buffer: Buffer;
}

export interface AgentClientOptions {
    // Maximum time to wait for one registration, event or command-result response.
    requestTimeoutMs?: number;
    // Base initial-connect backoff and fixed delay for recovering an established command stream.
    reconnectDelayMs?: number;
}

// This experimental module should remain excluded from public builds for now.
/**
 * Connects an agent-managed inference runner to the Edge Impulse device agent over HTTP/1.1 on a
 * Unix socket. In this mode the runner does not connect to Studio or Remote Management itself: it
 * registers its current model state with the local agent, while the agent owns device identity,
 * cloud communication, monitoring and updates. The client also maintains the server-sent command
 * stream, re-registering the runner's latest state when the agent restarts or the stream is lost.
 */
export class AgentClient {
    // Unix socket created by the device agent for this workload's HTTP API.
    private readonly _socketPath: string;
    // Maximum time an ordinary workload API request may wait for the agent to respond.
    private readonly _requestTimeoutMs: number;
    // Base initial-connect backoff and fixed delay for recovering an established command stream.
    private readonly _reconnectDelayMs: number;
    // Latest complete runner state, retained so a reconnected agent can be registered again.
    private _registration: InferenceRunnerRegistration | undefined;
    // Agent-provided session settings, including the current input collection policy.
    private _session: RegisterResponse | undefined;
    // Active HTTP request carrying the long-lived server-sent command stream.
    private _commandRequest: ClientRequest | undefined;
    // Delayed reconnect scheduled after registration or command-stream failure.
    private _reconnectTimer: NodeJS.Timeout | undefined;
    // Delay used while the initial connection waits for the agent socket to become available.
    private _initialConnectTimer: NodeJS.Timeout | undefined;
    // Rejects an initial-connect delay when shutdown starts.
    private _rejectInitialConnect: ((error: Error) => void) | undefined;
    // Times of recently attached inputs, used to enforce the agent's per-second limit.
    private _inputTimestamps: number[] = [];
    // Serializes command handling so command results are applied and acknowledged in order.
    private _commandQueue: Promise<void> = Promise.resolve();
    // Complete event-reporting operations that graceful shutdown must wait for.
    private _pendingEventRequests = new Set<Promise<EventBatchResponse>>();
    // Registration and command requests that shutdown must abort instead of leaving open.
    private _abortOnCloseRequests = new Set<ClientRequest>();
    // Prevents new work and reconnection after shutdown begins.
    private _closed = false;
    // Runner callback for workload commands not implemented by this transport client.
    private _onCommand: (command: Command) => Promise<void> | void = () => undefined;

    /**
     * Creates a client for the HTTP/1.1 workload API exposed on the agent's Unix socket.
     *
     * @param socketPath Path to the Unix socket created for this workload by the device agent.
     * @param options Optional request timeout and reconnection delay overrides.
     */
    constructor(socketPath: string, options: AgentClientOptions = {}) {
        this._socketPath = socketPath;
        this._requestTimeoutMs = options.requestTimeoutMs ?? REQUEST_TIMEOUT_MS;
        this._reconnectDelayMs = options.reconnectDelayMs ?? RECONNECT_DELAY_MS;
    }

    /**
     * Establishes the workload session by registering the runner, then opens the long-lived command
     * stream through which the agent will deliver future model and input-policy commands.
     *
     * @param registration Complete initial state of the runner before it has loaded a model.
     * @param onCommand Handler for validated commands delivered by the agent.
     */
    async connect(
        registration: InferenceRunnerRegistration,
        onCommand?: (command: Command) => Promise<void> | void
    ) {
        this._registration = registration;
        this._onCommand = onCommand || (() => undefined);
        // Compose does not guarantee that the agent socket exists before the runner starts. Retry
        // transport failures with exponential backoff so startup order is irrelevant without
        // repeatedly hammering an unavailable agent. Invalid contract responses remain fatal.
        let retryDelayMs = Math.min(this._reconnectDelayMs, INITIAL_CONNECT_MAX_DELAY_MS);
        while (!this._closed) {
            try {
                const response = await this.register(registration);
                this._session = response;
                this.openCommandStream();
                return response;
            }
            catch (ex2) {
                if (!isRetryableTransportError(ex2)) {
                    throw ex2;
                }
                await this.waitForInitialConnectRetry(retryDelayMs);
                retryDelayMs = Math.min(retryDelayMs * 2, INITIAL_CONNECT_MAX_DELAY_MS);
            }
        }
        throw new Error('Cannot connect after the agent client has closed');
    }

    /**
     * Replaces the agent's view of this runner after its active model changes while preserving the
     * existing command stream and workload session.
     *
     * @param registration Complete replacement state, including the model the runner now serves.
     */
    async updateRegistration(registration: InferenceRunnerRegistration): Promise<void> {
        this._registration = registration;
        try {
            this._session = await this.register(registration);
        }
        catch (error) {
            if (!isRetryableTransportError(error)) {
                throw error;
            }
            // Force session recovery even if the old command stream has not noticed the agent
            // restart. reconnect() will register the latest state before opening a new stream.
            const commandRequest = this._commandRequest;
            commandRequest?.destroy();
            this.reconnect(commandRequest);
        }
    }

    /**
     * Posts one completed inference to the agent, attaching its input only when the input policy from
     * registration selects it. An inline input is base64-encoded inside the event JSON. A spooled
     * input is written to the directory shared by the runner and agent, and the event names that file
     * so the bytes do not have to fit in the HTTP request.
     *
     * @param event Completed inference event whose model ID matches the current registration.
     * @param input Model input bytes, when this inference mode can provide them.
     */
    postInference(
        event: CompletedInferenceEvent,
        input?: AgentInferenceInput
    ): Promise<EventBatchResponse> {
        if (this._closed) {
            return Promise.reject(new Error('Cannot report an inference after the agent client has closed'));
        }
        const request = this.sendInference(event, input);
        this._pendingEventRequests.add(request);
        // Convert either outcome into a fulfilled cleanup chain. An ignored finally() would create a
        // second rejected promise when the request fails, which Node.js could report as unhandled.
        void request.then(() => undefined, () => undefined)
            .then(() => this._pendingEventRequests.delete(request));
        return request;
    }

    /**
     * Selects and prepares an optional input, posts the event, validates the response and removes any
     * temporary spool file. The public method tracks this complete operation for graceful shutdown.
     *
     * @param event Completed inference event whose model ID matches the current registration.
     * @param input Model input bytes, when this inference mode can provide them.
     */
    private async sendInference(
        event: CompletedInferenceEvent,
        input?: AgentInferenceInput
    ): Promise<EventBatchResponse> {
        const prepared = input && this.shouldAttachInput() ? await this.prepareInput(input) : undefined;
        const eventWithInput: CompletedInferenceEvent = prepared ? { ...event, input: prepared.input } : event;
        const batch: EventBatch = { events: [ eventWithInput ] };
        // Preserve an event request during graceful shutdown; close() waits for these separately.
        const request = this.request('POST', EVENTS_PATH, serializeEventBatch(batch), false);

        try {
            const response = await request;
            return parseEventBatchResponse(JSON.parse(response));
        }
        finally {
            if (prepared?.spoolPath) {
                await fs.rm(prepared.spoolPath, { force: true });
            }
        }
    }

    /**
     * Stops command delivery, cancels reconnection work and waits for event POSTs that were already
     * started. The runner calls this after stopping its sensor pipeline so SIGTERM does not lose the
     * final inferences that were already being sent to the agent. The wait is bounded so an
     * unavailable agent cannot keep the container alive past its shutdown grace period.
     */
    async close(): Promise<void> {
        this._closed = true;
        this._commandRequest?.destroy();
        this._commandRequest = undefined;
        for (const request of this._abortOnCloseRequests) {
            request.destroy(new Error('Agent client closed'));
        }
        if (this._reconnectTimer) {
            clearTimeout(this._reconnectTimer);
            this._reconnectTimer = undefined;
        }
        if (this._initialConnectTimer) {
            clearTimeout(this._initialConnectTimer);
            this._initialConnectTimer = undefined;
        }
        this._rejectInitialConnect?.(new Error('Agent client closed'));
        this._rejectInitialConnect = undefined;
        let timeout: NodeJS.Timeout | undefined;
        await Promise.race([
            Promise.allSettled(Array.from(this._pendingEventRequests)),
            new Promise<void>(resolve => timeout = setTimeout(resolve, SHUTDOWN_FLUSH_TIMEOUT_MS)),
        ]);
        if (timeout) {
            clearTimeout(timeout);
        }
    }

    /**
     * Posts the runner's complete current state and validates the session settings returned by the
     * agent before the runner uses them.
     *
     * @param registration Complete runner state that replaces the agent's previous view.
     */
    private async register(registration: InferenceRunnerRegistration): Promise<RegisterResponse> {
        const response = await this.request('POST', REGISTER_PATH, serializeRegistration(registration));
        return parseRegisterResponse(JSON.parse(response));
    }

    /**
     * Applies commands owned by the transport client and delegates workload-specific commands to the
     * runner. The input policy is updated before success is reported so subsequent events use it.
     *
     * @param command Validated command delivered by the agent's server-sent event stream.
     */
    private async handleCommand(command: Command): Promise<void> {
        if (command.type === 'updateInputPolicy') {
            if (!this._session) {
                throw new Error('Cannot update the input policy before registration');
            }
            this._session = { ...this._session, inputPolicy: command.inputPolicy };
            await this.postCommandResult({
                commandId: command.id,
                type: command.type,
                success: true,
            });
            return;
        }
        await this._onCommand(command);
    }

    /**
     * Reports whether a delivered command completed so the agent can commit the corresponding state
     * change and stop redelivering that command.
     *
     * @param result Success or failure result carrying the delivered command's ID and type.
     */
    private async postCommandResult(result: CommandResult): Promise<void> {
        const path = `/v1/commands/${encodeURIComponent(result.commandId)}/result`;
        await this.request('POST', path, serializeCommandResult(result));
    }

    /**
     * Applies the agent's sampling fraction and rate limit before input bytes are encoded or copied.
     * Events are always posted; this decision controls only whether their model input is attached.
     */
    private shouldAttachInput(): boolean {
        const policy = this._session?.inputPolicy;
        if (!policy || policy.mode === 'none') {
            return false;
        }
        if (policy.mode === 'fraction' && Math.random() >= policy.fraction) {
            return false;
        }

        const now = Date.now();
        this._inputTimestamps = this._inputTimestamps.filter(timestamp => timestamp > now - 1000);
        if (policy.maxPerSecond !== undefined && this._inputTimestamps.length >= policy.maxPerSecond) {
            return false;
        }
        this._inputTimestamps.push(now);
        return true;
    }

    /**
     * Converts selected input bytes into the representation allowed by the agent. Inline inputs are
     * base64 bytes embedded in the event JSON. Spooled inputs are files in the shared directory, with
     * only the relative filename and byte count included in the event. If no spool is available for
     * an oversized input, or writing the spool fails, the event is sent without that input.
     *
     * @param input Format and bytes of the input consumed by the model.
     */
    private async prepareInput(input: AgentInferenceInput): Promise<{
        input: Input,
        spoolPath?: string,
    } | undefined> {
        if (!this._session) {
            return undefined;
        }
        if (input.buffer.length <= this._session.inlineSizeLimitBytes) {
            return {
                input: {
                    location: 'inline',
                    type: input.type,
                    bufferBase64: input.buffer.toString('base64'),
                },
            };
        }
        if (!this._session.spoolDirectory) {
            return undefined;
        }

        const filename = `input-${randomUUID()}`;
        const spoolPath = Path.join(this._session.spoolDirectory, filename);
        try {
            await fs.writeFile(spoolPath, input.buffer, { flag: 'wx' });
        }
        catch {
            // The inference result is still useful when an optional input cannot be spooled. Remove
            // any partial file without allowing cleanup failure to discard the event as well.
            await fs.rm(spoolPath, { force: true }).catch(() => undefined);
            return undefined;
        }
        return {
            input: {
                location: 'spool',
                type: input.type,
                path: filename,
                sizeBytes: input.buffer.length,
            },
            spoolPath,
        };
    }

    /**
     * Opens the server-sent event response used for agent commands. If the stream ends, the client
     * starts session recovery so command delivery can resume.
     */
    private openCommandStream() {
        if (this._closed || !this._registration) {
            return;
        }

        let buffered = '';
        const req = http.request({
            socketPath: this._socketPath,
            path: COMMANDS_PATH,
            method: 'GET',
            headers: {
                accept: 'text/event-stream',
            },
        }, (res) => {
            let ended = false;
            const reconnect = () => {
                if (ended) {
                    return;
                }
                ended = true;
                this.reconnect(req);
            };
            if (res.statusCode !== 200) {
                res.resume();
                reconnect();
                return;
            }

            res.setEncoding('utf-8');
            res.on('data', (chunk: string) => {
                buffered += chunk;
                const records = buffered.split(/\r?\n\r?\n/);
                buffered = records.pop() || '';
                for (const record of records) {
                    const data = record.split(/\r?\n/)
                        .filter(line => line.startsWith('data:'))
                        .map(line => line.slice('data:'.length).trimStart())
                        .join('\n');
                    if (data) {
                        let command: Command;
                        try {
                            command = parseCommand(JSON.parse(data));
                        }
                        catch {
                            res.destroy();
                            reconnect();
                            return;
                        }
                        this._commandQueue = this._commandQueue
                            .then(() => this.handleCommand(command))
                            .catch(() => {
                                req.destroy();
                                reconnect();
                            });
                    }
                }
            });
            res.on('end', reconnect);
            res.on('error', reconnect);
            res.on('close', reconnect);
        });
        this._commandRequest = req;
        req.on('error', () => this.reconnect(req));
        req.end();
    }

    /**
     * Schedules session recovery after the agent restarts or the command stream disconnects. Recovery
     * re-registers the runner's latest state before opening a replacement command stream.
     *
     * @param request Command-stream request that ended, if recovery was triggered by a stream.
     */
    private reconnect(request?: ClientRequest) {
        if (request && request !== this._commandRequest) {
            return;
        }
        this._commandRequest = undefined;
        if (this._closed || this._reconnectTimer || !this._registration) {
            return;
        }
        // An established runner keeps serving inference while the agent restarts, so retry at a
        // short fixed interval to restore command delivery promptly.
        this._reconnectTimer = setTimeout(() => {
            this._reconnectTimer = undefined;
            if (this._closed || !this._registration) {
                return;
            }
            this.register(this._registration)
                .then(response => {
                    this._session = response;
                    this.openCommandStream();
                })
                .catch(() => this.reconnect());
        }, this._reconnectDelayMs);
        this._reconnectTimer.unref();
    }

    /**
     * Waits before retrying the initial registration, while allowing shutdown to reject the pending
     * connection attempt immediately.
     *
     * @param delayMs Current exponential-backoff delay before the next registration attempt.
     */
    private waitForInitialConnectRetry(delayMs: number): Promise<void> {
        if (this._closed) {
            return Promise.reject(new Error('Agent client closed'));
        }
        return new Promise((resolve, reject) => {
            this._rejectInitialConnect = reject;
            this._initialConnectTimer = setTimeout(() => {
                this._initialConnectTimer = undefined;
                this._rejectInitialConnect = undefined;
                resolve();
            }, delayMs);
        });
    }

    /**
     * Sends one JSON request over the agent's Unix socket and returns its response body, rejecting
     * non-successful HTTP responses so registration cannot continue with invalid agent state.
     *
     * @param method HTTP method for the workload API operation.
     * @param path Versioned workload API path on the agent.
     * @param body Serialized JSON request body.
     * @param abortOnClose Whether shutdown should cancel this request instead of waiting for it.
     */
    private request(method: string, path: string, body: string, abortOnClose = true): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = http.request({
                socketPath: this._socketPath,
                path,
                method,
                headers: {
                    'content-type': 'application/json',
                    'content-length': Buffer.byteLength(body),
                },
            }, (res: IncomingMessage) => {
                let responseBody = '';
                res.setEncoding('utf-8');
                res.on('data', chunk => responseBody += chunk);
                res.on('end', () => {
                    if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                        reject(new Error(`Agent returned HTTP ${res.statusCode || 'unknown'}: ${responseBody}`));
                        return;
                    }
                    resolve(responseBody);
                });
            });
            if (abortOnClose) {
                this._abortOnCloseRequests.add(req);
            }
            req.setTimeout(this._requestTimeoutMs, () => {
                const error = <NodeJS.ErrnoException>new Error(
                    `Agent request timed out after ${this._requestTimeoutMs} ms`);
                error.code = 'ETIMEDOUT';
                req.destroy(error);
            });
            req.on('error', reject);
            req.on('close', () => this._abortOnCloseRequests.delete(req));
            req.end(body);
        });
    }
}
