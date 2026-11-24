import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import Path from 'node:path';
import { AgentBundleLifecycle } from '../cli/linux/agent-bundle-lifecycle';
import { PreparedAgentBundle } from '../cli/linux/agent-bundle';
import {
    LinuxImpulseRunner,
    LinuxImpulseRunnerUnexpectedTermination,
} from '../library/classifier/linux-impulse-runner';
import {
    ActivateBundleCommand,
    InferenceRunnerRegistration,
} from '../shared/device-protocol/application-contract';
import {
    BundleFixtureOptions,
    mockEimSource,
    writeBundle as stageBundle,
} from './utils/agent-runner-fixtures';

/**
 * Exercises `AgentBundleLifecycle`, which owns bundle preparation until serving state and agent
 * registration agree on one canonical model. The successful flow prepares the initial bundle,
 * commits it only after serving starts, and refreshes registration on redelivery. Failure coverage
 * verifies retryable preparation, retained cleanup ownership, registration rollback and diagnostics,
 * and rejection of invalid replacements without disturbing the active model.
 */
describe('AgentBundleLifecycle', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-bundle-lifecycle-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    // A pre-commit runtime failure is retryable, so a bad first model must not poison empty startup.
    it('remains waiting after initial preparation fails', async () => {
        const invalidCommand = await writeBundle({ deploymentVersion: 1, sensor: 2 });
        const validCommand = await writeBundle({ deploymentVersion: 2 });
        const lifecycle = createLifecycle({
            updateRegistration: () => Promise.resolve(),
            servingMode: undefined,
        });

        await assert.rejects(lifecycle.activateBundle(invalidCommand), /requires the runner to use HTTP mode/);
        const activation = lifecycle.activateBundle(validCommand);
        const bundle = await lifecycle.waitForInitialBundle();
        try {
            await lifecycle.completeInitialActivation();
            assert.deepStrictEqual(await activation, { kind: 'activated' });
            assert.strictEqual(lifecycle.activeModelId(), 'model-2');
        }
        finally {
            await bundle.runner.stop();
        }
    });

    // Unconfirmed candidate cleanup makes empty state uncertain, so startup must fail and retain ownership.
    it('fails startup when an initial candidate cannot be stopped', async () => {
        const command = await writeBundle({ deploymentVersion: 1 });
        let candidate: PreparedAgentBundle | undefined;
        let originalStop: PreparedAgentBundle['runner']['stop'] | undefined;
        const lifecycle = createLifecycle({
            updateRegistration: () => Promise.resolve(),
            servingMode: 'camera',
            configureBundle: prepared => {
                candidate = prepared;
                originalStop = prepared.runner.stop.bind(prepared.runner);
                prepared.runner.stop = () => Promise.reject(new Error('stop failed'));
                return Promise.reject(new Error('configuration failed'));
            },
        });
        const startupFailure = assert.rejects(
            lifecycle.waitForInitialBundle(),
            /configuration failed; failed to stop model process: stop failed/
        );

        await assert.rejects(
            lifecycle.activateBundle(command),
            /configuration failed; failed to stop model process: stop failed/
        );
        await startupFailure;

        if (candidate && originalStop) {
            candidate.runner.stop = originalStop;
            await lifecycle.stopPendingRunner();
        }
    });

    // The first command must stay pending until serving starts and registration confirms canonical identity.
    it('completes initial activation only after registration', async () => {
        const command = await writeBundle({ deploymentVersion: 1 });
        let registered = false;
        const lifecycle = createLifecycle({
            updateRegistration: async registration => {
                assert.strictEqual(registration.models[0]?.id, 'model-1');
                registered = true;
            },
            servingMode: 'camera',
        });
        let completed = false;
        const activation = lifecycle.activateBundle(command).then(result => {
            completed = true;
            return result;
        });
        const bundle = await lifecycle.waitForInitialBundle();

        try {
            assert.strictEqual(completed, false);
            await lifecycle.completeInitialActivation();
            assert.deepStrictEqual(await activation, { kind: 'activated' });
            assert.strictEqual(registered, true);
            assert.strictEqual(lifecycle.activeModelId(), 'model-1');
        }
        finally {
            await bundle.runner.stop();
        }
    });

    // A rejected model registration must restore empty canonical state before startup reports failure.
    it('rolls back to empty registration when initial commit fails', async () => {
        const command = await writeBundle({ deploymentVersion: 1 });
        const registrations: string[][] = [];
        const lifecycle = createLifecycle({
            updateRegistration: registration => {
                registrations.push(registration.models.map(model => model.id));
                return registration.models.length > 0 ?
                    Promise.reject(new Error('registration rejected')) : Promise.resolve();
            },
            servingMode: 'camera',
        });
        const activation = lifecycle.activateBundle(command);
        const activationFailure = assert.rejects(activation, /registration rejected/);
        await lifecycle.waitForInitialBundle();

        try {
            await assert.rejects(lifecycle.completeInitialActivation(), /registration rejected/);
            lifecycle.failInitialBundle(new Error('registration rejected'));
            await activationFailure;

            assert.deepStrictEqual(registrations, [ [ 'model-1' ], [] ]);
            assert.strictEqual(lifecycle.activeModelId(), undefined);
        }
        finally {
            await lifecycle.stopPendingRunner();
        }
    });

    // If rollback also fails, retain both errors because the agent's canonical state is now uncertain.
    it('reports model registration and rollback failures together', async () => {
        const command = await writeBundle({ deploymentVersion: 1 });
        const lifecycle = createLifecycle({
            updateRegistration: registration => Promise.reject(new Error(
                registration.models.length > 0 ? 'registration rejected' : 'rollback rejected'
            )),
            servingMode: 'camera',
        });
        const activation = lifecycle.activateBundle(command);
        const expected = /registration rejected; restore empty registration: rollback rejected/;
        const activationFailure = assert.rejects(activation, expected);
        await lifecycle.waitForInitialBundle();

        try {
            await assert.rejects(async () => {
                try {
                    await lifecycle.completeInitialActivation();
                }
                catch (error) {
                    lifecycle.failInitialBundle(error as Error);
                    throw error;
                }
            }, expected);
            await activationFailure;
            assert.strictEqual(lifecycle.activeModelId(), undefined);
        }
        finally {
            await lifecycle.stopPendingRunner();
        }
    });

    // A prepared model remains lifecycle-owned until commit so later sensor or registration failure can stop it.
    it('retains the prepared runner for cleanup until initial activation commits', async () => {
        const command = await writeBundle({ deploymentVersion: 1 });
        const lifecycle = createLifecycle({
            updateRegistration: () => Promise.resolve(),
            servingMode: 'camera',
        });
        const activation = lifecycle.activateBundle(command);
        const bundle = await lifecycle.waitForInitialBundle();
        const originalStop = bundle.runner.stop.bind(bundle.runner);
        let stopCount = 0;
        bundle.runner.stop = async () => {
            stopCount++;
            return originalStop();
        };

        lifecycle.failInitialBundle(new Error('sensor startup failed'));
        await assert.rejects(activation, /sensor startup failed/);
        await lifecycle.stopPendingRunner();

        assert.strictEqual(stopCount, 1);
    });

    // Invalid replacement identity and files must fail before restart so the active model keeps serving.
    it('rejects invalid replacements without changing the active bundle', async () => {
        const firstCommand = await writeBundle({ deploymentVersion: 1 });
        const nonExecutable = await writeBundle({ deploymentVersion: 2 });
        const corruptModel = await writeBundle({ deploymentVersion: 3 });
        const mismatchedVersion = await writeBundle({ deploymentVersion: 4 });
        await fs.chmod(Path.join(nonExecutable.bundle.path, 'model.eim'), 0o644);
        await fs.appendFile(Path.join(corruptModel.bundle.path, 'model.eim'), '\n');
        mismatchedVersion.bundle.deploymentVersion = 40;
        const lifecycle = createLifecycle({
            updateRegistration: () => Promise.resolve(),
            servingMode: 'camera',
        });
        const firstActivation = lifecycle.activateBundle(firstCommand);
        const firstBundle = await lifecycle.waitForInitialBundle();
        await lifecycle.completeInitialActivation();
        await firstActivation;

        try {
            await assert.rejects(lifecycle.activateBundle(nonExecutable), /not executable/);
            await assert.rejects(lifecycle.activateBundle(corruptModel), /checksum does not match/);
            await assert.rejects(lifecycle.activateBundle(mismatchedVersion), /deployment version 40 does not match/);
            assert.strictEqual(lifecycle.activeModelId(), 'model-1');
        }
        finally {
            await firstBundle.runner.stop();
        }
    });

    // Same-bundle redelivery refreshes registration because confirmation may belong to a new command.
    it('refreshes registration without restart for the active bundle', async () => {
        const command = await writeBundle({ deploymentVersion: 1 });
        let registrationCount = 0;
        const lifecycle = createLifecycle({
            updateRegistration: async () => { registrationCount++; },
            servingMode: 'camera',
        });
        const firstActivation = lifecycle.activateBundle(command);
        const bundle = await lifecycle.waitForInitialBundle();
        await lifecycle.completeInitialActivation();
        await firstActivation;

        try {
            assert.deepStrictEqual(await lifecycle.activateBundle(command), { kind: 'activated' });
            assert.strictEqual(registrationCount, 2);
            assert.strictEqual(lifecycle.activeModelId(), 'model-1');
        }
        finally {
            await bundle.runner.stop();
        }
    });

    /** Stages one bundle whose executable and manifest report the requested fixture metadata. */
    function writeBundle(options: BundleFixtureOptions): Promise<ActivateBundleCommand> {
        return stageBundle(tempDir, options);
    }
});

/** Creates a lifecycle with production validation and preparation plus test-owned registration effects. */
function createLifecycle(options: {
    updateRegistration: (registration: InferenceRunnerRegistration) => Promise<void>;
    configureBundle?: (candidate: PreparedAgentBundle) => Promise<void>;
    servingMode?: 'camera' | 'microphone' | 'http';
}): AgentBundleLifecycle {
    return new AgentBundleLifecycle({
        agentClient: { updateRegistration: options.updateRegistration },
        policy: {
            createRegistration(bundle) {
                return bundle ? registrationFor(bundle) : emptyRegistration();
            },
            configure: candidate => options.configureBundle?.(candidate) || Promise.resolve(),
            servingMode: () => options.servingMode,
        },
        validateOptions: {
            forceTarget: 'test-target',
            packageVersion: '1.26.0',
        },
        prepareOptions: {
            shmBehavior: 'never',
            startupTimeoutMs: 40_000,
            verbose: false,
        },
    });
}

/** Builds the empty registration used before the first model is committed. */
function emptyRegistration(): InferenceRunnerRegistration {
    return {
        kind: 'inference_runner',
        version: '1.26.0',
        contractVersion: 1,
        artifact: { kind: 'containerImage', reference: 'runner:test' },
        models: [],
    };
}

/** Builds the registration identity used to observe initial commit and refresh. */
function registrationFor(bundle: PreparedAgentBundle): InferenceRunnerRegistration {
    return {
        kind: 'inference_runner',
        version: '1.26.0',
        contractVersion: 1,
        artifact: { kind: 'containerImage', reference: 'runner:test' },
        models: [{
            id: bundle.manifestModel.id,
            projectId: bundle.manifestModel.projectId,
            projectName: bundle.registrationModel.project.name,
            projectOwner: bundle.registrationModel.project.owner,
            impulseId: bundle.manifestModel.impulseId,
            deploymentVersion: bundle.manifestModel.deploymentVersion,
            engine: bundle.manifestModel.engine,
            modelType: bundle.manifestModel.modelType,
            labels: bundle.registrationModel.modelParameters.labels,
            thresholds: bundle.registrationModel.modelParameters.thresholds,
        }],
    };
}

/**
 * Exercises `LinuxImpulseRunner`, the child-process and socket owner for one `.eim` model. Normal
 * shutdown must stop the process and settle requests without reporting a failure. Startup failures,
 * timeouts and in-flight inference are bounded, while unexpected exits are retained for late owners
 * and report the exact exit code or signal needed by application recovery.
 */
describe('LinuxImpulseRunner lifecycle', () => {
    let tempDir: string;

    beforeEach(async () => {
        tempDir = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-runner-lifecycle-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    // A bad executable is a rejected bundle, not an unhandled child-process error or hanging stop.
    it('rejects a failed spawn and remains safe to stop', async () => {
        const executable = await writeExecutable('bad-loader', '#!/nonexistent/loader\n');
        const runner = new LinuxImpulseRunner(executable, { startupTimeoutMs: 200 });

        await assert.rejects(runner.init(), /Failed to start runner/);
        await resolvesWithin(runner.stop(), 500);
    });

    // A candidate that stays alive without opening its socket must release the serial command queue.
    it('bounds startup when the candidate never opens its socket', async () => {
        const executable = await writeExecutable('no-socket', `#!/usr/bin/env node
process.on('SIGINT', () => process.exit(0));
setInterval(() => undefined, 1000);
`);
        const runner = new LinuxImpulseRunner(executable, { startupTimeoutMs: 50 });

        await assert.rejects(runner.init(), /did not create its socket|startup timed out/);
        await resolvesWithin(runner.stop(), 1000);
    });

    // Retiring a runner must reject its outstanding inference immediately instead of after 60 seconds.
    it('settles an in-flight request when the runner stops', async () => {
        const executable = await writeExecutable('hanging-inference', mockEimSource());
        const runner = new LinuxImpulseRunner(executable, { startupTimeoutMs: 1000 });
        await runner.init();

        const inference = runner.classify([ 0 ]);
        const rejected = assert.rejects(inference, /Runner stopped/);
        await new Promise(resolve => setTimeout(resolve, 20));
        await runner.stop();

        await rejected;
    });

    // Ownership is attached after preparation, so an exit in that handoff window must be retained and replayed.
    it('replays an unexpected exit to an owner attached after initialization', async () => {
        const executable = await writeExecutable('exits-after-hello', mockEimSource({ exitAfterHello: true }));
        const runner = new LinuxImpulseRunner(executable, { startupTimeoutMs: 1000 });
        await runner.init();
        await new Promise(resolve => setTimeout(resolve, 50));

        const termination = new Promise<LinuxImpulseRunnerUnexpectedTermination>(resolve => {
            runner.on('unexpectedTermination', resolve);
        });

        const observed = await termination;
        assert.strictEqual(observed.signal, null);
        assert.strictEqual(observed.code, 0);
        await runner.stop();
    });

    // Child exit details are canonical, so forced termination must retain its diagnostic signal.
    it('reports the child signal after its serving socket closes', async () => {
        const executable = await writeExecutable('killed-after-hello', mockEimSource({ killAfterHello: true }));
        const runner = new LinuxImpulseRunner(executable, { startupTimeoutMs: 1000 });
        await runner.init();

        const termination = new Promise<LinuxImpulseRunnerUnexpectedTermination>(resolve => {
            runner.on('unexpectedTermination', resolve);
        });

        const observed = await termination;
        assert.strictEqual(observed.code, null);
        assert.strictEqual(observed.signal, 'SIGKILL');
        await runner.stop();
    });

    // Intentional retirement must not trigger recovery because the lifecycle already owns shutdown.
    it('does not emit when the initialized runner is stopped', async () => {
        const executable = await writeExecutable('intentional-stop', mockEimSource());
        const runner = new LinuxImpulseRunner(executable, { startupTimeoutMs: 1000 });
        let terminationCount = 0;
        runner.on('unexpectedTermination', () => { terminationCount++; });

        await runner.init();
        await runner.stop();
        await new Promise(resolve => setTimeout(resolve, 20));
        assert.strictEqual(terminationCount, 0);
    });

    /** Writes one executable fixture under this test's temporary directory. */
    async function writeExecutable(name: string, source: string): Promise<string> {
        const path = Path.join(tempDir, name);
        await fs.writeFile(path, source, { mode: 0o755 });
        return path;
    }
});

/** Fails if an operation does not settle inside the behavior's promised bound. */
async function resolvesWithin(operation: Promise<unknown>, timeoutMs: number): Promise<void> {
    let timer: NodeJS.Timeout | undefined;
    try {
        await Promise.race([
            operation,
            new Promise<never>((_resolve, reject) => {
                timer = setTimeout(() => reject(new Error('Operation did not settle')), timeoutMs);
            }),
        ]);
    }
    finally {
        if (timer) clearTimeout(timer);
    }
}
