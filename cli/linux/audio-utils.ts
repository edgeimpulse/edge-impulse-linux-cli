/**
 * Wraps raw 16-bit mono PCM samples in a WAV file so inference inputs and remotely captured samples
 * carry the sample rate and audio format needed by later consumers.
 *
 * @param pcm Raw signed 16-bit little-endian mono audio samples.
 * @param sampleRate Number of audio samples per second.
 */
export function buildMonoPcm16WavFile(pcm: Buffer, sampleRate: number): Buffer {
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcm.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(pcm.length, 40);
    return Buffer.concat([ header, pcm ]);
}
