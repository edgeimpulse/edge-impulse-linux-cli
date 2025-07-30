import { Server as HttpServer} from 'node:http';
import Path from 'node:path';
import { promisify } from 'node:util';
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { Server as SocketIoServer } from 'socket.io';
import type { EdgeImpulseApi } from '../../sdk/studio/api';
import { type LinuxImpulseRunner, type ModelInformation, RunnerHelloHasAnomaly } from '../../library/classifier/linux-impulse-runner';
import { type InferenceServerModelViewModel, renderInferenceServerView } from './webserver/views/inference-server-view';
import { asyncMiddleware } from './webserver/middleware/asyncMiddleware';
import { ImageClassifier } from '../../library/classifier/image-classifier';
import type { ICamera } from '../../library/sensors/icamera';
import { DEFAULT_SOCKET_IO_V2_PARAMS, startEio3Interceptor } from '../../cli-common/socket-utils';
import ws from 'ws';
import Url from 'url';
import { renderIndexView } from './webserver/views';

const RUNNER_PREFIX = '\x1b[33m[RUN]\x1b[0m';

export async function listTargets(projectId: number, api: EdgeImpulseApi) {

    const targets = await api.deployment.listDeploymentTargetsForProjectDataSources(projectId, { });
    console.log('Listing all available targets');
    console.log('-----------------------------');
    for (let t of targets?.targets?.filter(x => x.format?.startsWith('runner')) || []) {
        console.log(`target: ${t.format}, ` +
            `name: ${t.name}, ` +
            `supported engines: [${t.supportedEngines?.join(', ') ?? ''}], ` +
            `supported variants: [${t.modelVariants?.filter(x => x.supported)?.map(x => x.variant).join(', ') ?? ''}]`
        );
    }
}

export function audioClassifierHelloMsg(model: ModelInformation) {
    let param = model.modelParameters;
    console.log(RUNNER_PREFIX, 'Starting the audio classifier for',
        model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
    console.log(RUNNER_PREFIX, 'Parameters', 'freq', param.frequency + 'Hz',
        'window length', ((param.input_features_count / param.frequency / param.axis_count) * 1000) + 'ms.',
        'classes', param.labels);
    printThresholds(model);
}

export function imageClassifierHelloMsg(model: ModelInformation) {
    let param = model.modelParameters;
    let labels = param.labels;

    if (param.has_anomaly === RunnerHelloHasAnomaly.VisualGMM) {
        labels.push('anomaly');
    }

    console.log(RUNNER_PREFIX, 'Starting the image classifier for',
        model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
    console.log(RUNNER_PREFIX, 'Parameters',
        'image size', param.image_input_width + 'x' + param.image_input_height + ' px (' +
            param.image_channel_count + ' channels)',
        'classes', labels);
    printThresholds(model);
}

export function printThresholds(model: ModelInformation) {
    if ((model.modelParameters.thresholds || []).length > 0) {
        let opts: string[] = [];
        for (let thresholdObj of model.modelParameters.thresholds || []) {
            let threshold = <{ [k: string]: number }><unknown>thresholdObj;
            for (let k of Object.keys(threshold)) {
                if (k === 'id' || k === 'type') continue;
                if (typeof threshold[k] === 'number') {
                    let rounded = Math.round(threshold[k] * 1000) / 1000;
                    opts.push(`${threshold.id}.${k}=${rounded}`);
                }
                else if (typeof threshold[k] === 'boolean') {
                    opts.push(`${threshold.id}.${k}=${threshold[k]}`);
                }
                else {
                    continue;
                }
            }
        }

        console.log(RUNNER_PREFIX, `Thresholds: ${opts.join(',')} (override via --thresholds <value>)`);
    }
}

export function startApiServer(opts: {
    model: ModelInformation,
    runner: LinuxImpulseRunner,
    projectStudioUrl: string,
    port: number
    printIncomingInferenceReqs: boolean
}) {
    const { model, runner, projectStudioUrl, port, printIncomingInferenceReqs } = opts;

    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '150mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        res.header('x-ei-owner', model.project.owner);
        res.header('x-ei-project-name', model.project.name);
        res.header('x-ei-project-version', model.project.deploy_version.toString());
        next();
    });

    const server = new HttpServer(app);

    app.get('/', asyncMiddleware((req, res) => {
        let text = [
            'Edge Impulse inference server for ' +
            model.project.owner + ' / ' + model.project.name + ' (v' + model.project.deploy_version + ')',
            '',
            'How to run inference:',
            '',
        ];
        if (model.modelParameters.sensorType === 'camera') {
            text = text.concat([
                `curl -v -X POST -F 'file=@path-to-an-image.jpg' http://localhost:${port}/api/image`,
            ]);
        }
        else {
            text = text.concat([
                `curl -v -X POST -H "Content-Type: application/json" -d '{"features": [5, 10, 15, 20]}' http://localhost:${port}/api/features`,
                '',
                '(Expecting ' + model.modelParameters.input_features_count + ' features for this model)',
            ]);
        }

        const isObjectDetection = model.modelParameters.model_type === 'constrained_object_detection' ||
            model.modelParameters.model_type === 'object_detection';
        const isVisualAd = model.modelParameters.has_anomaly === RunnerHelloHasAnomaly.VisualGMM;

        let modelVm: InferenceServerModelViewModel;
        if (model.modelParameters.sensorType === 'camera') {
            modelVm = {
                mode: 'image',
                width: model.modelParameters.image_input_width,
                height: model.modelParameters.image_input_height,
                depth: model.modelParameters.image_channel_count === 3 ? 'RGB' : 'Grayscale',
                showImagePreview: isObjectDetection || isVisualAd,
                modelType: model.modelParameters.model_type,
            };
        }
        else {
            modelVm = {
                mode: 'features',
                featuresCount: model.modelParameters.input_features_count,
                modelType: model.modelParameters.model_type,
            };
        }

        const view = renderInferenceServerView({
            owner: model.project.owner,
            projectName: model.project.name,
            projectVersion: model.project.deploy_version,
            serverPort: port,
            studioLink: projectStudioUrl,
            model: modelVm,
        });

        res.status(200);
        res.header('Content-Type', 'text/html');
        res.end(view.toString());
    }));

    app.get('/api/info', asyncMiddleware((req, res) => {
        res.header('Content-Type', 'application/json');

        let modelParametersCloned = Object.assign({
            has_visual_anomaly_detection: model.modelParameters.has_anomaly === RunnerHelloHasAnomaly.VisualGMM,
        }, model.modelParameters);

        res.end(JSON.stringify({
            project: model.project,
            modelParameters: modelParametersCloned,
        }, null, 4) + '\n');
    }));

    app.post('/api/features', asyncMiddleware(async (req, res) => {
        const body = <{ features: number[] }>req.body;

        try {
            if (!req.body) {
                throw new Error('Missing body on request. Did you set "Content-Type: application/json" ?');
            }
            if (!body.features) {
                throw new Error('Missing "features" on body');
            }
            if (!Array.isArray(body.features)) {
                throw new Error('"features" on body is not an array');
            }
            if (!body.features.every(n => !isNaN(Number(n)))) {
                throw new Error('Not every element of the "features" array is a number');
            }
            if (body.features.length !== runner.getModel().modelParameters.input_features_count) {
                throw new Error('Expected ' + runner.getModel().modelParameters.input_features_count +
                    ' features, but received ' + body.features.length);
            }
        }
        catch (ex2) {
            const ex = <Error>ex2;
            res.status(400);
            res.header('Content-Type', 'text/plain');
            return res.end(ex.message || ex.toString() + '\n');
        }

        if (printIncomingInferenceReqs) {
            console.log(RUNNER_PREFIX, 'Incoming inference request (/api/features)');
        }

        let response = await runner.classify(body.features);

        res.header('Content-Type', 'application/json');
        return res.end(JSON.stringify(response, null, 4) + '\n');
    }));

    app.post('/api/image', asyncMiddleware(async (req, res) => {
        let resized: {
            features: number[],
            originalWidth: number,
            originalHeight: number,
            newWidth: number,
            newHeight: number,
        };

        try {
            const multipartUpload = multer({ limits: { files: 1, fileSize: 100 * 1024 * 1024 } });
            const fields: multer.Field[] = [{ name: "file", maxCount: 1 }];
            await promisify(multipartUpload.fields(fields))(req, res);

            if (!req.files) {
                throw new Error('No files posted, requiring a multipart/form-data body with 1 item "file"');
            }
            const allFiles = Object.keys(req.files || { }).reduce((curr: { [k: string]: Express.Multer.File[] }, v) => {
                if (req.files instanceof Array) return curr;
                curr[v.replace('[]', '')] = req.files![v];
                return curr;
            }, { });
            const file = allFiles.file[0];
            if (!file) {
                throw new Error('Missing "file" in the multipart/form-data');
            }

            if (printIncomingInferenceReqs) {
                console.log(RUNNER_PREFIX, 'Incoming inference request (/api/image) for ' +
                    (file.originalname || 'a file with size ' + file.size + ' bytes'));
            }

            resized = (await ImageClassifier.resizeImage(model, file.buffer));
        }
        catch (ex2) {
            const ex = <Error>ex2;
            res.status(400);
            res.header('Content-Type', 'text/plain');
            return res.end(ex.message || ex.toString() + '\n');
        }

        let response = await runner.classify(resized.features);

        const origFactor = resized.originalWidth / resized.originalHeight;
        const newFactor = resized.newWidth / resized.newHeight;

        // Helper function to transform bounding box and anomaly grid coordinates
        const transformCoordinates = (bb: { x: number, y: number, width: number, height: number }) => {
            const resizeMode = model.modelParameters.image_resize_mode;

            // For 'squash' mode (fill), we simply scale x and y independently
            if (resizeMode === 'squash') {
                const scaleX = resized.newWidth / resized.originalWidth;
                const scaleY = resized.newHeight / resized.originalHeight;

                bb.x = Math.round(bb.x / scaleX);
                bb.y = Math.round(bb.y / scaleY);
                bb.width = Math.round(bb.width / scaleX);
                bb.height = Math.round(bb.height / scaleY);

                return;
            }

            const isContainMode = resizeMode === 'fit-longest';

            // Original image is wider than model input
            if (origFactor > newFactor) {
                if (isContainMode) {
                    // Contain mode - scaled by width, padded on height
                    const scale = resized.newWidth / resized.originalWidth;
                    const offsetY = (resized.newHeight - (resized.originalHeight * scale)) / 2;

                    bb.x = Math.round(bb.x / scale);
                    bb.y = Math.round((bb.y - offsetY) / scale);
                    bb.width = Math.round(bb.width / scale);
                    bb.height = Math.round(bb.height / scale);
                }
                else {
                    // Cover mode - scaled by height, cropped on width
                    const scale = resized.newHeight / resized.originalHeight;
                    const cropX = (resized.originalWidth * scale - resized.newWidth) / 2;

                    bb.x = Math.round((bb.x + cropX) / scale);
                    bb.y = Math.round(bb.y / scale);
                    bb.width = Math.round(bb.width / scale);
                    bb.height = Math.round(bb.height / scale);
                }
            }
            // Original image is taller than model input
            else if (origFactor < newFactor) {
                if (isContainMode) {
                    // Contain mode - scaled by height, padded on width
                    const scale = resized.newHeight / resized.originalHeight;
                    const offsetX = (resized.newWidth - (resized.originalWidth * scale)) / 2;

                    bb.x = Math.round((bb.x - offsetX) / scale);
                    bb.y = Math.round(bb.y / scale);
                    bb.width = Math.round(bb.width / scale);
                    bb.height = Math.round(bb.height / scale);
                }
                else {
                    // Cover mode - scaled by width, cropped on height
                    const scale = resized.newWidth / resized.originalWidth;
                    const cropY = (resized.originalHeight * scale - resized.newHeight) / 2;

                    bb.x = Math.round(bb.x / scale);
                    bb.y = Math.round((bb.y + cropY) / scale);
                    bb.width = Math.round(bb.width / scale);
                    bb.height = Math.round(bb.height / scale);
                }
            }
            // Same aspect ratio - simple scaling
            else {
                const scale = resized.newWidth / resized.originalWidth;

                bb.x = Math.round(bb.x / scale);
                bb.y = Math.round(bb.y / scale);
                bb.width = Math.round(bb.width / scale);
                bb.height = Math.round(bb.height / scale);
            }
        };

        // Transform all bounding boxes and anomaly grid coordinates
        (response.result.bounding_boxes || []).forEach(transformCoordinates);
        (response.result.visual_anomaly_grid || []).forEach(transformCoordinates);

        res.header('Content-Type', 'application/json');
        return res.end(JSON.stringify(response, null, 4) + '\n');
    }));

    app.use(express.static(Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public')));

    return new Promise<void>((resolve, reject) => {
        server.listen(port, process.env.HOST || '0.0.0.0', async () => {
            resolve();
        });

        server.on('error', err => {
            reject(err);
        });
    });
}

export function startWebServer(opts: {
    model: ModelInformation,
    camera: ICamera,
    imgClassifier: ImageClassifier,
    verbose: boolean,
    host: string,
    port: number,
}) {
    const { model, camera, imgClassifier, verbose } = opts;

    const publicFolder = Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public');

    const app = express();

    app.get('/', asyncMiddleware(async (req, res) => {
        const view = renderIndexView({
            isEmbedView: false,
        });

        res.status(200);
        res.header('Content-Type', 'text/html');
        res.end(view.toString());
    }));

    app.get('/embed', asyncMiddleware(async (req, res) => {
        const view = renderIndexView({
            isEmbedView: true,
        });

        res.status(200);
        res.header('Content-Type', 'text/html');
        res.end(view.toString());
    }));

    app.use(express.static(publicFolder));

    const server = new HttpServer(app);
    const io = new SocketIoServer(server, DEFAULT_SOCKET_IO_V2_PARAMS);

    startEio3Interceptor(io);
    const wss = new ws.Server({
        noServer: true,
    });

    const websocketsToSendPreviews = new Set<ws>();

    // you can also get the actual image being classified from 'imageClassifier.on("result")',
    // but then you're limited by the inference speed.
    // here we get a direct feed from the camera so we guarantee the fps that we set earlier.

    let nextFrame = Date.now();
    let processingFrame = false;
    camera.on('snapshot', async (data, filename) => {
        if (nextFrame > Date.now() || processingFrame) return;

        processingFrame = true;

        try {
            let img;
            if (model.modelParameters.image_channel_count === 3) {
                img = sharp(data).resize({
                    height: model.modelParameters.image_input_height,
                    width: model.modelParameters.image_input_width,
                    fastShrinkOnLoad: false
                });
            }
            else {
                img = sharp(data).resize({
                    height: model.modelParameters.image_input_height,
                    width: model.modelParameters.image_input_width,
                    fastShrinkOnLoad: false
                }).toColourspace('b-w');
            }

            const imgBase64 = 'data:image/jpeg;base64,' + (await img.jpeg().toBuffer()).toString('base64');

            io.emit('image', {
                img: imgBase64,
            });
            for (const wsClient of websocketsToSendPreviews) {
                wsClient.send(JSON.stringify({
                    type: 'camera-preview',
                    image: imgBase64,
                }));
            }

            nextFrame = Date.now() + 50;
        }
        catch (ex2) {
            // put this behind a verbose flag, as the ImageClassifier also prints out this error already
            const ex = <Error>ex2;
            if (verbose) {
                console.log(RUNNER_PREFIX, `Failed to handle snapshot "${filename}":`, ex.message || ex.toString());
            }
        }
        finally {
            processingFrame = false;
        }
    });

    imgClassifier.on('result', (result, timeMs, imgAsJpg) => {
        io.emit('classification', {
            modelType: model.modelParameters.model_type,
            result: result.result,
            timeMs: timeMs,
            additionalInfo: result.info,
        });

        for (const client of wss.clients) {
            client.send(JSON.stringify({
                type: 'classification',
                result: result.result,
                timeMs: timeMs,
                additionalInfo: result.info,
            }));
        }
    });

    const onThresholdOverride = async (ev: {
            id: number,
            key: string,
            value: number,
        }) => {
            try {
                process.stdout.write(`Updating threshold for block ID ${ev.id}, key ${ev.key} to: ${ev.value}... `);

                if (typeof ev.id !== 'number') {
                    throw new Error(`Invalid value for "id", should be a number (type: ${typeof ev.id})`);
                }
                if (typeof ev.key !== 'string' || ev.key === '') {
                    throw new Error(`Invalid value for "key", should be a string (type: ${typeof ev.key})`);
                }
                if (typeof ev.value !== 'number') {
                    throw new Error(`Invalid value for "value", should be a number (type: ${typeof ev.value})`);
                }

                let thresholdObj = (model.modelParameters.thresholds || []).find(x => x.id === ev.id);
                if (!thresholdObj) {
                    throw new Error(`Cannot find threshold with ID ` + ev.id);
                }

                const thresholdKeys = Object.keys(thresholdObj).filter(x => x !== 'id' && x !== 'type');
                if (thresholdKeys.indexOf(ev.key) === -1) {
                    throw new Error(`Threshold key "${ev.key}" not found (valid keys: [ ${thresholdKeys.map(x => `"${x}"`).join(', ')} ])`);
                }

                let obj: { [k: string]: string | number } = {
                    id: ev.id,
                };
                obj.type = thresholdObj.type;
                obj[ev.key] = ev.value;

                await imgClassifier.getRunner().setLearnBlockThreshold(<any>obj);

                (<any>thresholdObj)[ev.key] = ev.value;

                console.log(`OK`);
            }
            catch (ex2) {
                const ex = <Error>ex2;
                console.log('Failed to set threshold:', ex);
                throw new Error(`Failed to set threshold "${ev.key}" (block ID: ${ev.id}): ` + (ex.message || ex.toString()));
            }
        };

    io.on('connection', socket => {
        socket.emit('hello', {
            projectName: model.project.owner + ' / ' + model.project.name,
            thresholds: model.modelParameters.thresholds,
        });

        socket.on('threshold-override', (ev: {
            id: number,
            key: string,
            value: number,
        }) => {
            try {
                onThresholdOverride(ev);
            }
            catch (ex) {
                // noop
            }
        });
    });

    wss.on('connection', (websocket) => {
        websocket.send(JSON.stringify({
            type: 'hello',
            ...model,
        }));

        websocket.on('message', async (msg) => {
            type WsMessage = { messageId?: number } & ({
                type: 'threshold-override',
                id: number,
                key: string,
                value: number,
            } | {
                type: 'toggle-camera-preview',
                enabled: boolean,
            } | {
                type: 'set-camera-preview',
                enabled: boolean,
            });

            let body: WsMessage;
            let messageId: number | undefined;

            try {
                if (typeof msg !== 'string') {
                    throw new Error(`Can only handle messages of type "string"`);
                }

                body = <WsMessage>JSON.parse(msg.toString());
                messageId = body.messageId;

                if (body.type === 'threshold-override') {
                    await onThresholdOverride({
                        id: body.id,
                        key: body.key,
                        value: body.value,
                    });
                }
                else if (body.type === 'toggle-camera-preview' ||
                         body.type === 'set-camera-preview'
                ) {
                    if (typeof body.enabled !== 'boolean') {
                        throw new Error(`Invalid value for "enabled", should be a boolean (type: ${typeof body.enabled})`);
                    }
                    if (body.enabled) {
                        websocketsToSendPreviews.add(websocket);
                    }
                    else {
                        websocketsToSendPreviews.delete(websocket);
                    }
                }
                else {
                    throw new Error(`Invalid "type" (${(<{ type: string }>body).type})`);
                }

                websocket.send(JSON.stringify({
                    messageId: messageId,
                    type: 'handling-message-success',
                    message: msg,
                }));
            }
            catch (ex2) {
                const ex = <Error>ex2;
                websocket.send(JSON.stringify({
                    messageId: messageId,
                    type: 'handling-message-error',
                    message: msg,
                    error: ex.message || ex.toString(),
                }));
                return;
            }
        });

        websocket.on('close', () => {
            websocketsToSendPreviews.delete(websocket);
        });
    });

    server.on('upgrade', (request, socket, head) => {
        const { pathname } = Url.parse(request.url || '');

        if (pathname === '/') {
            // Only handle /ws upgrades with ws
            wss.handleUpgrade(request, <any>socket, head, (newWs) => {
                wss.emit('connection', newWs, request);
            });
        }
        else {
            // socket.io will handle this
        }
    });

    return new Promise<number>((resolve, reject) => {
        server.listen(opts.port, opts.host, async () => {
            resolve(opts.port);
        });

        server.on('error', err => {
            reject(err);
        });
    });
}
