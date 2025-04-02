import { EdgeImpulseApi } from '../../sdk/studio/api';
import { LinuxImpulseRunner, ModelInformation, RunnerHelloHasAnomaly } from '../../library/classifier/linux-impulse-runner';
import multer from 'multer';
import util from 'util';
import { InferenceServerModelViewModel, renderInferenceServerView } from './webserver/views/inference-server-view';
import { asyncMiddleware } from './webserver/middleware/asyncMiddleware';
import express = require('express');
import http from 'http';
import { ImageClassifier } from '../../library/classifier/image-classifier';
import Path from 'path';
import socketIO from 'socket.io';
import sharp from 'sharp';
import { ICamera } from '../../library/sensors/icamera';

const RUNNER_PREFIX = '\x1b[33m[RUN]\x1b[0m';

export async function listTargets(projectId: number, api: EdgeImpulseApi) {

    const targets = await api.deployment.listDeploymentTargetsForProjectDataSources(projectId, { });
    console.log('Listing all available targets');
    console.log('-----------------------------');
    for (let t of targets.targets.filter(x => x.format.startsWith('runner'))) {
        console.log(`target: ${t.format}, ` +
            `name: ${t.name}, ` +
            `supported engines: [${t.supportedEngines.join(', ')}], ` +
            `supported variants: [${t.modelVariants.filter(x => x.supported).map(x => x.variant).join(', ')}]`
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

export function startApiServer(model: ModelInformation,
                               runner: LinuxImpulseRunner,
                               projectStudioUrl: string,
                               port: number) {
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

    const server = new http.Server(app);

    app.get('/', asyncMiddleware(async (req, res) => {
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
            };
        }
        else {
            modelVm = {
                mode: 'features',
                featuresCount: model.modelParameters.input_features_count,
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

    app.get('/api/info', asyncMiddleware(async (req, res) => {
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

        console.log(RUNNER_PREFIX, 'Incoming inference request (/api/features)');

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
            await util.promisify(multipartUpload.fields(fields))(req, res);

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

            console.log(RUNNER_PREFIX, 'Incoming inference request (/api/image) for ' +
                (file.originalname || 'a file with size ' + file.size + ' bytes'));

            resized = (await ImageClassifier.resizeImage(model, file.buffer));
        }
        catch (ex2) {
            const ex = <Error>ex2;
            res.status(400);
            res.header('Content-Type', 'text/plain');
            return res.end(ex.message || ex.toString() + '\n');
        }

        let response = await runner.classify(resized.features);

        let origFactor = resized.originalWidth / resized.originalHeight;
        let newFactor = resized.newWidth / resized.newHeight;

        let factor: number;
        let offsetX: number;
        let offsetY: number;

        if (origFactor > newFactor) {
            // boxed in with bands top/bottom
            factor = resized.newWidth / resized.originalWidth;
            offsetX = 0;
            offsetY = (resized.newHeight - (resized.originalHeight * factor)) / 2;
        }
        else if (origFactor < newFactor) {
            // boxed in with bands left/right
            factor = resized.newHeight / resized.originalHeight;
            offsetX = (resized.newWidth - (resized.originalWidth * factor)) / 2;
            offsetY = 0;
        }
        else {
            // image was already at the right aspect ratio
            offsetX = 0;
            offsetY = 0;
            factor = resized.newWidth / resized.originalWidth;
        }

        for (const bb of response.result.bounding_boxes || []) {
            bb.x = Math.round((bb.x / factor) - (offsetX / factor));
            bb.width = Math.round((bb.width / factor));
            bb.y = Math.round((bb.y / factor) - (offsetY / factor));
            bb.height = Math.round((bb.height / factor));
        }
        for (const bb of response.result.visual_anomaly_grid || []) {
            bb.x = Math.round((bb.x / factor) - (offsetX / factor));
            bb.width = Math.round((bb.width / factor));
            bb.y = Math.round((bb.y / factor) - (offsetY / factor));
            bb.height = Math.round((bb.height / factor));
        }

        res.header('Content-Type', 'application/json');
        return res.end(JSON.stringify(response, null, 4) + '\n');
    }));

    app.use(express.static(Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public')));

    return new Promise<void>((resolve) => {
        server.listen(port, process.env.HOST || '0.0.0.0', async () => {
            resolve();
        });
    });
}

export function startWebServer(model: ModelInformation, camera: ICamera, imgClassifier: ImageClassifier) {
    const app = express();
    app.use(express.static(Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public')));

    const server = new http.Server(app);
    const io = socketIO(server);

    // you can also get the actual image being classified from 'imageClassifier.on("result")',
    // but then you're limited by the inference speed.
    // here we get a direct feed from the camera so we guarantee the fps that we set earlier.

    let nextFrame = Date.now();
    let processingFrame = false;
    camera.on('snapshot', async (data) => {
        if (nextFrame > Date.now() || processingFrame) return;

        processingFrame = true;

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

        io.emit('image', {
            img: 'data:image/jpeg;base64,' + (await img.jpeg().toBuffer()).toString('base64')
        });

        nextFrame = Date.now() + 50;
        processingFrame = false;
    });

    imgClassifier.on('result', async (result, timeMs, imgAsJpg) => {
        io.emit('classification', {
            modelType: model.modelParameters.model_type,
            result: result.result,
            timeMs: timeMs,
            additionalInfo: result.info,
        });
    });

    io.on('connection', socket => {
        socket.emit('hello', {
            projectName: model.project.owner + ' / ' + model.project.name,
            thresholds: model.modelParameters.thresholds,
        });

        socket.on('threshold-override', async (ev: {
            id: number,
            key: string,
            value: number,
        }) => {
            try {
                process.stdout.write(`Updating threshold for block ID ${ev.id}, key ${ev.key} to: ${ev.value}... `);

                let thresholdObj = (model.modelParameters.thresholds || []).find(x => x.id === ev.id);
                if (!thresholdObj) {
                    throw new Error(`Cannot find threshold with ID ` + ev.id);
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
            catch (ex) {
                console.log('Failed to set threshold:', ex);
            }
        });
    });

    return new Promise<number>((resolve) => {
        server.listen(Number(process.env.PORT) || 4912, process.env.HOST || '0.0.0.0', async () => {
            resolve((Number(process.env.PORT) || 4912));
        });
    });
}
