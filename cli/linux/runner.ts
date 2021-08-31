#!/usr/bin/env node

import Path from 'path';
import { LinuxImpulseRunner, ModelInformation } from '../../library/classifier/linux-impulse-runner';
import { AudioClassifier } from '../../library/classifier/audio-classifier';
import { ImageClassifier } from '../../library/classifier/image-classifier';
import { Imagesnap } from '../../library/sensors/imagesnap';
import inquirer from 'inquirer';
import { Config } from '../config';
import { initCliApp, setupCliApp } from '../init-cli-app';
import fs from 'fs';
import os from 'os';
import { RunnerDownloader } from './runner-downloader';
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
    .option('--model-file <file>', 'Specify model file, if not provided the model will be fetched from Edge Impulse')
    .option('--api-key <key>', 'API key to authenticate with Edge Impulse (overrides current credentials)')
    .option('--download <file>', 'Just download the model and store it on the file system')
    .option('--force-target <target>', 'Do not autodetect the target system, but set it by hand')
    .option('--clean', 'Clear credentials')
    .option('--silent', `Run in silent mode, don't prompt for credentials`)
    .option('--quantized', 'Download int8 quantized neural networks, rather than the float32 neural networks. ' +
        'These might run faster on some architectures, but have reduced accuracy.')
    .option('--enable-camera', 'Always enable the camera. This flag needs to be used to get data from the microphone ' +
        'on some USB webcams.')
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

const onSignal = async () => {
    if (!firstExit) {
        process.exit(1);
    }
    else {
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

function getModelPath(projectId: number, version: number) {
    return Path.join(os.homedir(), '.ei-linux-runner', 'models', projectId + '',
        'v' + version + (quantizedArgv ? '-quantized' : ''), 'model.eim');
}

// tslint:disable-next-line: no-floating-promises
(async () => {
    try {
        let modelFile;

        // no model file passed in? then build / download the latest deployment...
        if (!modelFileArgv) {
            const init = await initCliApp(cliOptions);
            const config = init.config;
            configFactory = init.configFactory;

            const { projectId, devKeys } = await setupCliApp(configFactory, config, cliOptions, undefined);

            await configFactory.setLinuxProjectId(projectId);

            const downloader = new RunnerDownloader(projectId, quantizedArgv ? 'int8' : 'float32',
                config, forceTargetArgv);
            downloader.on('build-progress', msg => {
                console.log(BUILD_PREFIX, msg);
            });

            // no new version? and already downloaded? return that model
            let currVersion = await downloader.getLastDeploymentVersion();
            if (currVersion && await checkFileExists(getModelPath(projectId, currVersion))) {
                modelFile = getModelPath(projectId, currVersion);
                console.log(RUNNER_PREFIX, 'Already have model', modelFile, 'not downloading...');
            }
            else {
                console.log(RUNNER_PREFIX, 'Downloading model...');

                let deployment = await downloader.downloadDeployment();
                let tmpDir = await fs.promises.mkdtemp(Path.join(os.tmpdir(), 'ei-' + Date.now()));
                tmpDir = Path.join(os.tmpdir(), tmpDir);
                await fs.promises.mkdir(tmpDir, { recursive: true });
                modelFile = Path.join(tmpDir, await downloader.getDownloadType());
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
        if (!modelFileArgv) {
            let file = getModelPath(model.project.id, model.project.deploy_version);
            if (file !== modelFile) {
                await fs.promises.mkdir(Path.dirname(file), { recursive: true });
                await fs.promises.rename(modelFile, file);
                console.log(RUNNER_PREFIX, 'Stored model version in', file);
            }
        }

        let param = model.modelParameters;

        if (param.sensorType === 'microphone') {
            console.log(RUNNER_PREFIX, 'Starting the audio classifier for',
                model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
            console.log(RUNNER_PREFIX, 'Parameters', 'freq', param.frequency + 'Hz',
                'window length', ((param.input_features_count / param.frequency) * 1000) + 'ms.',
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

            await audioClassifier.start(audioDevice, 250);

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
            });
        }
        else if (param.sensorType === 'camera') {
            console.log(RUNNER_PREFIX, 'Starting the image classifier for',
                model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
            console.log(RUNNER_PREFIX, 'Parameters',
                'image size', param.image_input_width + 'x' + param.image_input_height + ' px (' +
                    param.image_channel_count + ' channels)',
                'classes', param.labels);

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
                else if (ev.result.bounding_boxes) {
                    console.log('boundingBoxes', timeMs + 'ms.', JSON.stringify(ev.result.bounding_boxes));
                }
            });
        }
        else {
            throw new Error('Invalid sensorType: ' + param.sensorType);
        }
    }
    catch (ex) {
        console.warn(RUNNER_PREFIX, 'Failed to run impulse', ex);
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
        camera = new Imagesnap();
    }
    else if (process.platform === 'linux') {
        camera = new GStreamer(verboseArgv);
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
        console.log(RUNNER_PREFIX, 'camera error', error);
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
            result: result.result,
            timeMs: timeMs,
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
