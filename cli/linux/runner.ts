#!/usr/bin/env node

import fs from 'node:fs';
import Path from 'node:path';
import { LinuxImpulseRunner, ModelInformation } from '../../library/classifier/linux-impulse-runner';
import { AudioClassifier } from '../../library/classifier/audio-classifier';
import { ImageClassifier } from '../../library/classifier/image-classifier';
import inquirer from 'inquirer';
import { initCliApp, setupCliApp } from "../../cli-common/init-cli-app";
import { RunnerDownloader, RunnerModelPath, downloadModel } from './runner-downloader';
import program from 'commander';
import { ips } from '../../cli-common/get-ips';
import { RemoteMgmt } from '../../cli-common/remote-mgmt-service';
import WebSocket from 'ws';
import { Config, EdgeImpulseConfig } from "../../cli-common/config";
import { LinuxDevice } from './linux-device';
import { ModelMonitor } from '../../cli-common/model-monitor';
import {
    listTargets,
    audioClassifierHelloMsg,
    imageClassifierHelloMsg,
    startApiServer,
    startWebServer,
    printThresholds
} from './runner-utils';
import { initCamera, CameraType, initMicrophone } from '../../library/sensors/sensors-helper';
import { AWSSecretsManagerUtils } from "../../cli-common/aws-sm-utils";
import { AWSIoTCoreConnector, Payload, AwsResult, AwsResultKey } from "../../cli-common/aws-iotcore-connector";
import { v4 as uuidv4 } from 'uuid';
import * as models from '../../sdk/studio/sdk/model/models';

const RUNNER_PREFIX = '\x1b[33m[RUN]\x1b[0m';

let audioClassifier: AudioClassifier | undefined;
let imageClassifier: ImageClassifier | undefined;
let configFactory: Config | undefined;

type ImagePayload = {
    image?: string;
};
type AWSPayload = Payload & ImagePayload;

// total inference count
let totalInferenceCount = 0;

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
    .option('--force-variant <variant>', 'Do not autodetect the model variant, but set it by hand (e.g. "int8")')
    .option('--impulse-id <impulseId>', 'Select the impulse ID (if you have multiple impulses)')
    .option('--run-http-server <port>', 'Do not run using a sensor, but instead expose an API server at the specified port')
    .option('--monitor', 'Enable model monitoring', false)
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
    .option('--greengrass', 'Enable AWS IoT greengrass integration mode')
    .option('--dont-print-predictions', 'If set, suppresses the printing of predictions')
    .option('--thresholds <values>', 'Override model thresholds. E.g. --thresholds 4.min_anomaly_score=35 overrides the min. anomaly score for block ID 4 to 35.' +
        'The current thresholds are printed on startup.')
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
const greengrassArgv: boolean = !!program.greengrass;
const modelFileArgv = <string | undefined>program.modelFile;
const downloadArgv = <string | undefined>program.download;
const forceTargetArgv = <string | undefined>program.forceTarget;
const forceEngineArgv = <string | undefined>program.forceEngine;
const forceVariantArgv = <models.KerasModelVariantEnum | undefined>program.forceVariant;
const impulseIdArgvStr = <string | undefined>program.impulseId;
const impulseIdArgv = impulseIdArgvStr && !isNaN(Number(impulseIdArgvStr)) ? Number(impulseIdArgvStr) : undefined;
const monitorArgv: boolean = !!program.monitor;
const listTargetsArgv: boolean = !!program.listTargets;
const gstLaunchArgsArgv = <string | undefined>program.gstLaunchArgs;
const runHttpServerPort = program.runHttpServer ? Number(program.runHttpServer) : undefined;
const enableVideo = (process.env.PROPHESEE_CAM === '1') || (process.env.ENABLE_VIDEO === '1');
const dontPrintPredictionsArgv: boolean = !!program.dontPrintPredictions;
const thresholdsArgv = <string | undefined>program.thresholds;

process.on('warning', e => console.warn(e.stack));

const cliOptions = {
    appName: 'Edge Impulse Linux runner',
    apiKeyArgv: apiKeyArgv,
    greengrassArgv: greengrassArgv,
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

async function startCamera(cameraType: CameraType) {
    if (!configFactory) {
        throw new Error('No config factory');
    }
    let cameraDevicedName = await configFactory.getCamera();
    let camera = await initCamera(cameraType, cameraDevicedName, undefined, gstLaunchArgsArgv, verboseArgv);
    camera.on('error', error => {
        if (isExiting) return;
        console.log(RUNNER_PREFIX, 'camera error', error);
        // AWS shutdown sematic check
        if (greengrassArgv) {
            // in greengrass context
            const shutdownBehavior = (<string>process.env.EI_SHUTDOWN_BEHAVIOR);
            if (shutdownBehavior !== undefined && shutdownBehavior === "wait_on_restart") {
                // wait for the shutdown command... it will close runner down
                console.log(RUNNER_PREFIX, "Waiting for restart command via IoTCore...");
            }
            else {
                // just default...
                console.log(RUNNER_PREFIX, "In greengrass context using default shutdown behavior...");
                process.exit(1);
            }
        }
        else {
            process.exit(1);
        }
    });
    let opts = camera.getLastOptions();
    if (!opts) {
        throw new Error('Could not get selected camera details');
    }
    console.log(RUNNER_PREFIX, 'Connected to camera ' + opts.device);
    await configFactory.storeCamera(opts.device);

    return camera;
}

(async () => {
    try {
        let modelFile;
        let remoteMgmt: RemoteMgmt | undefined;
        let modelPath: RunnerModelPath | undefined;
        let projectStudioUrl: string | undefined;
        let config: EdgeImpulseConfig | undefined;
        // projectId keeps the Studio project ID, not the EIM/model project ID
        // currently they can differ, as user can use EIM form the other project than the projct
        // the user selected during the login
        let projectId: number | undefined;
        let devKeys: { apiKey: string, hmacKey: string };
        let modelMonitor: ModelMonitor | undefined;
        let runner: LinuxImpulseRunner;
        let model: ModelInformation;
        const cameraType =
            process.env.PROPHESEE_CAM === '1' ? CameraType.PropheseeCamera :
            process.platform === 'darwin' ? CameraType.ImagesnapCamera :
            process.platform === 'linux' ? CameraType.GStreamerCamera :
                CameraType.UnknownCamera;

        // AWS Support
        let awsSM: AWSSecretsManagerUtils | undefined;
        let awsIOT: AWSIoTCoreConnector | undefined;

        // make sanity checks on the arguments
        if (listTargetsArgv && modelFileArgv) {
            // TODO: why? List targets and display the warning...
            throw new Error('Cannot combine --list-targets and --model-file');
        }

        if (modelFileArgv && downloadArgv) {
            throw new Error('Cannot combine --model-file and --download');
        }

        if (forceVariantArgv && quantizedArgv) {
            throw new Error('Cannot combine --force-variant and --quantized');
        }

        if (forceVariantArgv && models.KerasModelVariantEnumValues.indexOf(forceVariantArgv) === -1) {
            throw new Error(`Invalid value for --force-variant ` +
                `(was: "${forceVariantArgv}", ` +
                `valid: ${JSON.stringify(models.KerasModelVariantEnumValues)})`);
        }

        // any of this arguments implies online mode, so we need to login to the studio or get the API key
        const connectionRequired: boolean =
            monitorArgv ||
            modelFileArgv === undefined ||
            downloadArgv !== undefined ||
            listTargetsArgv ||
            devArgv;

        if (connectionRequired) {
            if (monitorArgv && modelFileArgv) {
                cliOptions.connectProjectMsg = 'From which project do you want to monitor the model?';
            }
            // initCliApp calls verifyLogin which logs in the user
            const init = await initCliApp(cliOptions);
            config = init.config;
            configFactory = init.configFactory;

            // AWS Support
            awsSM = init.awsSM;
            awsIOT = init.awsIOT;

            // TODO: setuCliApp tries to get projectId from UploaderProjectId form config,
            // if failed then it tries getLinuxProjectId (see getProjectFromConfig in cliOptions)
            // if that failed too, it lists projects and asks user to select one
            ({ projectId, devKeys } = await setupCliApp(configFactory, config, cliOptions, undefined));

            // store project id in case user just selected one
            await configFactory.setLinuxProjectId(projectId);
        }
        else {
            // If no connection needed... still look for --greengrass and connect to IoTCore if present and able...
            if (greengrassArgv) {
                // FUDGE
                let opts = {
                    appName: cliOptions.appName,
                    silentArgv: silentArgv,
                    cleanArgv: false,
                    apiKeyArgv: "",
                    greengrassArgv: true,
                    devArgv: false,
                    hmacKeyArgv: "",
                    connectProjectMsg: ""
                };

                // make sure we dont already have a connection
                if (awsIOT === undefined) {
                    awsIOT = new AWSIoTCoreConnector(opts);
                    if (awsIOT !== undefined) {
                        if (!silentArgv) {
                            console.log(opts.appName + ": Connecting to IoTCore...");
                        }
                        const connected = await awsIOT.connect();
                        if (!silentArgv) {
                            if (connected) {
                                // success
                                console.log(opts.appName + ": Connected to IoTCore Successfully!");

                                console.log(opts.appName + ": launching async tasks...");
                                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                awsIOT.launchAsyncTasks();
                            }
                            else {
                                // failure
                                console.log(opts.appName + ": FAILED to connect to IoTCore");
                            }
                        }
                    }
                }
            }

            // TODO: cleanArgv is not used in this case
            configFactory = new Config();
            devKeys = {
                apiKey: apiKeyArgv ?? '',
                hmacKey: ''
            };
        }

        if (listTargetsArgv) {
            if (!projectId) {
                // this should never happen, as we are in online mode
                projectId = await configFactory.getLinuxProjectId() || -1;
            }

            // make sure the config is set
            if (!config) {
                // this should never happen, as we are in online mode
                throw new Error('No config found');
            }

            await listTargets(projectId, config.api);
            console.log('');
            console.log('You can force a target via ' +
                '"edge-impulse-linux-runner --force-target <target> [--force-engine <engine>] [--force-variant <variant>]"');
            process.exit(0);
        }

        let initializedProjectState: {
            impulseId: number,
            variant: models.KerasModelVariantEnum,
            deploymentType: string,
        } | undefined;

        if (modelFileArgv) {
            // if we have the model file, just use that and make it executable
            modelFile = modelFileArgv;
            await fs.promises.chmod(modelFile, 0o755);

            initializedProjectState = undefined;
        }
        else {
            // projectId should exist in config or be requested from Studio,
            // no -1 value or undefined at this stage
            if (!projectId) {
                // this should never happen, as we are in online mode
                projectId = await configFactory.getLinuxProjectId() || -1;
            }

            // make sure the config is set
            if (!config) {
                // this should never happen, as we are in online mode
                throw new Error('No config found');
            }

            let impulseId: number;
            if (impulseIdArgv) {
                impulseId = impulseIdArgv;
            }
            else {
                const impulses = (await config.api.impulse.getAllImpulses(projectId)).impulses;
                if (impulses.length === 1) {
                    // use the first impulse
                    impulseId = impulses[0].id;
                }
                else {
                    const selectedImpulseId = await configFactory.getRunnerImpulseIdForProjectId(projectId);
                    const selectedImpulse = impulses.find(x => x.id === selectedImpulseId);
                    if (selectedImpulse) {
                        impulseId = selectedImpulse.id;
                    }
                    else {
                        let inqRes = await inquirer.prompt([{
                            type: 'list',
                            choices: impulses.map(p => ({ name: p.name, value: p.id })),
                            name: 'impulseId',
                            message: 'Which impulse do you want to run?',
                            pageSize: 20
                        }]);
                        impulseId = Number(inqRes.impulseId);
                        await configFactory.setRunnerImpulseIdForProjectId(projectId, impulseId);
                    }
                }
            }

            const deploymentType = await RunnerDownloader.getDeploymentType(forceTargetArgv);
            const deployment = (await config.api.deployment.listDeploymentTargetsForProjectDataSources(projectId, {
                impulseId: impulseId,
            })).targets.find(x => x.format === deploymentType);
            if (!deployment) {
                if (forceTargetArgv) {
                    throw new Error(`Failed to find deployment target "${deploymentType}" (via --force-target). ` +
                        `Run 'edge-impulse-linux-runner --list-targets' to see all valid targets.`);
                }
                throw new Error(`Failed to find deployment target "${deploymentType}" (auto-detected). ` +
                    `Run 'edge-impulse-linux-runner --list-targets' to see all valid targets, and run with --force-target <target> ` +
                    `to force another target.`);
            }

            let variant: models.KerasModelVariantEnum;
            if (forceVariantArgv) {
                variant = forceVariantArgv;

                let variantInfo = deployment.modelVariants.find(x => x.variant === variant);
                if (!variantInfo || !variantInfo.supported) {
                    let err: string;
                    if (variantInfo?.hint) {
                        err = `Variant "${variant}" (via --force-variant) is not supported on "${deploymentType}": ${variantInfo.hint}.`;
                    }
                    else {
                        err = `Variant "${variant}" (via --force-variant) is not supported on "${deploymentType}".`;
                    }

                    throw new Error(`${err} ` +
                        `Run 'edge-impulse-linux-runner --list-targets' to see all valid targets`);
                }
            }
            else if (quantizedArgv) {
                variant = 'int8';

                let variantInfo = deployment.modelVariants.find(x => x.variant === variant);
                if (!variantInfo || !variantInfo.supported) {
                    let err: string;
                    if (variantInfo?.hint) {
                        err = `Quantized model (via --quantized) is not supported on "${deploymentType}": ${variantInfo.hint}.`;
                    }
                    else {
                        err = `Quantized model (via --quantized) is not supported on "${deploymentType}".`;
                    }

                    throw new Error(`${err} ` +
                        `Run 'edge-impulse-linux-runner --list-targets' to see all valid targets`);
                }
            }
            else {
                // these are the variants we have
                const modelVariantsRes = await config.api.projects.getModelVariants(projectId, {
                    impulseId: impulseId,
                });
                const availableKerasModelVariants =
                    modelVariantsRes.modelVariants.map(v => v.variant)
                        .filter(v => models.KerasModelVariantEnumValues.includes(v));

                // now cross-check this against the ones we have in the deployment
                let unsupported: string[] = [];
                let choices: { name: string, value: string }[] = [];

                for (let v of availableKerasModelVariants) {
                    let variantInfo = deployment.modelVariants.find(x => x.variant === v);
                    if (!variantInfo || !variantInfo.supported) {
                        // not supported
                        unsupported.push(`${getFriendlyModelTypeName(v)} (${variantInfo?.hint || 'Model type is not supported on this target'})`);
                        continue;
                    }
                    choices.push({
                        name: getFriendlyModelTypeName(v) +
                            (variantInfo.hint ? ` (${variantInfo.hint})` : ``),
                        value: v,
                    });
                }

                if (choices.length === 0) {
                    console.log('');
                    console.log(`No available model variants can be deployed on "${deploymentType}":`);
                    for (let u of unsupported) {
                        console.log(`    ${u}`);
                    }
                    console.log('');
                    process.exit(1);
                }

                const selectedVariantInConfig = await configFactory.getRunnerModelVariantForProjectId(projectId);
                if (selectedVariantInConfig && choices.find(c => c.value === selectedVariantInConfig)) {
                    variant = selectedVariantInConfig;
                }
                else {
                    if (choices.length > 1 || unsupported.length > 0) {
                        if (unsupported.length > 0) {
                            console.log('');
                            console.log(`Some model variants are disabled for "${deploymentType}":`);
                            for (let u of unsupported) {
                                console.log(`    ${u}`);
                            }
                            console.log('');
                        }

                        let inqRes = await inquirer.prompt([{
                            type: 'list',
                            choices: choices,
                            name: 'variant',
                            message: 'What model variant do you want to run?',
                            pageSize: 20
                        }]);
                        variant = <models.KerasModelVariantEnum>inqRes.variant;
                        await configFactory.setRunnerModelVariantForProjectId(projectId, variant);
                    }
                    else {
                        variant = <models.KerasModelVariantEnum>choices[0].value;
                    }
                }
            }

            // if we don't have the model file, download it
            ({ modelFile, modelPath } = await downloadModel({
                projectId: projectId,
                impulseId: impulseId,
                api: config.api,
                deploymentType: deploymentType,
                variant: variant,
                forcedEngine: forceEngineArgv,
            }));
            if (downloadArgv) {
                await fs.promises.mkdir(Path.dirname(downloadArgv), { recursive: true });
                await fs.promises.copyFile(modelFile, downloadArgv);
                console.log(RUNNER_PREFIX, 'Stored model in', Path.resolve(downloadArgv));
                process.exit(0);
            }

            initializedProjectState = {
                impulseId: impulseId,
                deploymentType: deploymentType,
                variant: variant,
            };
        }

        // create the runner and init (get info from model file)
        runner = new LinuxImpulseRunner(modelFile);
        model = await runner.init();
        await setThresholdsFromArgv(runner, model);

        if (greengrassArgv && awsIOT?.isConnected() === true) {
            awsIOT.initModelInfo(model.project.name, "v" + model.project.deploy_version, model.modelParameters);
        }

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

        let param = model.modelParameters;
        if (monitorArgv) {
            // make sure the config is set
            if (!config) {
                // this should never happen, as we are in online mode
                throw new Error('No config found');
            }
            let device = new LinuxDevice(config, devKeys, param.sensorType === 'microphone', enableVideo, verboseArgv);
            modelMonitor = await ModelMonitor.getModelMonitor(configFactory, model);
            let storageStatus = await modelMonitor?.getStorageStatus();

            if (!projectId) {
                throw new Error('No project ID found');
            }

            remoteMgmt = new RemoteMgmt(projectId,
                devKeys,
                Object.assign({
                    command: <'edge-impulse-linux'>'edge-impulse-linux'
                }, config),
                device,
                modelMonitor,
                url => new WebSocket(url),
                async (currName) => {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    let nameDevice = <{ nameDevice: string }>await inquirer.prompt([{
                        type: 'input',
                        message: 'What name do you want to give this device?',
                        name: 'nameDevice',
                        default: currName
                    }]);
                    return nameDevice.nameDevice;
                });
            await remoteMgmt.connect(true, {
                projectId: model.project.id,
                projectName: model.project.name,
                projectOwner: model.project.owner,
                deploymentVersion: model.project.deploy_version,
                modelType: model.modelParameters.model_type,
            });

            // wait 30 sec for the connection to be established (WS connection + setting device name by user)
            let isConnected = false;
            let timeout = 0;
            while (!isConnected && timeout < 30) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                isConnected = remoteMgmt.isConnected;
                timeout++;
            }

            modelMonitor.on('inference-summary', remoteMgmt?.inferenceSummaryListener.bind(remoteMgmt));
            modelMonitor.on('impulse-record', remoteMgmt?.impulseRecordListener.bind(remoteMgmt));
            modelMonitor.on('impulse-records-response', remoteMgmt?.impulseRecordsResponseListener.bind(remoteMgmt));
        }

        remoteMgmt?.on('newModelAvailable', async ( ) => {
            if (!initializedProjectState) return;

            console.log(RUNNER_PREFIX, 'New model available, downloading...');
            try {
                if (!projectId) {
                    throw new Error('projectId is null');
                }
                if (!config) {
                    // this should never happen, as we are in online mode
                    throw new Error('No config found');
                }
                if (!configFactory) {
                    // this should never happen, as we are in online mode
                    throw new Error('configFactory is null');
                }

                let impulseId: number;
                if (impulseIdArgv) {
                    impulseId = impulseIdArgv;
                }
                else {
                    const impulses = (await config.api.impulse.getAllImpulses(projectId)).impulses;
                    if (impulses.length === 1) {
                        // use the first impulse
                        impulseId = impulses[0].id;
                    }
                    else {
                        const selectedImpulseId = await configFactory.getRunnerImpulseIdForProjectId(projectId);
                        const selectedImpulse = impulses.find(x => x.id === selectedImpulseId);
                        if (selectedImpulse) {
                            impulseId = selectedImpulse.id;
                        }
                        else {
                            // don't prompt here, just take the first
                            impulseId = impulses[0].id;
                        }
                    }
                }

                ({ modelFile, modelPath } = await downloadModel({
                    projectId: projectId,
                    impulseId: impulseId,
                    api: config.api,
                    deploymentType: initializedProjectState.deploymentType,
                    variant: initializedProjectState.variant,
                    forcedEngine: forceEngineArgv
                }));

                // pause features streaming
                imageClassifier?.pause();
                audioClassifier?.pause();

                // load the new model
                model = await runner.init(modelFile);
                await setThresholdsFromArgv(runner, model);

                console.log(RUNNER_PREFIX, 'Model updated successfully');
                // resume (refresh the model info internally as well)
                if (model.modelParameters.sensorType === 'microphone') {
                    audioClassifierHelloMsg(model);
                    audioClassifier?.resume();
                    await remoteMgmt?.sendModelUpdateStatus(model, true);
                }
                else if (model.modelParameters.sensorType === 'camera') {
                    imageClassifierHelloMsg(model);
                    imageClassifier?.resume();
                    await remoteMgmt?.sendModelUpdateStatus(model, true);
                }
            }
            catch (ex) {
                let exErr = <Error>ex;
                await remoteMgmt?.sendModelUpdateStatus(model, false);
                throw Error('Model update failed: ' + exErr.message);
            }
        });

        if (runHttpServerPort) {
            console.log(RUNNER_PREFIX, 'Starting HTTP server for',
                model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')',
                'on port ' + runHttpServerPort);
            if (param.sensorType === 'camera') {
                console.log(RUNNER_PREFIX, 'Parameters',
                    'image size', param.image_input_width + 'x' + param.image_input_height + ' px (' +
                        param.image_channel_count + ' channels)',
                    'classes', param.labels);
                printThresholds(model);
            }
            else {
                console.log(RUNNER_PREFIX, 'Parameters', 'freq', param.frequency + 'Hz',
                    'window length', ((param.input_features_count / param.frequency / param.axis_count) * 1000) + 'ms.',
                    'classes', param.labels);
                printThresholds(model);
            }

            if (!projectStudioUrl) {
                projectStudioUrl = 'https://studio.edgeimpulse.com/studio/' + model.project.id;
            }

            await startApiServer(model, runner, projectStudioUrl, runHttpServerPort);

            console.log(RUNNER_PREFIX, '');
            console.log(RUNNER_PREFIX, `HTTP Server now running at http://${(ips.length > 0 ? ips[0].address : 'localhost')}:${runHttpServerPort}`);
            console.log(RUNNER_PREFIX, '');

            return;
        }

        if (param.sensorType === 'microphone') {
            audioClassifierHelloMsg(model);

            if (enableCameraArgv) {
                await startCamera(cameraType);
            }

            let audioDeviceName = await configFactory.getAudio();
            try {
                audioDeviceName = await initMicrophone(audioDeviceName);
            }
            catch (ex) {
                console.warn(RUNNER_PREFIX, 'Could not find any microphones');
                audioDeviceName = '';
            }
            await configFactory.storeAudio(audioDeviceName);

            console.log(RUNNER_PREFIX, 'Using microphone ' + audioDeviceName);

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

            await audioClassifier.start(audioDeviceName);

            audioClassifier.on('result', async (ev, timeMs, audioAsPcm) => {
                let count = 0;

                if (!ev.result.classification) return;

                if (modelMonitor) {
                    await modelMonitor.processResult(ev, {
                        type: 'wav',
                        buffer: audioAsPcm,
                    });
                }

                // print the raw predicted values for this frame
                // (turn into string here so the content does not jump around)
                let c = <{ [k: string]: string | number }>(<any>ev.result.classification);
                for (let k of Object.keys(c)) {
                    c[k] = (<number>c[k]).toFixed(4);
                }

                if (Array.isArray(c)) {
                    count = c.length;
                }

                // total inferences update...
                totalInferenceCount += count;

                if (!dontPrintPredictionsArgv) {
                    console.log('classifyRes', timeMs + 'ms.', c);
                }

                // AWS Integration - send to IoTCore if running in Greengrass
                if (awsIOT?.isConnected()) {
                    // create our confidences array
                    // eslint-disable-next-line @typescript-eslint/dot-notation
                    const confidences = [ <number>c["value"] ];

                    // update the confidence metrics
                    awsIOT.updateInferenceMetrics(confidences);

                    // create the payload
                    const payload = { time_ms: timeMs, c: c, info:ev.info, inference_count: count,
                        total_inferences: totalInferenceCount, id: uuidv4(), ts: Date.now()};
                    awsIOT.sendInference(confidences[0], payload, "c");
                }

                if (ev.info) {
                    console.log('additionalInfo:', ev.info);
                }
            });
        }
        else if (param.sensorType === 'camera') {
            imageClassifierHelloMsg(model);
            let camera = await startCamera(cameraType);

            imageClassifier = new ImageClassifier(runner, camera);

            await imageClassifier.start();

            let webserverPort = await startWebServer(model, camera, imageClassifier);
            console.log('');
            console.log('Want to see a feed of the camera and live classification in your browser? ' +
                'Go to http://' + (ips.length > 0 ? ips[0].address : 'localhost') + ':' + webserverPort);
            console.log('');

            imageClassifier.on('result', async (ev, timeMs, imgAsJpg) => {
                // AWS Integration
                let awsResult: AwsResult | undefined;
                let awsResultKey: AwsResultKey | undefined;
                let count = 0;

                if (ev.result.classification) {
                    // print the raw predicted values for this frame
                    // (turn into string here so the content does not jump around)
                    let c = <{ [k: string]: string | number }>(<any>ev.result.classification);
                    for (let k of Object.keys(c)) {
                        c[k] = (<number>c[k]).toFixed(4);
                    }
                    if (!dontPrintPredictionsArgv) {
                        console.log('classifyRes', timeMs + 'ms.', c);
                    }

                    // AWS Integration
                    awsResult = c;
                    awsResultKey = "c";
                    ++count;
                }

                // object_tracking also always prints bounding_boxes
                if (ev.result.object_tracking) {
                    if (!dontPrintPredictionsArgv) {
                        console.log('objectTracking', timeMs + 'ms.', JSON.stringify(ev.result.object_tracking));
                    }

                    // AWS cannot handle object tracking yet, so fall back to bounding boxes
                    awsResult = ev.result.bounding_boxes;
                    awsResultKey = "box";
                    ++count;
                }
                else if (ev.result.bounding_boxes) {
                    if (!dontPrintPredictionsArgv) {
                        console.log('boundingBoxes', timeMs + 'ms.', JSON.stringify(ev.result.bounding_boxes));
                    }

                    // AWS Integration
                    awsResult = ev.result.bounding_boxes;
                    awsResultKey = "box";
                    ++count;
                }

                if (ev.result.visual_anomaly_grid) {
                    if (!dontPrintPredictionsArgv) {
                        console.log('visual anomalies', timeMs + 'ms.', JSON.stringify(ev.result.visual_anomaly_grid));
                    }

                    // AWS Integration
                    awsResult = ev.result.visual_anomaly_grid;
                    awsResultKey = "grid";
                    ++count;
                }

                if (Array.isArray(awsResult)) {
                    count = awsResult.length;
                }

                // total inferences update...
                totalInferenceCount += count;

                if (modelMonitor) {
                    await modelMonitor.processResult(ev, {
                        type: 'jpg',
                        buffer: imgAsJpg,
                    });
                }

                // AWS Integration - send to IoTCore if running in Greengrass...
                if (awsIOT?.isConnected() === true &&
                    awsResult !== undefined && awsResultKey !== undefined) {
                    // create our confidences array
                    const confidences: Array<number> = new Array(count);
                    let aveConfidence = 0;
                    for(let i = 0; i < count; ++i) {
                        confidences[i] = (<Array<any>>awsResult)[i].value;

                        // update the average
                        if (aveConfidence === 0) {
                            aveConfidence = confidences[i];
                        }
                        else {
                            aveConfidence = (aveConfidence + confidences[i]) / 2;
                        }
                    }

                    // update the confidence metrics
                    awsIOT.updateInferenceMetrics(confidences);

                    // create a timestamp
                    let infTimestamp = Date.now();

                    // check if we enable sending the image via IoTCore
                    const includeBase64Image = (<string>process.env.EI_INCLUDE_BASE64_IMAGE);
                    const payload: AWSPayload = {
                        time_ms: timeMs,
                        info: ev.info,
                        inference_count: count,
                        total_inferences: totalInferenceCount,
                        id: uuidv4(),
                        ts: infTimestamp
                    };

                    if (includeBase64Image === "yes" && imgAsJpg) {
                        payload.image = imgAsJpg.toString('base64');
                    }

                    payload[awsResultKey] = awsResult;

                    // Send to IoTCore and note the inference key in the payload...
                    awsIOT.sendInference(aveConfidence, payload, awsResultKey, imgAsJpg);
                }

                if (ev.info && !dontPrintPredictionsArgv) {
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
        else if (verboseArgv) {
            console.log(ex);
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

function getFriendlyModelTypeName(modelType: models.KerasModelVariantEnum) {
    switch (modelType) {
        case 'int8':
            return 'Quantized (int8)';
        case 'float32':
            return 'Unoptimized (float32)';
        case 'akida':
            return 'Quantized (akida)';
    }
    return (<string>modelType).toString();
}

async function setThresholdsFromArgv(runner: LinuxImpulseRunner, model: ModelInformation) {
    if (!thresholdsArgv) return;

    for (let opt of thresholdsArgv.split(',')) {
        // ${threshold.id}.${k}=${threshold[k]}
        let matches = opt.match(/^(\d+)\.([\w-_]+)=([\d\.]+)$/);
        if (!matches) {
            console.log(RUNNER_PREFIX, `Failed to parse threshold "${opt}" (via --thresholds)`);
            continue;
        }

        let id = Number(matches[1]);
        let key = matches[2];
        let valueStr = matches[3];
        let value: number | boolean;
        if (valueStr === 'true' || valueStr === 'false') {
            value = valueStr === 'true';
        }
        else {
            value = Number(matches[3]);
        }

        let thresholdObj = (model.modelParameters.thresholds || []).find(x => x.id === id);
        if (thresholdObj) {
            let obj: { [k: string]: string | number | boolean } = {
                id: id,
            };
            obj.type = thresholdObj.type;
            obj[key] = value;

            await runner.setLearnBlockThreshold(<any>obj);

            (<any>thresholdObj)[key] = value;
        }
        else {
            console.log(RUNNER_PREFIX, `Invalid threshold "${opt}", could not find block with ID ${id} ` +
                `(found ${JSON.stringify((model.modelParameters.thresholds || []).map(x => x.id))})`);
        }
    }
}
