import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { Server as HttpServer } from 'node:http';
import { Server as SocketIoServer } from 'socket.io';
import { startWebServer } from '../cli/linux/runner-utils';
import type { ImageClassifier } from '../library/classifier/image-classifier';
import type { ModelInformation } from '../library/classifier/linux-impulse-runner';
import type { ICamera } from '../library/sensors/icamera';

/** The preview may filter its presentation without changing the shared camera event. */
describe('camera preview results', () => {
    it('filters a copy and leaves raw scores available to later event listeners', async () => {
        const originalListen = HttpServer.prototype.listen;
        const originalEmit = SocketIoServer.prototype.emit;
        let preview: { result: { classification: Record<string, number> } } | undefined;
        const classifier = new EventEmitter();
        const camera = new EventEmitter();
        // Exercise the real result handler without opening a server socket.
        HttpServer.prototype.listen = function(this: HttpServer, ...args: unknown[]) {
            const callback = args.find((arg) => typeof arg === 'function');
            if (typeof callback === 'function') callback();
            return this;
        } as typeof originalListen;
        SocketIoServer.prototype.emit = function(event: string, ...args: unknown[]) {
            if (event === 'classification') {
                preview = args[0] as typeof preview;
            }
            return false;
        } as typeof originalEmit;
        try {
            await startWebServer({
                type: 'camera',
                camera: camera as unknown as ICamera,
                imgClassifier: classifier as unknown as ImageClassifier,
                model: {
                    modelParameters: {
                        model_type: 'classification',
                        thresholds: [{ id: 1, type: 'classification', min_score: 0.5 }],
                    },
                } as unknown as ModelInformation,
                streamResolution: 'scaled-using-impulse',
                verbose: false,
                host: '127.0.0.1',
                port: 0,
            });
            const raw = { result: { classification: { low: 0.2, high: 0.8 } } };
            let observed: typeof raw | undefined;
            classifier.on('result', (event: typeof raw) => { observed = event; });
            classifier.emit('result', raw, 1, Buffer.alloc(0));
            assert.deepStrictEqual(preview?.result.classification, { low: 0, high: 0.8 });
            assert.deepStrictEqual(raw.result.classification, { low: 0.2, high: 0.8 });
            assert.strictEqual(observed, raw);
        }
        finally {
            HttpServer.prototype.listen = originalListen;
            SocketIoServer.prototype.emit = originalEmit;
        }
    });
});
