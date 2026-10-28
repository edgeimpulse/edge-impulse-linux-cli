/**
 * Wire codecs for the runner's agent-mode client. Its lifecycle and transport are tracked at
 * https://github.com/edgeimpulse/closed-loop-demo/issues/12.
 */
import {
    Command, CommandResult, EventBatch, EventBatchResponse, RegisterRequest, RegisterResponse
} from '../shared/device-protocol/workload-contract';
import {
    Validator, validateCommand, validateCommandResult, validateEventBatch,
    validateEventBatchResponse, validateRegisterRequest, validateRegisterResponse
} from '../shared/device-protocol/validators';

export type { Command, CommandResult, EventBatch, EventBatchResponse, RegisterRequest, RegisterResponse };

function checked<T>(value: unknown, validate: Validator<T>, operation: string): T {
    if (!validate(value)) {
        const error = validate.errors?.[0];
        throw new Error(`Invalid ${operation} at ${error?.instancePath || '/'}: ${error?.message || 'schema mismatch'}`);
    }
    return value;
}

export function serializeRegistration(value: RegisterRequest): string {
    return JSON.stringify(checked(value, validateRegisterRequest, 'registration'));
}

export function parseRegisterResponse(value: unknown): RegisterResponse {
    return checked(value, validateRegisterResponse, 'register response');
}

export function serializeEventBatch(value: EventBatch): string {
    return JSON.stringify(checked(value, validateEventBatch, 'event batch'));
}

export function parseEventBatchResponse(value: unknown): EventBatchResponse {
    return checked(value, validateEventBatchResponse, 'event batch response');
}

/** Parse the JSON-decoded data of an SSE command, not the SSE transport framing. */
export function parseCommand(value: unknown): Command {
    return checked(value, validateCommand, 'command');
}

export function serializeCommandResult(value: CommandResult): string {
    return JSON.stringify(checked(value, validateCommandResult, 'command result'));
}
