/**
 * Verifies the non-interactive device selection used by agent-managed containers, without requiring
 * camera or microphone hardware during the unit test.
 */
import assert from 'node:assert';
import { selectNonInteractiveDevice } from '../library/sensors/sensors-helper';

describe('non-interactive sensor selection', () => {
    it('uses an explicitly selected device', () => {
        assert.strictEqual(selectNonInteractiveDevice(
            [ 'camera-1', 'camera-2' ], 'camera-2', '--camera', 'EI_CAMERA'), 'camera-2');
    });

    it('automatically uses the only available device', () => {
        assert.strictEqual(selectNonInteractiveDevice(
            [ 'microphone-1' ], undefined, '--microphone', 'EI_MICROPHONE'), 'microphone-1');
    });

    it('rejects an ambiguous selection instead of prompting', () => {
        assert.throws(
            () => selectNonInteractiveDevice(
                [ 'camera-1', 'camera-2' ], undefined, '--camera', 'EI_CAMERA'),
            /set --camera or EI_CAMERA/
        );
    });
});
