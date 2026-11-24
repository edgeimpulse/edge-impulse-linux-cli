import http, { ClientRequest, IncomingMessage } from 'node:http';
import fs from 'node:fs/promises';
import Path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
    CaptureMetadata,
    CaptureSample,
    Command,
    CommandResult,
    CompletedInferenceEvent,
    ContractErrorCode,
    EventBatch,
    EventBatchResponse,
    InferenceRunnerRegistration,
    Input,
    RegisterResponse,
} from '../shared/device-protocol/application-contract';
import {
    parseCommand,
    parseEventBatchResponse,
    parseRegisterResponse,
    serializeCommandResult,
    serializeEventBatch,
    serializeRegistration,
} from './application-contract';

// Device agent endpoints:
// Registers or replaces the runner state held by the device agent.
const REGISTER_PATH = '/v1/register';
// Delivers completed inference events, with optional model inputs, to the device agent.
const EVENTS_PATH = '/v1/events';
// Opens the server-sent event stream on which the device agent delivers application commands.
const COMMANDS_PATH = '/v1/commands';

const RECONNECT_DELAY_MS = 1000;
const INITIAL_CONNECT_MAX_DELAY_MS = 30000;
const REQUEST_TIMEOUT_MS = 10000;
const SHUTDOWN_FLUSH_TIMEOUT_MS = 3000;
// Matches the device agent's default activation lease so an ambiguous result cannot block rollback forever.
const COMMAND_RESULT_RETRY_TIMEOUT_MS = 60000;
const COMPLETED_COMMAND_CACHE_SIZE = 100;
const RETAINED_CAPTURE_COUNT = 4;
const RETRYABLE_TRANSPORT_ERROR_CODES = new Set([
    'ENOENT',
    'ECONNREFUSED',
    'ECONNRESET',
    'EPIPE',
    'ETIMEDOUT',
]);

/** Non-success response from the agent application API, including its contract refusal code. */
class AgentRequestError extends Error {
    /** HTTP response status returned by the agent. */
    readonly statusCode: number | undefined;
    /** Structured refusal reason, when the response contains a valid contract error. */
    readonly contractCode: ContractErrorCode | undefined;

    /** Creates an error for one refused application API request. */
    constructor(statusCode: number | undefined, responseBody: string) {
        const contractError = parseContractError(responseBody);
        super(`Agent returned HTTP ${statusCode || 'unknown'}: ${responseBody}`);
        this.statusCode = statusCode;
        this.contractCode = contractError?.code;
    }
}

/** Reads the small portion of a contract error needed to choose command-stream recovery. */
function parseContractError(responseBody: string): { code: ContractErrorCode } | undefined {
    try {
        const value = JSON.parse(responseBody) as { code?: unknown };
        const codes: ContractErrorCode[] = [
            'invalid_request', 'not_registered', 'rate_limited', 'unknown_command',
            'unsupported_version', 'internal',
        ];
        if (typeof value.code === 'string' && codes.includes(value.code as ContractErrorCode)) {
            return { code: value.code as ContractErrorCode };
        }
    }
    catch {
        // The original HTTP response remains available in AgentRequestError for diagnostics.
    }
    return undefined;
}

/**
 * Identifies socket failures that can succeed after the local agent starts or restarts. Contract,
 * JSON and HTTP response errors deliberately remain fatal because retrying cannot correct them.
 *
 * @param error Failure returned by an agent application API request.
 */
function isRetryableTransportError(error: unknown): boolean {
    const code = (error as NodeJS.ErrnoException).code;
    return typeof code === 'string' && RETRYABLE_TRANSPORT_ERROR_CODES.has(code);
}

/** Whether a failed result post indicates that the command session itself must be rebuilt. */
function shouldRecoverCommandSession(error: unknown): boolean {
    return isRetryableTransportError(error) ||
        (error instanceof AgentRequestError && error.contractCode === 'not_registered');
}

/** Whether the agent may have accepted a command result and requires the identical result to be retried. */
function shouldRetryCommandResult(error: unknown): boolean {
    return error instanceof AgentRequestError &&
        (error.statusCode === 408 || error.contractCode === 'internal');
}

/** Encoded sensor input attached to an inference event for agent-side capture and inspection. */
export type AgentInferenceInput = {
    type: 'jpg' | 'wav';
    buffer: Buffer;
};

/**
 * Sensor input prepared for delivery from runner to agent, with ownership of its temporary storage.
 * Bytes travel as base64 in the request or through a file in a directory shared with the agent (the spool).
 */
export type PreparedAgentInput = {
    /** Request data: inline base64, or the shared file's relative path, format and byte count. */
    input: Input;
    /** Base64 memory bytes or shared-file bytes counted against capture-result retention limits. */
    retainedBytes: number;
    /** Deletes the shared file; a no-op for inline input. Called after use, capture eviction or shutdown. */
    release(): Promise<void>;
};

/**
 * Capture handler return value, carrying the sample to send and its temporary-storage ownership.
 * The command processor retains it after failed delivery so redelivery can reuse the same physical sample.
 */
export type PreparedCaptureSample = {
    /** Sample included in the command result: encoded input plus sensor, timestamp and image/audio metadata. */
    capture: CaptureSample;
    /** Owns capture.input's storage until agent acknowledgement, retention eviction or processor shutdown. */
    preparedInput: PreparedAgentInput;
};

/** Request timeout and reconnect timing used by the local agent transport. */
export type AgentClientOptions = {
    // Maximum time to wait for one registration, event or command-result response.
    requestTimeoutMs?: number;
    // Base initial-connect backoff and fixed delay for recovering an established command stream.
    reconnectDelayMs?: number;
    // Maximum total time to retry an ambiguous command-result response before later commands proceed.
    commandResultRetryTimeoutMs?: number;
};

/** Value returned by each command handler; only capture carries result data and retained resources. */
export type CommandHandlerOutput<T extends Command['type']> =
    T extends 'capture' ? PreparedCaptureSample : void;

/** Type-specific application command operation registered by the runner. */
export type AgentCommandHandler<T extends Command['type']> =
    (command: Extract<Command, { type: T }>) => Promise<CommandHandlerOutput<T>>;

/** Type-erased command handler stored after on() checks its command key. */
type StoredCommandHandler = (command: Command) => Promise<CommandHandlerOutput<Command['type']>>;

/** A capture delivery retained for consistent redelivery while it remains in the bounded history. */
type CaptureCompletion = {
    command: Extract<Command, { type: 'capture' }>;
    result: CommandResult;
    preparedInput?: PreparedAgentInput;
};

/**
 * Posts a completed result to the agent. Rejection means delivery failed, not that the command's
 * action was undone; the agent can redeliver the command through a later stream.
 */
type CommandResultSender = (result: CommandResult) => Promise<void>;

/** Returns the target byte budget for older unacknowledged capture results. */
type RetainedByteLimit = () => number;

/**
 * Owns command registration, ordered execution and result posting. The transport only needs to
 * pass each validated command to process().
 */
export class AgentCommandProcessor {
    private readonly _postResult: CommandResultSender;
    private readonly _retainedByteLimit: RetainedByteLimit;
    private readonly _handlers = new Map<Command['type'], StoredCommandHandler>();
    // Commands execute in delivery order. A failed result post does not poison later work.
    private _queue: Promise<void> = Promise.resolve();
    // Ordinary commands are deliberately reapplied. Capture keeps a bounded completion history because
    // repeating a pending command would create a different physical sample.
    private _recentCaptures = new Map<string, CaptureCompletion>();
    private _retainedBytes = 0;
    private _closed = false;
    private _closePromise: Promise<void> | undefined;

    /**
     * Creates a processor whose completed results are sent through the supplied transport operation.
     *
     * @param postResult Posts one completed result and resolves when the agent accepts it.
     * @param retainedByteLimit Target budget used to evict older unacknowledged capture payloads.
     */
    constructor(postResult: CommandResultSender, retainedByteLimit: RetainedByteLimit = () => Infinity) {
        this._postResult = postResult;
        this._retainedByteLimit = retainedByteLimit;
    }

    /**
     * Registers the sole handler for one command type.
     *
     * @param type Command type owned by this definition.
     * @param handler Applies one validated command of this type.
     */
    on<T extends Command['type']>(type: T, handler: AgentCommandHandler<T>): void {
        if (this._handlers.has(type)) {
            throw new Error(`A handler is already registered for command "${type}"`);
        }
        this._handlers.set(type, handler as unknown as StoredCommandHandler);
    }

    /**
     * Processes one validated delivery after earlier commands, including posting its final result.
     *
     * @param command Command received from the agent stream.
     */
    process(command: Command): Promise<void> {
        if (this._closed) {
            return Promise.reject(new Error('Cannot process a command after the processor has closed'));
        }
        const processing = this._queue.then(() => this.processDelivery(command));
        this._queue = processing.catch(() => undefined);
        return processing;
    }

    /** Waits until every queued command has attempted to post its result, up to the supplied bound. */
    async waitForIdle(timeoutMs: number): Promise<void> {
        let timer: NodeJS.Timeout | undefined;
        try {
            await Promise.race([
                this._queue,
                new Promise<void>(resolve => timer = setTimeout(resolve, timeoutMs)),
            ]);
        }
        finally {
            if (timer) clearTimeout(timer);
        }
    }

    /** Stops new command work, drains started work for a bounded time, then releases retained inputs. */
    close(timeoutMs: number): Promise<void> {
        if (this._closePromise) return this._closePromise;
        this._closed = true;
        this._closePromise = (async () => {
            await this.waitForIdle(timeoutMs);
            const retainedInputs: PreparedAgentInput[] = [];
            for (const completion of this._recentCaptures.values()) {
                if (completion.preparedInput) {
                    retainedInputs.push(completion.preparedInput);
                    completion.preparedInput = undefined;
                }
            }
            this._recentCaptures.clear();
            this._retainedBytes = 0;
            await Promise.all(retainedInputs.map(input => this.releaseInput(input)));
        })();
        return this._closePromise;
    }

    /** Executes one delivered command, then posts its completed result to the agent. */
    private async processDelivery(command: Command): Promise<void> {
        if (this._closed) {
            throw new Error('Cannot process a command after the processor has closed');
        }
        // Capture owns a physical sample, so its retry and cleanup rules belong in a separate path.
        if (command.type === 'capture') {
            await this.processCaptureDelivery(command);
            return;
        }
        if (this._recentCaptures.has(command.id)) {
            throw new Error(`Command ID "${command.id}" was reused for type "${command.type}"`);
        }

        // Reapply ordinary commands on every delivery to restore state after agent reconnection.
        const completion = await this.executeCommand(command, this._handlers.get(command.type));
        await this._postResult(completion.result);
    }

    /** Reuses a retained capture outcome on redelivery and releases its sample only after acceptance. */
    private async processCaptureDelivery(command: Extract<Command, { type: 'capture' }>): Promise<void> {
        let completion = this._recentCaptures.get(command.id);
        if (!completion) {
            // Save the outcome before posting: a lost response must not trigger another physical capture.
            completion = await this.executeCommand(command, this._handlers.get('capture'));
            await this.rememberCapture(completion);
        }

        // A rejected POST leaves the sample retained for redelivery; it does not undo the capture.
        await this._postResult(completion.result);
        await this.acknowledgeCapture(completion);
    }

    /** Runs the command handler and converts success or failure into a contract result. */
    private async executeCommand<T extends Command>(
        command: T,
        handler: StoredCommandHandler | undefined
    ): Promise<{ command: T; result: CommandResult; preparedInput?: PreparedAgentInput }> {
        let result: CommandResult;
        let preparedInput: PreparedAgentInput | undefined;
        try {
            if (!handler) {
                throw new Error(`No handler is registered for command "${command.type}"`);
            }
            const output = await handler(command);
            if (command.type === 'capture') {
                if (!output || !('capture' in output)) {
                    throw new Error('Capture command handler did not return a sample');
                }
                // Successful captures return both wire data and the resource retained for result retries.
                preparedInput = output.preparedInput;
                result = {
                    capture: output.capture,
                    commandId: command.id,
                    type: command.type,
                    success: true,
                };
            }
            else {
                result = {
                    commandId: command.id,
                    type: command.type,
                    success: true,
                };
            }
        }
        catch (ex2) {
            const ex = <Error>ex2;
            result = {
                commandId: command.id,
                type: command.type,
                success: false,
                reason: ex.message || ex.toString(),
            };
        }
        return { command, result, preparedInput };
    }

    /** Saves a bounded capture history so pending redelivery can reuse the original outcome. */
    private async rememberCapture(completion: CaptureCompletion): Promise<void> {
        if (this._closed) {
            // Shutdown may finish draining before the handler returns; do not retain its late sample.
            if (completion.preparedInput) {
                await this.releaseInput(completion.preparedInput);
                completion.preparedInput = undefined;
            }
            return;
        }
        // Map insertion order lets us evict the oldest outcomes first.
        this._recentCaptures.set(completion.command.id, completion);
        this._retainedBytes += completion.preparedInput?.retainedBytes || 0;
        await this.enforceRetentionLimit(completion.command.id);

        // Bound compact markers too. Deduplication applies only while an ID remains in this history.
        while (this._recentCaptures.size > COMPLETED_COMMAND_CACHE_SIZE) {
            const oldestCommandId = this._recentCaptures.keys().next().value;
            if (!oldestCommandId) break;
            const oldest = this._recentCaptures.get(oldestCommandId);
            if (oldest?.preparedInput) {
                this._retainedBytes -= oldest.preparedInput.retainedBytes;
                await this.releaseInput(oldest.preparedInput);
            }
            this._recentCaptures.delete(oldestCommandId);
        }
    }

    /** Releases an accepted capture payload and keeps a compact marker that prevents recapture. */
    private async acknowledgeCapture(completion: CaptureCompletion): Promise<void> {
        const preparedInput = completion.preparedInput;
        if (!preparedInput) return;
        // Acceptance transfers the sample to the agent. Keep only a failure marker for stale redelivery.
        this._retainedBytes -= preparedInput.retainedBytes;
        // Clear ownership before asynchronous deletion so concurrent shutdown cannot release it twice.
        completion.preparedInput = undefined;
        completion.result = this.captureTombstone(
            completion, 'Capture result was already acknowledged; capture was not repeated');
        await this.releaseInput(preparedInput);
    }

    /** Evicts older payloads while preserving bounded markers for pending command redelivery. */
    private async enforceRetentionLimit(newestCommandId: string): Promise<void> {
        const limit = this._retainedByteLimit();
        // Drop older payloads first; preserve their IDs so retries report expiry instead of recapturing.
        for (const completion of this._recentCaptures.values()) {
            if (this._retainedBytes <= limit) break;
            // Allow the newest sample its first delivery even if it alone exceeds the target budget.
            if (completion.command.id === newestCommandId || !completion.preparedInput) continue;
            const preparedInput = completion.preparedInput;
            // Replace the wire result as well as its resource; keeping base64 here would retain the bytes.
            this._retainedBytes -= preparedInput.retainedBytes;
            completion.preparedInput = undefined;
            completion.result = this.captureTombstone(
                completion, 'Capture result expired before delivery; capture was not repeated');
            await this.releaseInput(preparedInput);
        }
    }

    /** Builds a compact failure for a capture whose sample must no longer be retained. */
    private captureTombstone(completion: CaptureCompletion, reason: string): CommandResult {
        return {
            commandId: completion.command.id,
            type: 'capture',
            success: false,
            reason,
        };
    }

    /** Releases retained resources without changing an already-completed command outcome. */
    private async releaseInput(preparedInput: PreparedAgentInput): Promise<void> {
        try {
            await preparedInput.release();
        }
        catch (error) {
            const ex = error instanceof Error ? error : new Error(String(error));
            console.warn(`Failed to release retained command input: ${ex.message}`);
        }
    }

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
    // Command ownership exposed to the runner before the command stream is opened.
    readonly commands: AgentCommandProcessor;
    // Unix socket created by the device agent for this application's HTTP API.
    private readonly _socketPath: string;
    // Maximum time an ordinary application API request may wait for the agent to respond.
    private readonly _requestTimeoutMs: number;
    // Base initial-connect backoff and fixed delay for recovering an established command stream.
    private readonly _reconnectDelayMs: number;
    // Bound on ambiguous same-ID result retries so replacement and rollback commands cannot starve.
    private readonly _commandResultRetryTimeoutMs: number;
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
    // Complete event-reporting operations that graceful shutdown must wait for.
    private _pendingEventRequests = new Set<Promise<EventBatchResponse>>();
    // Registration and command requests that shutdown must abort instead of leaving open.
    private _abortOnCloseRequests = new Set<ClientRequest>();
    // Prevents new work and reconnection after shutdown begins.
    private _closed = false;

    /**
     * Creates a client for the HTTP/1.1 application API exposed on the agent's Unix socket.
     *
     * @param socketPath Path to the Unix socket created for this application by the device agent.
     * @param options Optional request timeout and reconnection delay overrides.
     */
    constructor(socketPath: string, options: AgentClientOptions = {}) {
        this._socketPath = socketPath;
        this._requestTimeoutMs = options.requestTimeoutMs ?? REQUEST_TIMEOUT_MS;
        this._reconnectDelayMs = options.reconnectDelayMs ?? RECONNECT_DELAY_MS;
        this._commandResultRetryTimeoutMs = options.commandResultRetryTimeoutMs ??
            COMMAND_RESULT_RETRY_TIMEOUT_MS;
        this.commands = new AgentCommandProcessor(
            result => this.postCommandResult(result),
            () => (this._session?.inlineSizeLimitBytes || 0) * RETAINED_CAPTURE_COUNT);
        // On policy delivery, apply it before success because subsequent events must use the new value.
        this.commands.on('updateInputPolicy', command => this.applyInputPolicy(command.inputPolicy));
    }

    /**
     * Establishes the application session by registering the runner, then opens the long-lived command
     * stream through which the agent will deliver future model and input-policy commands.
     *
     * @param registration Complete initial state of the runner before it has loaded a model.
     */
    async connect(registration: InferenceRunnerRegistration) {
        this._registration = registration;
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
     * Publishes the runner's current model after activation while preserving the command stream and
     * application session.
     *
     * @param registration Complete state, including the model the runner now serves.
     */
    async updateRegistration(registration: InferenceRunnerRegistration): Promise<void> {
        try {
            const session = await this.register(registration);
            // Only confirmed state is used for later reconnects. A timed-out request may have been
            // accepted, so startup still treats that activation as unconfirmed.
            this._registration = registration;
            this._session = session;
        }
        catch (error) {
            if (!isRetryableTransportError(error)) {
                throw error;
            }
            // Force session recovery even if the old command stream has not noticed the agent
            // restart. reconnect() restores the last confirmed state before opening a new stream.
            const commandRequest = this._commandRequest;
            commandRequest?.destroy();
            this.reconnect(commandRequest);
            // A bundle command succeeds only after the agent accepts its model registration.
            throw error;
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
        const prepared = input && this.shouldAttachInput() ?
            await this.prepareInput(input, { purpose: 'inference' }) : undefined;
        const eventWithInput: CompletedInferenceEvent = prepared ? { ...event, input: prepared.input } : event;
        const batch: EventBatch = { events: [ eventWithInput ] };
        // Preserve an event request during graceful shutdown; close() waits for these separately.
        const request = this.request('POST', EVENTS_PATH, serializeEventBatch(batch), false);

        try {
            const response = await request;
            return parseEventBatchResponse(JSON.parse(response));
        }
        finally {
            await prepared?.release();
        }
    }

    /**
     * Stops command delivery, releases retained command inputs, cancels reconnection work and waits
     * for event POSTs that were already started. The runner calls this after stopping its sensor
     * pipeline so SIGTERM does not lose final inferences or leave capture spool files behind. Waits
     * are bounded so an unavailable agent cannot keep the container alive past its shutdown grace.
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
        await this.commands.close(SHUTDOWN_FLUSH_TIMEOUT_MS);
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
     * Posts a completed result so the agent can resolve the command and stop redelivering its ID.
     *
     * @param result Success or failure produced by the command processor.
     */
    private async postCommandResult(result: CommandResult): Promise<void> {
        const path = `/v1/commands/${encodeURIComponent(result.commandId)}/result`;
        const body = serializeCommandResult(result);
        const retryStartedAt = Date.now();
        let lastAmbiguousError: Error | undefined;
        while (!this._closed) {
            if (lastAmbiguousError &&
                Date.now() - retryStartedAt >= this._commandResultRetryTimeoutMs) {
                throw new Error(
                    `Stopped retrying result for command "${result.commandId}" after ` +
                    `${this._commandResultRetryTimeoutMs} ms: ${lastAmbiguousError.message}`);
            }
            try {
                await this.request('POST', path, body);
                return;
            }
            catch (error) {
                // The agent may stop waiting while a command is still completing. The action remains
                // complete locally, and reconnecting cannot make that expired command valid again.
                if (error instanceof AgentRequestError && error.contractCode === 'unknown_command') return;
                if (!shouldRetryCommandResult(error)) throw error;
                lastAmbiguousError = error instanceof Error ? error : new Error(String(error));
                const retryTimeRemaining = this._commandResultRetryTimeoutMs -
                    (Date.now() - retryStartedAt);
                if (retryTimeRemaining <= 0) continue;
                await new Promise(resolve => setTimeout(
                    resolve,
                    Math.min(this._reconnectDelayMs, retryTimeRemaining)
                ));
            }
        }
        throw new Error('Cannot post a command result after the agent client has closed');
    }

    /** Applies the input policy before its successful command result is posted. */
    private applyInputPolicy(inputPolicy: RegisterResponse['inputPolicy']): Promise<void> {
        if (!this._session) {
            throw new Error('Cannot update the input policy before registration');
        }
        this._session = { ...this._session, inputPolicy };
        return Promise.resolve();
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
     * Encodes sensor bytes using the current session's inline limit and shared spool directory.
     * Inference input is optional: preparation failure omits it so the prediction can still be sent.
     * Capture input is required: preparation failure rejects the command rather than returning success
     * without a sample. The caller owns the returned resource and must release it after use.
     *
     * @param input JPEG or WAV bytes to send to the agent.
     * @param options Consumer of the input, which determines whether preparation failure is fatal.
     */
    private prepareInput(
        input: AgentInferenceInput, options: { purpose: 'capture' }
    ): Promise<PreparedAgentInput>;
    private prepareInput(
        input: AgentInferenceInput, options: { purpose: 'inference' }
    ): Promise<PreparedAgentInput | undefined>;
    private async prepareInput(
        input: AgentInferenceInput, options: { purpose: 'capture' | 'inference' }
    ): Promise<PreparedAgentInput | undefined> {
        if (!this._session) {
            if (options.purpose === 'capture') throw new Error('Cannot prepare capture input before agent registration');
            return undefined;
        }
        if (input.buffer.length <= this._session.inlineSizeLimitBytes) {
            const bufferBase64 = input.buffer.toString('base64');
            return {
                input: {
                    location: 'inline',
                    type: input.type,
                    bufferBase64,
                },
                retainedBytes: Buffer.byteLength(bufferBase64),
                release: () => Promise.resolve(),
            };
        }
        if (!this._session.spoolDirectory) {
            if (options.purpose === 'capture') throw new Error('Capture exceeds the inline limit and no agent spool is available');
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
            if (options.purpose === 'capture') throw new Error('Failed to write capture input to the agent spool');
            return undefined;
        }
        let released = false;
        return {
            input: {
                location: 'spool',
                type: input.type,
                path: filename,
                sizeBytes: input.buffer.length,
            },
            retainedBytes: input.buffer.length,
            release: async () => {
                if (released) return;
                released = true;
                await fs.rm(spoolPath, { force: true });
            },
        };
    }

    /**
     * Packages a live sensor capture as a command-result sample and transfers input ownership to the
     * command processor. The processor retains it across failed result POSTs and releases it after
     * acknowledgement, eviction or shutdown. Rejects if the required bytes cannot be prepared.
     *
     * @param input Captured JPEG or WAV bytes.
     * @param metadata Sensor name, capture time and dimensions or audio properties of these bytes.
     */
    async prepareCapture(input: AgentInferenceInput, metadata: CaptureMetadata): Promise<PreparedCaptureSample> {
        const preparedInput = await this.prepareInput(input, { purpose: 'capture' });
        return {
            capture: {
                input: preparedInput.input,
                metadata,
            },
            preparedInput,
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
                        this.commands.process(command)
                            .catch(error => {
                                if (shouldRecoverCommandSession(error)) {
                                    req.destroy();
                                    reconnect();
                                }
                                else {
                                    const ex = error instanceof Error ? error : new Error(String(error));
                                    console.warn(`Failed to post command result: ${ex.message}`);
                                }
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
     * @param method HTTP method for the application API operation.
     * @param path Versioned application API path on the agent.
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
                        reject(new AgentRequestError(res.statusCode, responseBody));
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
