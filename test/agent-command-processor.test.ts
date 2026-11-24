import assert from 'node:assert';
import { AgentCommandProcessor } from '../cli-common/agent-client';
import {
    ActivateBundleCommand,
    Command,
    CommandResult,
    UpdateInputPolicyCommand,
} from '../shared/device-protocol/application-contract';

type Deferred = {
    promise: Promise<void>;
    resolve: () => void;
};

/**
 * Exercises `AgentCommandProcessor`, the serial in-process dispatcher between command delivery and
 * result posting. Successful handlers run in delivery order and produce one acknowledgement each.
 * Missing or failing handlers produce explicit failures, acknowledgement errors do not poison the
 * queue, duplicate ownership is rejected, and redelivery reapplies the command for state recovery.
 */
describe('AgentCommandProcessor', () => {
    // A resolved handler produces the success result that lets the agent commit the command.
    it('acknowledges a successful command', async () => {
        const acknowledged: CommandResult[] = [];
        const processor = processorRecording(acknowledged);
        const command = activateBundleCommand('activate-1');
        let delivered: Command | undefined;
        processor.on('activateBundle', received => {
            delivered = received;
            return Promise.resolve();
        });

        await processor.process(command);

        assert.deepStrictEqual(delivered, command);
        assert.deepStrictEqual(acknowledged, [{
            commandId: command.id,
            type: command.type,
            success: true,
        }]);
    });

    // A handler failure becomes a command failure result so later commands can still run.
    it('acknowledges a handler error as a command failure', async () => {
        const acknowledged: CommandResult[] = [];
        const processor = processorRecording(acknowledged);
        const command = activateBundleCommand('activate-1');
        processor.on('activateBundle', () => Promise.reject(new Error('bundle is incompatible')));

        await processor.process(command);

        assert.deepStrictEqual(acknowledged, [{
            commandId: command.id,
            type: command.type,
            success: false,
            reason: 'bundle is incompatible',
        }]);
    });

    // An unsupported command receives an explicit failure instead of being silently accepted.
    it('acknowledges a command without a registered handler as a failure', async () => {
        const acknowledged: CommandResult[] = [];
        const processor = processorRecording(acknowledged);
        const command = updateInputPolicyCommand('policy-1');

        await processor.process(command);

        assert.deepStrictEqual(acknowledged, [{
            commandId: command.id,
            type: command.type,
            success: false,
            reason: 'No handler is registered for command "updateInputPolicy"',
        }]);
    });

    // A command type has one owner so execution and result handling cannot become ambiguous.
    it('rejects a second handler for the same command type', () => {
        const processor = processorRecording([]);
        processor.on('activateBundle', () => Promise.resolve());

        assert.throws(
            () => processor.on('activateBundle', () => Promise.resolve()),
            /already registered for command "activateBundle"/
        );
    });

    // The next command waits for the preceding result POST, preserving agent delivery order.
    it('executes and acknowledges commands in delivery order', async () => {
        const events: string[] = [];
        const firstAcknowledgementStarted = deferred();
        const releaseFirstAcknowledgement = deferred();
        const processor = new AgentCommandProcessor(async result => {
            events.push(`acknowledge:${result.commandId}`);
            if (result.commandId === 'activate-1') {
                firstAcknowledgementStarted.resolve();
                await releaseFirstAcknowledgement.promise;
            }
        });
        processor.on('activateBundle', command => {
            events.push(`handle:${command.id}`);
            return Promise.resolve();
        });

        const first = processor.process(activateBundleCommand('activate-1'));
        await firstAcknowledgementStarted.promise;
        const second = processor.process(activateBundleCommand('activate-2'));
        assert.deepStrictEqual(events, [ 'handle:activate-1', 'acknowledge:activate-1' ]);

        releaseFirstAcknowledgement.resolve();
        await Promise.all([ first, second ]);
        assert.deepStrictEqual(events, [
            'handle:activate-1',
            'acknowledge:activate-1',
            'handle:activate-2',
            'acknowledge:activate-2',
        ]);
    });

    // A failed result POST rejects that delivery without permanently poisoning the serial queue.
    it('continues processing after an acknowledgement failure', async () => {
        const handled: string[] = [];
        const acknowledged: string[] = [];
        const processor = new AgentCommandProcessor(result => {
            acknowledged.push(result.commandId);
            return result.commandId === 'activate-1' ?
                Promise.reject(new Error('agent unavailable')) : Promise.resolve();
        });
        processor.on('activateBundle', command => {
            handled.push(command.id);
            return Promise.resolve();
        });

        const first = processor.process(activateBundleCommand('activate-1'));
        const second = processor.process(activateBundleCommand('activate-2'));

        await assert.rejects(first, /agent unavailable/);
        await second;
        assert.deepStrictEqual(handled, [ 'activate-1', 'activate-2' ]);
        assert.deepStrictEqual(acknowledged, [ 'activate-1', 'activate-2' ]);
    });

    // Redelivery reruns the idempotent handler so local state is recovered from the command itself.
    it('reapplies a command when it is redelivered', async () => {
        let handlerCalls = 0;
        const processor = processorRecording([]);
        const command = activateBundleCommand('activate-1');
        processor.on('activateBundle', () => {
            handlerCalls++;
            return Promise.resolve();
        });

        await processor.process(command);
        await processor.process(command);

        assert.strictEqual(handlerCalls, 2);
    });
});

/** Creates a processor whose acknowledgement calls append to the supplied array. */
function processorRecording(acknowledged: CommandResult[]): AgentCommandProcessor {
    return new AgentCommandProcessor(result => {
        acknowledged.push(result);
        return Promise.resolve();
    });
}

/** Creates a valid model-bundle activation command for processor tests. */
function activateBundleCommand(id: string): ActivateBundleCommand {
    return {
        id,
        type: 'activateBundle',
        bundle: {
            deploymentVersion: 2,
            kind: 'model',
            path: '/models/version-2',
        },
    };
}

/** Creates an input-policy command used to verify unsupported-command reporting. */
function updateInputPolicyCommand(id: string): UpdateInputPolicyCommand {
    return {
        id,
        type: 'updateInputPolicy',
        inputPolicy: { mode: 'all' },
    };
}

/** Creates a promise whose completion is controlled by the test. */
function deferred(): Deferred {
    let resolve: () => void = () => undefined;
    const promise = new Promise<void>(resolvePromise => resolve = resolvePromise);
    return { promise, resolve };
}
