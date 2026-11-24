import assert from 'node:assert';
import fs from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import Path from 'node:path';
import sharp from 'sharp';
import { EventEmitter } from 'tsee';
import WebSocket from 'ws';
import { prepareAgentBundle, validateAgentBundle } from '../cli/linux/agent-bundle';
import { startWebServer } from '../cli/linux/runner-utils';
import { ImageClassifier } from '../library/classifier/image-classifier';
import { ICamera } from '../library/sensors/icamera';
import { writeBundle } from './utils/agent-runner-fixtures';

describe('preview for a replaced bundle', () => {
    it('serves each bundle\'s camera, hello, thresholds and results from a fresh stack', async () => {
        const root = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-preview-'));
        try {
            for (const version of [ 3, 7 ]) {
                const command = await writeBundle(root, { deploymentVersion: version,
                    classifyScore: version / 10,
                    thresholds: [{ id: 1, type: 'classification', min_score: version / 100 }],
                    mock: { imageWidth: version, resizeMode: version === 3 ? 'fit-shortest' : 'squash' } });
                const bundle = await prepareAgentBundle(await validateAgentBundle(command,
                    { forceTarget: 'test-target', packageVersion: '1.26.1' }),
                    { shmBehavior: 'never', startupTimeoutMs: 1000, verbose: false, servingMode: 'camera' });
                const camera = <ICamera><unknown>new EventEmitter();
                const classifier = new ImageClassifier(bundle.runner, camera);
                const sockets: net.Socket[] = [];
                const clients: WebSocket[] = [];
                let listener: http.Server | undefined;
                try {
                    await classifier.start();
                    const originalListen = http.Server.prototype.listen;
                    http.Server.prototype.listen = function(this: http.Server, ...args: unknown[]) {
                        listener = this;
                        return Reflect.apply(originalListen, this, args) as http.Server;
                    };
                    try {
                        await startWebServer({ type: 'camera', camera, imgClassifier: classifier,
                            streamResolution: 'scaled-using-impulse', model: bundle.model,
                            host: '127.0.0.1', port: 0, verbose: false });
                    }
                    finally { http.Server.prototype.listen = originalListen; }
                    assert.ok(listener);
                    const server = listener;
                    server.on('connection', socket => sockets.push(socket));
                    const port = (server.address() as net.AddressInfo).port;
                    const ws = new WebSocket(`ws://127.0.0.1:${port}/`);
                    const io = new WebSocket(`ws://127.0.0.1:${port}/socket.io/?EIO=4&transport=websocket`);
                    clients.push(ws, io);
                    const messages: Array<{ type: string; project?: { deploy_version: number };
                        modelParameters?: { image_input_width: number; image_resize_mode: string };
                        result?: object; image?: string }> = [];
                    const events: Array<[string, { project?: { deploy_version: number };
                        result?: object; min_score?: number; img?: string; thresholds?: object[] }]> = [];
                    ws.on('message', data => messages.push(JSON.parse(data.toString())));
                    io.on('message', data => {
                        const packet = data.toString();
                        if (packet.startsWith('0')) io.send('40');
                        else if (packet.startsWith('42')) events.push(JSON.parse(packet.slice(2)));
                        else if (packet === '2') io.send('3');
                    });
                    await waitUntil(() => messages.some(message => message.type === 'hello') &&
                        events.some(([ event ]) => event === 'hello'));
                    assert.strictEqual(messages[0].project?.deploy_version, version);
                    assert.deepStrictEqual(events.find(([ event ]) => event === 'hello')?.[1].thresholds,
                        [{ id: 1, type: 'classification', min_score: version / 100 }]);
                    assert.strictEqual(classifier.getRunner().getModel().modelParameters.image_input_width, version);
                    assert.strictEqual(classifier.getRunner().getModel().modelParameters.image_resize_mode,
                        version === 3 ? 'fit-shortest' : 'squash');
                    ws.send(JSON.stringify({ type: 'set-camera-preview', enabled: true, messageId: 1 }));
                    await waitUntil(() => messages.some(message => message.type === 'handling-message-success'));
                    const jpg = await sharp({ create: { width: 1, height: 2, channels: 3,
                        background: '#ff0000' } }).jpeg().toBuffer();
                    camera.emit('snapshot', jpg, 'frame.jpg');
                    camera.emit('snapshotForInference', { filename: 'frame.jpg', imageForInferenceJpg: jpg,
                        imageForInferenceRgb: undefined, imageFromCameraJpg: jpg });
                    await waitUntil(() => messages.some(message => message.type === 'classification') &&
                        messages.some(message => message.type === 'camera-preview') &&
                        events.some(([ event ]) => event === 'classification') &&
                        events.some(([ event ]) => event === 'image'));
                    const result = { classification: { value: version / 10 } };
                    assert.deepStrictEqual(messages.find(message => message.type === 'classification')?.result, result);
                    assert.deepStrictEqual(events.find(([ event ]) => event === 'classification')?.[1].result, result);
                    assert.strictEqual(events.find(([ event ]) => event === 'classification')?.[1].min_score,
                        version / 100);
                    const image = messages.find(message => message.type === 'camera-preview')!.image!;
                    assert.strictEqual(events.find(([ event ]) => event === 'image')?.[1].img, image);
                    assert.strictEqual((await sharp(Buffer.from(image.split(',')[1], 'base64')).metadata()).width,
                        version);
                }
                finally {
                    for (const socket of sockets) socket.destroy();
                    for (const client of clients) client.terminate();
                    if (listener) await new Promise<void>(resolve => listener!.close(() => resolve()));
                    camera.removeAllListeners();
                    await bundle.runner.stop();
                    await waitUntil(() => clients.every(client => client.readyState === WebSocket.CLOSED));
                }
            }
        }
        finally { await fs.rm(root, { recursive: true, force: true }); }
    }).timeout(15_000);
});

async function waitUntil(predicate: () => boolean) {
    const deadline = Date.now() + 5000;
    while (!predicate()) {
        assert.ok(Date.now() < deadline, 'Timed out waiting for preview messages');
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}
