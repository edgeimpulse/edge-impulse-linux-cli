import { Server as HttpServer} from 'node:http';
import Path from 'node:path';
import { promisify } from 'node:util';
import express from 'express';
import multer from 'multer';
import sharp, { FitEnum } from 'sharp';
import { Server as SocketIoServer } from 'socket.io';
import type { EdgeImpulseApi } from '../../sdk/studio/api';
import { type LinuxImpulseRunner, type ModelInformation, RunnerBlockThreshold, RunnerHelloHasAnomaly, SetRunnerBlockThreshold, RunnerHelloInferencingEngine } from '../../library/classifier/linux-impulse-runner';
import { type InferenceServerModelViewModel, renderInferenceServerView } from './webserver/views/inference-server-view';
import { asyncMiddleware } from './webserver/middleware/asyncMiddleware';
import { ImageClassifier, FitMethodMap, FitMethodStudioMap } from '../../library/classifier/image-classifier';
import type { ICamera } from '../../library/sensors/icamera';
import { DEFAULT_SOCKET_IO_V2_PARAMS, startEio3Interceptor } from '../../cli-common/socket-utils';
import ws from 'ws';
import Url from 'url';
import { renderIndexView } from './webserver/views';
import { mapPredictionToOriginalImage, } from '../../shared/views/project/bounding-box-scaling';
import { AudioClassifier } from '../../library';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';

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
    console.log(RUNNER_PREFIX, 'Parameters');
    if (model.modelParameters.inferencing_engine === RunnerHelloInferencingEngine.VlmConnector) {
        console.log(RUNNER_PREFIX, 'VLM inference engine enabled, dynamic image size handling');
    }
    else {
        console.log(RUNNER_PREFIX, 'image size', param.image_input_width + 'x' + param.image_input_height + ' px (' +
                param.image_channel_count + ' channels)');
    };
    console.log(RUNNER_PREFIX, 'classes', labels);

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

        filterClassificationResultsOnMinScore(
            response.result.classification || {},
            getClassificationMinScore(model.modelParameters.thresholds || []));

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
            if (model.modelParameters.image_resize_mode === 'none') {
                // set image parameters to original size
                let params = {
                    image_width: resized.originalWidth,
                    image_height: resized.originalHeight,
                    image_channels: model.modelParameters.image_channel_count,
                };
                runner.setParameter(params);
                resized.newHeight = resized.originalHeight;
                resized.newWidth = resized.originalWidth;
            }
        }
        catch (ex2) {
            const ex = <Error>ex2;
            res.status(400);
            res.header('Content-Type', 'text/plain');
            return res.end(ex.message || ex.toString() + '\n');
        }

        let response = await runner.classify(resized.features);

        // Helper function to transform bounding box and anomaly grid coordinates
        const transformCoordinates = (bb: { x: number, y: number, width: number, height: number }) => {
            const mapped = mapPredictionToOriginalImage(
                FitMethodStudioMap[model.modelParameters.image_resize_mode || 'none'],
                {
                    label: 'test',
                    x: bb.x / resized.newWidth,
                    y: bb.y / resized.newHeight,
                    width: bb.width / resized.newWidth,
                    height: bb.height / resized.newHeight,
                },
                {
                    clientWidth: resized.originalWidth,
                    clientHeight: resized.originalHeight,
                    referenceWidth: resized.newWidth,
                    referenceHeight: resized.newHeight,
                },
            );

            bb.x = mapped.x;
            bb.y = mapped.y;
            bb.width = mapped.width;
            bb.height = mapped.height;
        };

        filterClassificationResultsOnMinScore(
            response.result.classification || {},
            getClassificationMinScore(model.modelParameters.thresholds || []));

        // Transform all bounding boxes and anomaly grid coordinates
        (response.result.bounding_boxes || []).forEach(transformCoordinates);
        (response.result.visual_anomaly_grid || []).forEach(transformCoordinates);

        // This info is needed to show client side crop masking for 'fit-short' mode
        response.result.resizeMode = model.modelParameters.image_resize_mode || 'none';
        response.result.resized = {
            originalWidth: resized.originalWidth,
            originalHeight: resized.originalHeight,
            newWidth: resized.newWidth,
            newHeight: resized.newHeight,
        };

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

export function startWebServer(opts: ({
    type: 'camera',
    camera: ICamera,
    imgClassifier: ImageClassifier,
    streamResolution: 'original' | 'scaled-using-impulse',
} | {
    type: 'audio',
    audioClassifier: AudioClassifier,
}) & {
    model: ModelInformation,
    verbose: boolean,
    host: string,
    port: number,
}) {
    const { model, verbose } = opts;

    const publicFolder = Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public');

    const app = express();

    app.get('/', asyncMiddleware(async (req, res) => {
        const view = renderIndexView({
            isEmbedView: false,
            hasPerformanceCalibration: model.modelParameters.has_performance_calibration || false,
            sensorType: opts.type,
        });

        res.status(200);
        res.header('Content-Type', 'text/html');
        res.end(view.toString());
    }));

    app.get('/embed', asyncMiddleware(async (req, res) => {
        const view = renderIndexView({
            isEmbedView: true,
            hasPerformanceCalibration: model.modelParameters.has_performance_calibration || false,
            sensorType: opts.type,
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
    let cameraResolution: {
        width: number,
        height: number,
    } | undefined;

    if (opts.type === 'camera') {
        const { camera, imgClassifier, streamResolution } = opts;

        camera.on('snapshot', async (data, filename) => {
            if (nextFrame > Date.now() || processingFrame) return;

            processingFrame = true;

            try {
                // Normally it's not expected that the camera resolution changes
                // (after the gstreamer pipeline is created), however in TCP
                // streaming server mode, the client can re-connect with a
                // different resolution. So we grab the (new) camera resolution
                // from the image. Profiling shows that latency is not affected
                // significantly.
                const metadata = await sharp(data).metadata();
                cameraResolution = {
                    width: metadata.width || 0,
                    height: metadata.height || 0,
                };

                let imgBase64: string;

                if (streamResolution === 'scaled-using-impulse') {
                    const fitMethod: keyof FitEnum = FitMethodMap[model.modelParameters.image_resize_mode || 'none'];
                    let img: sharp.Sharp;

                    if (model.modelParameters.image_channel_count === 3) {
                        img = sharp(data).resize({
                            height: model.modelParameters.image_input_height,
                            width: model.modelParameters.image_input_width,
                            fit: fitMethod,
                            fastShrinkOnLoad: false
                        });
                    }
                    else {
                        img = sharp(data).resize({
                            height: model.modelParameters.image_input_height,
                            width: model.modelParameters.image_input_width,
                            fit: fitMethod,
                            fastShrinkOnLoad: false
                        }).toColourspace('b-w');
                    }

                    imgBase64 = 'data:image/jpeg;base64,' + (await img.jpeg().toBuffer()).toString('base64');
                }
                else {
                    imgBase64 = 'data:image/jpeg;base64,' + data.toString('base64');
                }

                io.emit('image', {
                    img: imgBase64,
                });
                for (const wsClient of websocketsToSendPreviews) {
                    wsClient.send(JSON.stringify({
                        type: 'camera-preview',
                        image: imgBase64,
                    }));
                }
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

            filterClassificationResultsOnMinScore(
                result.result.classification || {},
                getClassificationMinScore(model.modelParameters.thresholds || []));

            let resultsMapped = structuredClone(result.result);

            // result is scaled to the impulse; rescale to original cam resolution if required
            if (opts.streamResolution === 'original' && cameraResolution) {
                if (resultsMapped.bounding_boxes) {
                    resultsMapped.bounding_boxes = scaleAndMapBbs(
                        resultsMapped.bounding_boxes, model, cameraResolution);
                }
                if (resultsMapped.object_tracking) {
                    resultsMapped.object_tracking = scaleAndMapBbs<
                        BaseBox & { object_id: number }, { object_id: number }
                    >(
                        resultsMapped.object_tracking, model, cameraResolution,
                        (bb) => ({ object_id: bb.object_id }));
                }
                if (resultsMapped.visual_anomaly_grid) {
                    resultsMapped.visual_anomaly_grid = scaleAndMapBbs(
                        resultsMapped.visual_anomaly_grid, model, cameraResolution);
                }
            }

            io.emit('classification', {
                modelType: model.modelParameters.model_type,
                result: resultsMapped,
                timeMs: timeMs,
                additionalInfo: result.info,
                min_score: getClassificationMinScore(
                    model.modelParameters.thresholds || []),
            });

            for (const client of wss.clients) {
                client.send(JSON.stringify({
                    type: 'classification',
                    result: resultsMapped,
                    timeMs: timeMs,
                    additionalInfo: result.info,
                }));
            }
        });
    }
    else if (opts.type === 'audio') {
        const { audioClassifier } = opts;

        audioClassifier.on('result', (result, timeMs) => {
            let resultsMapped = structuredClone(result.result);

            io.emit('classification', {
                modelType: model.modelParameters.model_type,
                result: resultsMapped,
                timeMs: timeMs,
                additionalInfo: result.info,
            });

            for (const client of wss.clients) {
                client.send(JSON.stringify({
                    type: 'classification',
                    result: resultsMapped,
                    timeMs: timeMs,
                    additionalInfo: result.info,
                }));
            }
        });
    }

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

                let obj: SetRunnerBlockThreshold = {
                    id: ev.id,
                };
                obj[ev.key] = ev.value;

                if (opts.type === 'camera') {
                    await opts.imgClassifier.getRunner().setLearnBlockThreshold(obj);
                }
                else if (opts.type === 'audio') {
                    await opts.audioClassifier.getRunner().setLearnBlockThreshold(obj);
                }

                thresholdObj[ev.key] = ev.value;

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
            sensorType: opts.type,
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

type BaseBox = {
    x: number; y: number; width: number; height: number;
    label: string; value: number;
};

function scaleAndMapBbs<T extends BaseBox, TExtra extends object = {}>(
    bbs: T[],
    model: ModelInformation,
    cameraResolution: { width: number, height: number },
    extraFields?: (bb: T) => TExtra
): Array<BaseBox & TExtra & ReturnType<typeof mapPredictionToOriginalImage>> {
    const mapped: Array<BaseBox & TExtra & ReturnType<typeof mapPredictionToOriginalImage> & Record<string, any>> = [];
    for (const originalBb of bbs || []) {
        const bb = structuredClone(originalBb);

        // Scale back to 0..1
        bb.width /= model.modelParameters.image_input_width;
        bb.x /= model.modelParameters.image_input_width;
        bb.height /= model.modelParameters.image_input_height;
        bb.y /= model.modelParameters.image_input_height;

        let newBb = {
            label: bb.label,
            value: bb.value,
            ...(extraFields ? extraFields(bb) : {} as TExtra),
            ...mapPredictionToOriginalImage(FitMethodStudioMap[model.modelParameters.image_resize_mode || 'squash'], bb, {
                clientWidth: cameraResolution.width,
                clientHeight: cameraResolution.height,
                referenceWidth: model.modelParameters.image_input_width,
                referenceHeight: model.modelParameters.image_input_height,
            }),
        };
        newBb.x = Math.round(newBb.x);
        newBb.y = Math.round(newBb.y);
        newBb.width = Math.round(newBb.width);
        newBb.height = Math.round(newBb.height);
        mapped.push(newBb);
    }

    return mapped;
}

function getClassificationMinScore(
    thresholds: RunnerBlockThreshold[]) : number  {

    let minScore : number = 0.001;

    // find the 'classification' entry
    const thresholdObj = (thresholds || []).find(
        x => x.type === 'classification');

    // grab the 'min_score' value
    if (thresholdObj
        && (Object.keys(thresholdObj).indexOf('min_score') > -1)) {
        minScore = (<any>thresholdObj).min_score;
    }

    return minScore;
}

function filterClassificationResultsOnMinScore(
    classifications: { [k: string]: number },
    minScore: number) {

    let filteredClassificationResults: { [k: string]: number } = {};
    for (const [ key, value ] of Object.entries(classifications)) {
       if (value < minScore) {
        // similar to Studio
        classifications[key] = 0;
       }
    }
}

/**
 * Check if the VLM server is running.
 * @param serverAddress The address of the VLM server.
 * @param serverPort The port of the VLM server.
 * @returns True if the server is running, false otherwise.
 */
export async function isVlmServerRunning(serverAddress: string, serverPort: number): Promise<boolean> {
    console.log(`Checking if VLM server is running at ${serverAddress}:${serverPort}...`);
    // send a sample request to the server to check if it's running
    return new Promise((resolve) => {
        const options = {
            hostname: serverAddress,
            port: serverPort,
            path: '/v1/models', // if we can get the model list, the server is running
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
                console.log('VLM server is running.');
                resolve(true);
            }
            else {
                console.log(`VLM server responded with status code: ${res.statusCode}`);
                resolve(false);
            }
        });

        req.on('error', (err) => {
            console.error('Error connecting to VLM server:', err.message);
            resolve(false);
        });

        req.end();
    });
}

/**
 * Start the VLM server.
 * @param serverPath Path to the VLM server binary.
 * @param modelPath Path to the VLM model file.
 * @param serverAddress The address to bind the VLM server.
 * @param serverPort The port to bind the VLM server.
 * @returns The spawned VLM server process.
 */
export function startVlmServer(serverPath: string, serverArgs: string[]
): Promise<ChildProcess> {

    // Add server binary folder to LD_LIBRARY_PATH
    let serverDir = Path.dirname(serverPath);

    return new Promise((resolve, reject) => {
        const vlmServerProcess = spawn(serverPath, serverArgs, {
            cwd: serverDir,
            detached: false,
            stdio: 'pipe'
        });

        vlmServerProcess.stdout.on('data', (data) => {
            const message = data.toString();
            console.log(`[VLM Server]: ${message}`);
            if (message.includes('main: server is listening')) {
                resolve(vlmServerProcess);
            }
        });

        vlmServerProcess.stderr.on('data', (data) => {
            const message = data.toString();
            console.log(`[VLM Server]: ${message}`);
            if (message.includes('main: server is listening')) {
                resolve(vlmServerProcess);
            }
        });

        vlmServerProcess.on('error', (err) => {
            console.error('Failed to start VLM server:', err);
            reject(err);
        });

        vlmServerProcess.on('exit', (code, signal) => {
            console.log(`VLM server exited with code ${code}, signal ${signal}`);
            if (code !== 0) {
                reject(new Error(`VLM server exited with code ${code}`));
            }
        });
    });
}

/**
 * Stop the VLM server.
 * @param vlmServerProcess The VLM server process to stop.
 */
export function stopVlmServer(vlmServerProcess: ChildProcess): void {
    if (vlmServerProcess) {
        console.log('Stopping VLM server...');
        vlmServerProcess.kill('SIGTERM'); // Gracefully terminate the process
    }
    else {
        console.log('VLM server is not running.');
    }
}