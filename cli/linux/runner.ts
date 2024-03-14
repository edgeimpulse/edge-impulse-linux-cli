#!/usr/bin/env node

import Path from 'path';
import { LinuxImpulseRunner, ModelInformation, RunnerHelloHasAnomaly,
         RunnerHelloInferencingEngine, RunnerHelloResponseModelParameters } from '../../library/classifier/linux-impulse-runner';
import { AudioClassifier } from '../../library/classifier/audio-classifier';
import { ImageClassifier } from '../../library/classifier/image-classifier';
import { Imagesnap } from '../../library/sensors/imagesnap';
import inquirer from 'inquirer';
import { Config } from '../config';
import { initCliApp, setupCliApp } from '../init-cli-app';
import fs from 'fs';
import os from 'os';
import { RunnerDownloader, RunnerModelPath } from './runner-downloader';
import { GStreamer } from '../../library/sensors/gstreamer';
import { ICamera } from '../../library/sensors/icamera';
import program from 'commander';
import express = require('express');
import http from 'http';
import socketIO from 'socket.io';
import sharp from 'sharp';
import { AudioRecorder } from '../../library';
import { ips } from '../get-ips';
import { Prophesee } from '../../library/sensors/prophesee';
import { asyncMiddleware } from './webserver/middleware/asyncMiddleware';
import multer from 'multer';
import util from 'util';
import { InferenceServerModelViewModel, InferenceServerViewModel, renderInferenceServerView } from './webserver/views/inference-server-view';

const RUNNER_PREFIX = '\x1b[33m[RUN]\x1b[0m';
const BUILD_PREFIX = '\x1b[32m[BLD]\x1b[0m';

let audioClassifier: AudioClassifier | undefined;
let imageClassifier: ImageClassifier | undefined;
let configFactory: Config | undefined;

const packageVersion = (<{ version: string }>JSON.parse(fs.readFileSync(
    Path.join(__dirname, '..', '..', '..', 'package.json'), 'utf-8'))).version;

program
    .description('Edge Impulse Linux runner ' + packageVersion)
    .version(packageVersion)
    .option('--model-file <file>', 'Specify model file (either path to .eim, or the socket on which the model is running), ' +
        'if not provided the model will be fetched from Edge Impulse')
    .option('--api-key <key>', 'API key to authenticate with Edge Impulse (overrides current credentials)')
    .option('--download <file>', 'Just download the model and store it on the file system')
    .option('--list-targets', 'List all supported targets and inference engines')
    .option('--force-target <target>', 'Do not autodetect the target system, but set it by hand (e.g. "runner-linux-aarch64")')
    .option('--force-engine <engine>', 'Do not autodetect the inference engine, but set it by hand (e.g. "tflite")')
    .option('--run-http-server <port>', 'Do not run using a sensor, but instead expose an API server at the specified port')
    .option('--clean', 'Clear credentials')
    .option('--silent', `Run in silent mode, don't prompt for credentials`)
    .option('--quantized', 'Download int8 quantized neural networks, rather than the float32 neural networks. ' +
        'These might run faster on some architectures, but have reduced accuracy.')
    .option('--enable-camera', 'Always enable the camera. This flag needs to be used to get data from the microphone ' +
        'on some USB webcams.')
    .option('--gst-launch-args <args>', 'Override the arguments to gst-launch-1.0. This should be a stream that returns JPEG images, e.g.: ' +
        '"v4l2src device=/dev/video0 ! video/x-raw,width=640,height=480 ! videoconvert ! jpegenc"')
    .option('--dev', 'List development servers, alternatively you can use the EI_HOST environmental variable ' +
        'to specify the Edge Impulse instance.')
    .option('--verbose', 'Enable debug logs')
    .allowUnknownOption(true)
    .parse(process.argv);

const devArgv: boolean = !!program.dev;
const cleanArgv: boolean = !!program.clean;
const silentArgv: boolean = !!program.silent;
const quantizedArgv: boolean = !!program.quantized;
const enableCameraArgv: boolean = !!program.enableCamera;
const verboseArgv: boolean = !!program.verbose;
const apiKeyArgv = <string | undefined>program.apiKey;
const modelFileArgv = <string | undefined>program.modelFile;
const downloadArgv = <string | undefined>program.download;
const forceTargetArgv = <string | undefined>program.forceTarget;
const forceEngineArgv = <string | undefined>program.forceEngine;
const listTargetsArgv: boolean = !!program.listTargets;
const gstLaunchArgsArgv = <string | undefined>program.gstLaunchArgs;
const runHttpServerPort = program.runHttpServer ? Number(program.runHttpServer) : undefined;

process.on('warning', e => console.warn(e.stack));

const cliOptions = {
    appName: 'Edge Impulse Linux runner',
    apiKeyArgv: apiKeyArgv,
    cleanArgv: cleanArgv,
    devArgv: devArgv,
    hmacKeyArgv: undefined,
    silentArgv: silentArgv,
    connectProjectMsg: 'From which project do you want to load the model?',
    getProjectFromConfig: async () => {
        if (!configFactory) return undefined;

        let projectId = await configFactory.getLinuxProjectId();
        if (!projectId) {
            return undefined;
        }
        return { projectId: projectId };
    }
};

let firstExit = true;
let isExiting = false;

const onSignal = async () => {
    if (!firstExit) {
        process.exit(1);
    }
    else {
        isExiting = true;

        console.log(RUNNER_PREFIX, 'Received stop signal, stopping application... ' +
            'Press CTRL+C again to force quit.');
        firstExit = false;
        try {
            if (audioClassifier) {
                await audioClassifier.stop();
            }
            if (imageClassifier) {
                await imageClassifier.stop();
            }
            process.exit(0);
        }
        catch (ex2) {
            let ex = <Error>ex2;
            console.log(RUNNER_PREFIX, 'Failed to stop inferencing', ex.message);
        }
        process.exit(1);
    }
};

process.on('SIGHUP', onSignal);
process.on('SIGINT', onSignal);

// tslint:disable-next-line: no-floating-promises
(async () => {
    try {
        let modelFile;

        if (listTargetsArgv && modelFile) {
            throw new Error('Cannot combine --list-targets and --model-file');
        }

        let modelPath: RunnerModelPath | undefined;
        let projectStudioUrl: string | undefined;

        // no model file passed in? then build / download the latest deployment...
        if (!modelFileArgv) {
            const init = await initCliApp(cliOptions);
            const config = init.config;
            configFactory = init.configFactory;

            const { projectId } = await setupCliApp(configFactory, config, cliOptions, undefined);

            const studioUrl = await configFactory.getStudioUrl(null);
            projectStudioUrl = studioUrl + '/studio/' + projectId;

            await configFactory.setLinuxProjectId(projectId);

            if (listTargetsArgv) {
                const targets = await config.api.deployment.listDeploymentTargetsForProjectDataSources(projectId);
                console.log('Listing all available targets');
                console.log('-----------------------------');
                for (let t of targets.targets.filter(x => x.format.startsWith('runner'))) {
                    console.log(`target: ${t.format}, name: ${t.name}, supported engines: [${t.supportedEngines.join(', ')}]`);
                }
                console.log('');
                console.log('You can force a target via "edge-impulse-linux-runner --force-target <target> [--force-engine <engine>]"');
                process.exit(0);
            }

            const downloader = new RunnerDownloader(projectId, quantizedArgv ? 'int8' : 'float32',
                config, forceTargetArgv, forceEngineArgv);
            downloader.on('build-progress', msg => {
                console.log(BUILD_PREFIX, msg);
            });

            modelPath = new RunnerModelPath(projectId, quantizedArgv ? 'int8' : 'float32',
                forceTargetArgv, forceEngineArgv);

            // no new version? and already downloaded? return that model
            let currVersion = await downloader.getLastDeploymentVersion();
            if (currVersion && await checkFileExists(modelPath.getModelPath(currVersion))) {
                modelFile = modelPath.getModelPath(currVersion);
                console.log(RUNNER_PREFIX, 'Already have model', modelFile, 'not downloading...');
            }
            else {
                console.log(RUNNER_PREFIX, 'Downloading model...');

                let deployment = await downloader.downloadDeployment();
                let tmpDir = await fs.promises.mkdtemp(Path.join(os.tmpdir(), 'ei-' + Date.now()));
                tmpDir = Path.join(os.tmpdir(), tmpDir);
                await fs.promises.mkdir(tmpDir, { recursive: true });
                let ret = await downloader.getDownloadType();
                modelFile = Path.join(tmpDir, ret[0]);
                await fs.promises.writeFile(modelFile, deployment);
                await fs.promises.chmod(modelFile, 0o755);

                console.log(RUNNER_PREFIX, 'Downloading model OK');
            }
            if (downloadArgv) {
                await fs.promises.mkdir(Path.dirname(downloadArgv), { recursive: true });
                await fs.promises.copyFile(modelFile, downloadArgv);
                console.log(RUNNER_PREFIX, 'Stored model in', Path.resolve(downloadArgv));
                return process.exit(0);
            }
        }
        else {
            if (downloadArgv) {
                throw new Error('Cannot combine --model-file and --download');
            }
            configFactory = new Config();
            modelFile = modelFileArgv;
            await fs.promises.chmod(modelFile, 0o755);
        }

        const runner = new LinuxImpulseRunner(modelFile);
        const model = await runner.init();

        // if downloaded? then store...
        if (!modelFileArgv && modelPath) {
            let file = modelPath.getModelPath(model.project.deploy_version);
            if (file !== modelFile) {
                await fs.promises.mkdir(Path.dirname(file), { recursive: true });
                await fs.promises.copyFile(modelFile, file);
                await fs.promises.unlink(modelFile);
                console.log(RUNNER_PREFIX, 'Stored model version in', file);
            }
        }

        if (!projectStudioUrl) {
            projectStudioUrl = 'https://studio.edgeimpulse.com/studio/' + model.project.id;
        }

        let param = model.modelParameters;

        if (runHttpServerPort) {
            console.log(RUNNER_PREFIX, 'Starting HTTP server for',
                model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')',
                'on port ' + runHttpServerPort);
            if (param.sensorType === 'camera') {
                console.log(RUNNER_PREFIX, 'Parameters',
                    'image size', param.image_input_width + 'x' + param.image_input_height + ' px (' +
                        param.image_channel_count + ' channels)',
                    'classes', param.labels);
            }
            else {
                console.log(RUNNER_PREFIX, 'Parameters', 'freq', param.frequency + 'Hz',
                    'window length', ((param.input_features_count / param.frequency / param.axis_count) * 1000) + 'ms.',
                    'classes', param.labels);
            }

            await startApiServer(model, runner, projectStudioUrl, runHttpServerPort);

            console.log(RUNNER_PREFIX, '');
            console.log(RUNNER_PREFIX, `HTTP Server now running at http://localhost:${runHttpServerPort}`);
            console.log(RUNNER_PREFIX, '');

            return;
        }

        if (param.sensorType === 'microphone') {
            console.log(RUNNER_PREFIX, 'Starting the audio classifier for',
                model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
            console.log(RUNNER_PREFIX, 'Parameters', 'freq', param.frequency + 'Hz',
                'window length', ((param.input_features_count / param.frequency / param.axis_count) * 1000) + 'ms.',
                'classes', param.labels);

            if (enableCameraArgv) {
                await connectCamera(configFactory);
            }

            let audioDevice: string | undefined;
            const audioDevices = await AudioRecorder.ListDevices();
            const storedAudio = await configFactory.getAudio();
            if (storedAudio && audioDevices.find(d => d.id === storedAudio)) {
                audioDevice = storedAudio;
            }
            else if (audioDevices.length === 1) {
                audioDevice = audioDevices[0].id;
            }
            else if (audioDevices.length === 0) {
                console.warn(RUNNER_PREFIX, 'Could not find any microphones...');
                audioDevice = '';
            }
            else {
                let inqRes = await inquirer.prompt([{
                    type: 'list',
                    choices: (audioDevices || []).map(p => ({ name: p.name, value: p.id })),
                    name: 'microphone',
                    message: 'Select a microphone',
                    pageSize: 20
                }]);
                audioDevice = <string>inqRes.microphone;
            }
            await configFactory.storeAudio(audioDevice);

            console.log(RUNNER_PREFIX, 'Using microphone ' + audioDevice);

            audioClassifier = new AudioClassifier(runner, verboseArgv);

            audioClassifier.on('noAudioError', async () => {
                console.log('');
                console.log(RUNNER_PREFIX, 'ERR: Did not receive any audio.');
                console.log('ERR: Did not receive any audio. Here are some potential causes:');
                console.log('* If you are on macOS this might be a permissions issue.');
                console.log('  Are you running this command from a simulated shell (like in Visual Studio Code)?');
                console.log('* If you are on Linux and use a microphone in a webcam, you might also want');
                console.log('  to initialize the camera with --enable-camera');
                await audioClassifier?.stop();
                process.exit(1);
            });

            await audioClassifier.start(audioDevice);

            audioClassifier.on('result', (ev, timeMs, audioAsPcm) => {
                if (!ev.result.classification) return;

                // print the raw predicted values for this frame
                // (turn into string here so the content does not jump around)
                // tslint:disable-next-line: no-unsafe-any
                let c = <{ [k: string]: string | number }>(<any>ev.result.classification);
                for (let k of Object.keys(c)) {
                    c[k] = (<number>c[k]).toFixed(4);
                }
                console.log('classifyRes', timeMs + 'ms.', c);
                if (ev.info) {
                    console.log('additionalInfo:', ev.info);
                }
            });
        }
        else if (param.sensorType === 'camera') {
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

            let camera = await connectCamera(configFactory);

            imageClassifier = new ImageClassifier(runner, camera);

            await imageClassifier.start();

            let webserverPort = await startWebServer(model, camera, imageClassifier);
            console.log('');
            console.log('Want to see a feed of the camera and live classification in your browser? ' +
                'Go to http://' + (ips.length > 0 ? ips[0].address : 'localhost') + ':' + webserverPort);
            console.log('');

            imageClassifier.on('result', (ev, timeMs, imgAsJpg) => {
                if (ev.result.classification) {
                    // print the raw predicted values for this frame
                    // (turn into string here so the content does not jump around)
                    // tslint:disable-next-line: no-unsafe-any
                    let c = <{ [k: string]: string | number }>(<any>ev.result.classification);
                    for (let k of Object.keys(c)) {
                        c[k] = (<number>c[k]).toFixed(4);
                    }
                    console.log('classifyRes', timeMs + 'ms.', c);
                }
                if (ev.result.bounding_boxes) {
                    console.log('boundingBoxes', timeMs + 'ms.', JSON.stringify(ev.result.bounding_boxes));
                }
                if (ev.result.visual_anomaly_grid) {
                    console.log('visual anomalies', timeMs + 'ms.', JSON.stringify(ev.result.visual_anomaly_grid));
                }
                if (ev.info) {
                    console.log('additionalInfo:', ev.info);
                }
            });
        }
        else {
            throw new Error('Invalid sensorType: ' + param.sensorType);
        }
    }
    catch (ex2) {
        let ex = <Error>ex2;
        console.warn(RUNNER_PREFIX, 'Failed to run impulse', ex.message || ex.toString());

        if ((ex.message || ex.toString()).indexOf('libtensorflowlite_flex') > -1) {
            console.log('You will need to install the flex delegates ' +
                'shared library to run this model. Learn more at https://docs.edgeimpulse.com/docs/edge-impulse-for-linux/flex-delegates');
            console.log('');
        }

        if (audioClassifier) {
            await audioClassifier.stop();
        }
        if (imageClassifier) {
            await imageClassifier.stop();
        }
        process.exit(1);
    }
})();

async function connectCamera(cf: Config) {
    let camera: ICamera;
    if (process.env.PROPHESEE_CAM === '1') {
        camera = new Prophesee(verboseArgv);
    }
    else if (process.platform === 'darwin') {
        camera = new Imagesnap(verboseArgv);
    }
    else if (process.platform === 'linux') {
        camera = new GStreamer(verboseArgv, {
            customLaunchCommand: gstLaunchArgsArgv,
        });
    }
    else {
        throw new Error('Unsupported platform "' + process.platform + '"');
    }
    await camera.init();

    let device: string | undefined;
    const devices = await camera.listDevices();
    if (devices.length === 0) {
        throw new Error('Cannot find any webcams');
    }

    const storedCamera = await cf.getCamera();
    if (storedCamera && devices.find(d => d === storedCamera)) {
        device = storedCamera;
    }
    else if (devices.length === 1) {
        device = devices[0];
    }
    else {
        let inqRes = await inquirer.prompt([{
            type: 'list',
            choices: (devices || []).map(p => ({ name: p, value: p })),
            name: 'camera',
            message: 'Select a camera',
            pageSize: 20
        }]);
        device = <string>inqRes.camera;
    }
    await cf.storeCamera(device);

    console.log(RUNNER_PREFIX, 'Using camera', device, 'starting...');

    await camera.start({
        device: device,
        intervalMs: 100,
    });

    camera.on('error', error => {
        if (isExiting) return;

        console.log(RUNNER_PREFIX, 'camera error', error);
        process.exit(1);
    });

    console.log(RUNNER_PREFIX, 'Connected to camera');

    return camera;
}

function buildWavFileBuffer(data: Buffer, intervalMs: number) {
    // let's build a WAV file!
    let wavFreq = 1 / intervalMs * 1000;
    let fileSize = 44 + (data.length);
    let dataSize = (data.length);
    let srBpsC8 = (wavFreq * 16 * 1) / 8;

    let headerArr = new Uint8Array(44);
    let h = [
        0x52, 0x49, 0x46, 0x46, // RIFF
        // tslint:disable-next-line: no-bitwise
        fileSize & 0xff, (fileSize >> 8) & 0xff, (fileSize >> 16) & 0xff, (fileSize >> 24) & 0xff,
        0x57, 0x41, 0x56, 0x45, // WAVE
        0x66, 0x6d, 0x74, 0x20, // fmt
        0x10, 0x00, 0x00, 0x00, // length of format data
        0x01, 0x00, // type of format (1=PCM)
        0x01, 0x00, // number of channels
        // tslint:disable-next-line: no-bitwise
        wavFreq & 0xff, (wavFreq >> 8) & 0xff, (wavFreq >> 16) & 0xff, (wavFreq >> 24) & 0xff,
        // tslint:disable-next-line: no-bitwise
        srBpsC8 & 0xff, (srBpsC8 >> 8) & 0xff, (srBpsC8 >> 16) & 0xff, (srBpsC8 >> 24) & 0xff,
        0x02, 0x00, 0x10, 0x00,
        0x64, 0x61, 0x74, 0x61, // data
        // tslint:disable-next-line: no-bitwise
        dataSize & 0xff, (dataSize >> 8) & 0xff, (dataSize >> 16) & 0xff, (dataSize >> 24) & 0xff,
    ];
    for (let hx = 0; hx < 44; hx++) {
        headerArr[hx] = h[hx];
    }

    return Buffer.concat([ Buffer.from(headerArr), data ]);
}

function checkFileExists(file: string) {
    return new Promise(resolve => {
        return fs.promises.access(file, fs.constants.F_OK)
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
}

function startWebServer(model: ModelInformation, camera: ICamera, imgClassifier: ImageClassifier) {
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
                width: model.modelParameters.image_input_width
            });
        }
        else {
            img = sharp(data).resize({
                height: model.modelParameters.image_input_height,
                width: model.modelParameters.image_input_width
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
            projectName: model.project.owner + ' / ' + model.project.name
        });
    });

    return new Promise<number>((resolve) => {
        server.listen(Number(process.env.PORT) || 4912, process.env.HOST || '0.0.0.0', async () => {
            resolve((Number(process.env.PORT) || 4912));
        });
    });
}

function startApiServer(model: ModelInformation, runner: LinuxImpulseRunner, projectStudioUrl: string, port: number) {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json());
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
        res.end(JSON.stringify(response, null, 4) + '\n');
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

            resized = (await ImageClassifier.resizeImage(model, file.buffer, 'contain'));
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
        res.end(JSON.stringify(response, null, 4) + '\n');
    }));

    app.use(express.static(Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public')));

    return new Promise<void>((resolve) => {
        server.listen(port, process.env.HOST || '0.0.0.0', async () => {
            resolve();
        });
    });
}
