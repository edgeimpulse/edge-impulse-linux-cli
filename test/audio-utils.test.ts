/**
 * Verifies the shared WAV builder used for both agent inference inputs and remotely captured audio,
 * including the binary header fields that audio consumers rely on to interpret the PCM payload.
 */
import assert from 'node:assert';
import { buildMonoPcm16WavFile } from '../cli/linux/audio-utils';

describe('audio utilities', () => {
    it('builds a 16-bit mono PCM WAV file with the supplied sample rate', () => {
        const pcm = Buffer.from([ 1, 2, 3, 4 ]);
        const wav = buildMonoPcm16WavFile(pcm, 16000);

        assert.strictEqual(wav.toString('ascii', 0, 4), 'RIFF');
        assert.strictEqual(wav.readUInt32LE(4), 36 + pcm.length);
        assert.strictEqual(wav.toString('ascii', 8, 12), 'WAVE');
        assert.strictEqual(wav.readUInt16LE(20), 1);
        assert.strictEqual(wav.readUInt16LE(22), 1);
        assert.strictEqual(wav.readUInt32LE(24), 16000);
        assert.strictEqual(wav.readUInt32LE(28), 32000);
        assert.strictEqual(wav.readUInt16LE(32), 2);
        assert.strictEqual(wav.readUInt16LE(34), 16);
        assert.strictEqual(wav.toString('ascii', 36, 40), 'data');
        assert.strictEqual(wav.readUInt32LE(40), pcm.length);
        assert.deepStrictEqual(wav.subarray(44), pcm);
    });
});
