import type { AgentClient } from '../../cli-common/agent-client';
import type {
    ActivateBundleCommand,
    InferenceRunnerRegistration,
} from '../../shared/device-protocol/application-contract';
import {
    AgentBundlePreparationError,
    PreparedAgentBundle,
    PrepareAgentBundleOptions,
    prepareAgentBundle,
    ValidateAgentBundleOptions,
    validateAgentBundle,
} from './agent-bundle';

/** Coordinates the first command with runner startup without completing it before serving begins. */
class InitialBundleActivation {
    private _candidate: PreparedAgentBundle | undefined;
    private readonly _candidateReady: Promise<PreparedAgentBundle>;
    private readonly _servingReady: Promise<void>;
    // On candidate preparation, release runner startup because it can build the serving pipeline.
    private _publishCandidate: (candidate: PreparedAgentBundle) => void = () => undefined;
    // On unconfirmed candidate cleanup, fail runner startup because the process is no longer safely empty.
    private _rejectCandidate: (error: Error) => void = () => undefined;
    // On serving commit, complete the command because inference and registration now agree.
    private _completeActivation: () => void = () => undefined;
    // On startup failure, reject the command because its prepared bundle was never committed.
    private _failActivation: (error: Error) => void = () => undefined;

    /** Creates the signals shared by the command handler and runner startup. */
    constructor() {
        this._candidateReady = new Promise((resolve, reject) => {
            this._publishCandidate = resolve;
            this._rejectCandidate = reject;
        });
        this._servingReady = new Promise((resolve, reject) => {
            this._completeActivation = resolve;
            this._failActivation = reject;
        });
    }

    /** Publishes the prepared first bundle to runner startup. */
    publish(candidate: PreparedAgentBundle): void {
        if (this._candidate) throw new Error('The initial bundle has already been prepared');
        this._candidate = candidate;
        this._publishCandidate(candidate);
    }

    /** Resolves when the first activate command has prepared a valid bundle. */
    waitForCandidate(): Promise<PreparedAgentBundle> {
        return this._candidateReady;
    }

    /** Resolves when runner startup confirms that the first bundle can accept inference. */
    waitUntilServing(): Promise<void> {
        return this._servingReady;
    }

    /** Returns the prepared first bundle. */
    candidate(): PreparedAgentBundle {
        if (!this._candidate) {
            throw new Error('Cannot start bundle serving before the first bundle is prepared');
        }
        return this._candidate;
    }

    /** Completes the first command after its serving state and registration are committed. */
    complete(): void {
        this._completeActivation();
    }

    /** Rejects the first command if startup fails after its bundle was prepared. */
    fail(error: Error): void {
        if (this._candidate) this._failActivation(error);
    }

    /** Rejects empty startup when failed cleanup leaves ownership of a candidate uncertain. */
    abort(error: Error): void {
        if (!this._candidate) this._rejectCandidate(error);
    }
}

/** Runner-owned rules for configuring the initial model and describing its registered identity. */
export type AgentBundlePreparationPolicy = {
    // On initial commit or same-bundle redelivery, build registration from the prepared bundle.
    createRegistration(bundle?: PreparedAgentBundle): InferenceRunnerRegistration;
    // Before initial serving, apply CLI model settings because they must precede registration.
    configure(candidate: PreparedAgentBundle): Promise<void>;
    // Before initial preparation, resolve the configured input mode for runtime compatibility checks.
    servingMode(): PrepareAgentBundleOptions['servingMode'];
};

/** Outcome that tells the command owner whether activation completed or requires process restart. */
export type AgentBundleActivationResult =
    | { kind: 'activated' }
    | { kind: 'restart-required' };

/** Canonical bundle paired with the exact registration accepted by the agent. */
type CommittedBundle = {
    bundle: PreparedAgentBundle;
    registration: InferenceRunnerRegistration;
};

/** Stable lifecycle state before and after the initial bundle is committed. */
type BundleLifecycleState =
    | { kind: 'waiting' }
    | { kind: 'active'; current: CommittedBundle };

/** Dependencies and fixed settings required to validate and initially prepare bundles. */
export type AgentBundleLifecycleOptions = {
    // Application client used to publish the model identity after successful activation.
    agentClient: Pick<AgentClient, 'updateRegistration'>;
    // Runner-specific initial preparation and registration decisions.
    policy: AgentBundlePreparationPolicy;
    // Host values used to validate bundle files before any model process starts.
    validateOptions: ValidateAgentBundleOptions;
    // Process settings used only when initializing the first model in this process.
    prepareOptions: Omit<PrepareAgentBundleOptions, 'onRunnerCreated' | 'servingMode'>;
};

/** Coordinates initial activation and decides when a later valid bundle requires process restart. */
export class AgentBundleLifecycle {
    private readonly _agentClient: AgentBundleLifecycleOptions['agentClient'];
    private readonly _policy: AgentBundlePreparationPolicy;
    private readonly _validateOptions: AgentBundleLifecycleOptions['validateOptions'];
    private readonly _prepareOptions: AgentBundleLifecycleOptions['prepareOptions'];
    private readonly _initialActivation = new InitialBundleActivation();
    private _state: BundleLifecycleState = { kind: 'waiting' };
    // Runner prepared but not committed, retained so startup failure can stop it explicitly.
    private _pendingRunner: PreparedAgentBundle['runner'] | undefined;

    /** Creates a lifecycle coordinator for one agent-managed runner process. */
    constructor(options: AgentBundleLifecycleOptions) {
        this._agentClient = options.agentClient;
        this._policy = options.policy;
        this._validateOptions = options.validateOptions;
        this._prepareOptions = options.prepareOptions;
    }

    /** Activates the first bundle or validates a later bundle before requesting process restart. */
    async activateBundle(command: ActivateBundleCommand): Promise<AgentBundleActivationResult> {
        if (this._state.kind === 'waiting') {
            await this.activateInitialBundle(command);
            return { kind: 'activated' };
        }

        if (sameBundle(command, this._state.current.bundle)) {
            await this._agentClient.updateRegistration(this._state.current.registration);
            return { kind: 'activated' };
        }

        await validateAgentBundle(command, this._validateOptions);
        return { kind: 'restart-required' };
    }

    /** Returns the model ID whose serving state and registration are both committed. */
    activeModelId(): string | undefined {
        return this._state.kind === 'active' ?
            this._state.current.bundle.manifestModel.id : undefined;
    }

    /** Returns the first prepared bundle so runner startup can build its serving pipeline. */
    waitForInitialBundle(): Promise<PreparedAgentBundle> {
        return this._initialActivation.waitForCandidate();
    }

    /** Stops the runner currently being prepared if process shutdown interrupts activation. */
    async stopPendingRunner(): Promise<void> {
        const pendingRunner = this._pendingRunner;
        if (!pendingRunner) return;

        await pendingRunner.stop();
        if (this._pendingRunner === pendingRunner) this._pendingRunner = undefined;
    }

    /** Commits registration after the initial serving pipeline starts, then completes the command. */
    async completeInitialActivation(): Promise<void> {
        const candidate = this._initialActivation.candidate();
        const registration = this._policy.createRegistration(candidate);
        try {
            await this._agentClient.updateRegistration(registration);
        }
        catch (error) {
            const failures = [ asError(error).message ];
            try {
                await this._agentClient.updateRegistration(this._policy.createRegistration());
            }
            catch (rollbackError) {
                failures.push(`restore empty registration: ${asError(rollbackError).message}`);
            }
            throw new Error(failures.join('; '));
        }

        this._state = {
            kind: 'active',
            current: { bundle: candidate, registration },
        };
        if (this._pendingRunner === candidate.runner) this._pendingRunner = undefined;
        this._initialActivation.complete();
    }

    /** Rejects the first activate command when runner startup cannot serve its prepared bundle. */
    failInitialBundle(error: Error): void {
        if (this._state.kind === 'active') return;
        this._initialActivation.fail(error);
    }

    /** Prepares the first bundle and waits until runner startup can serve it. */
    private async activateInitialBundle(command: ActivateBundleCommand): Promise<void> {
        const validated = await validateAgentBundle(command, this._validateOptions);
        let stagedRunner: PreparedAgentBundle['runner'] | undefined;
        let retainPendingRunner = false;
        let publishedCandidate = false;
        try {
            let candidate: PreparedAgentBundle;
            try {
                candidate = await prepareAgentBundle(validated, {
                    ...this._prepareOptions,
                    servingMode: this._policy.servingMode(),
                    // On process construction, retain ownership because SIGTERM may interrupt initialization.
                    onRunnerCreated: runner => {
                        stagedRunner = runner;
                        this._pendingRunner = runner;
                    },
                });
            }
            catch (error) {
                if (error instanceof AgentBundlePreparationError && error.cleanupError) {
                    retainPendingRunner = true;
                    this._initialActivation.abort(error);
                }
                throw error;
            }
            try {
                await this._policy.configure(candidate);
            }
            catch (error) {
                const configurationError = asError(error);
                try {
                    await candidate.runner.stop();
                }
                catch (cleanupError) {
                    retainPendingRunner = true;
                    const failure = new Error(`${configurationError.message}; failed to stop model process: ` +
                        asError(cleanupError).message);
                    this._initialActivation.abort(failure);
                    throw failure;
                }
                throw configurationError;
            }
            this._initialActivation.publish(candidate);
            publishedCandidate = true;
        }
        finally {
            if (!retainPendingRunner && !publishedCandidate && this._pendingRunner === stagedRunner) {
                this._pendingRunner = undefined;
            }
        }
        await this._initialActivation.waitUntilServing();
    }
}

/** Checks whether a command names the bundle already committed by this process. */
function sameBundle(command: ActivateBundleCommand, active: PreparedAgentBundle): boolean {
    return command.bundle.kind === active.bundle.kind &&
        command.bundle.path === active.bundle.path &&
        command.bundle.deploymentVersion === active.bundle.deploymentVersion;
}

/** Converts an unknown thrown value into an Error suitable for command reporting. */
function asError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
}
