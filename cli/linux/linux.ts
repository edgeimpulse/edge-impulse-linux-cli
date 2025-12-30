#!/usr/bin/env node

import inquirer from 'inquirer';
import { initCliApp, setupCliApp } from "../../cli-common/init-cli-app";
import { RemoteMgmt } from "../../cli-common/remote-mgmt-service";
import { Config } from "../../cli-common/config";
import { ICamera } from "../../library/sensors/icamera";
import program from 'commander';
import Path from 'path';
import fs from 'fs';
import Websocket from 'ws';
import { initCamera, initMicrophone, getCameraType } from '../../library/sensors/sensors-helper';
import { LinuxDevice } from './linux-device';

const packageVersion = (<{ version: string }>JSON.parse(fs.readFileSync(
    Path.join(__dirname, '..', '..', '..', 'package.json'), 'utf-8'))).version;

program
    .description('Edge Impulse Linux client ' + packageVersion)
    .version(packageVersion)
    .option('--api-key <key>', 'API key to authenticate with Edge Impulse (overrides current credentials)')
    .option('--hmac-key <key>', 'HMAC key to sign new data with (overrides current credentials)')
    .option('--disable-camera', `Don't prompt for camera`)
    .option('--disable-microphone', `Don't prompt for microphone`)
    .option('--width <px>', 'Desired width of the camera stream')
    .option('--height <px>', 'Desired height of the camera stream')
    .option('--gst-launch-args <args>', 'Override the arguments to gst-launch-1.0. This should be a stream that returns JPEG images, e.g.: ' +
        '"v4l2src device=/dev/video0 ! video/x-raw,width=640,height=480 ! videoconvert ! jpegenc"')
    .option('--clean', 'Clear credentials')
    .option('--silent', `Run in silent mode, don't prompt for credentials`)
    .option('--dev', 'List development servers, alternatively you can use the EI_HOST environmental variable ' +
        'to specify the Edge Impulse instance.')
    .option('--camera <camera>', 'Which camera to use (either the name, or the device address - e.g. /dev/video0). ' +
        'If this argument is omitted, and multiple cameras are found, a CLI selector is shown.')
    .option('--microphone <microphone>', 'Which microphone to use (either the name, or the device address). ' +
        'If this argument is omitted, and multiple microphones are found, a CLI selector is shown.')
    .option('--verbose', 'Enable debug logs')
    .option('--greengrass', 'Enable AWS IoT greengrass integration mode')
    .allowUnknownOption(true)
    .parse(process.argv);

const devArgv: boolean = !!program.dev;
const cleanArgv: boolean = !!program.clean;
const silentArgv: boolean = !!program.silent;
const verboseArgv: boolean = !!program.verbose;
const apiKeyArgv = <string | undefined>program.apiKey;
const greengrassArgv: boolean = !!program.greengrass;
const hmacKeyArgv = <string | undefined>program.hmacKey;
const gstLaunchArgsArgv = <string | undefined>program.gstLaunchArgs;
const noCamera: boolean = !!program.disableCamera;
const noMicrophone: boolean = !!program.disableMicrophone;
const isProphesee = process.env.PROPHESEE_CAM === '1';
const enableVideo = isProphesee || (process.env.ENABLE_VIDEO === '1');
const widthArgv = <string | undefined>program.width;
const heightArgv = <string | undefined>program.height;
const cameraArgv = <string | undefined>program.camera;
const microphoneArgv = <string | undefined>program.microphone;

if ((program.width && !program.height) || (!program.width && program.height)) {
    console.error('--width and --height need to either be both specified or both omitted');
    process.exit(1);
}

let cameraDimensions: { width: number, height: number } | undefined;
if (widthArgv && heightArgv) {
    if (isNaN(Number(widthArgv))) {
        throw new Error(`Invalid value for --width, should be numeric (but was "${widthArgv}")`);
    }
    if (isNaN(Number(heightArgv))) {
        throw new Error(`Invalid value for --height, should be numeric (but was "${heightArgv}")`);
    }
    cameraDimensions = {
        width: Number(widthArgv),
        height: Number(heightArgv),
    };
}

const SERIAL_PREFIX = '\x1b[33m[SER]\x1b[0m';

const cliOptions = {
    appName: 'Edge Impulse Linux client',
    apiKeyArgv: apiKeyArgv,
    greengrassArgv: greengrassArgv,
    cleanArgv: cleanArgv,
    devArgv: devArgv,
    hmacKeyArgv: hmacKeyArgv,
    silentArgv: silentArgv,
    connectProjectMsg: 'To which project do you want to connect this device?',
    getProjectFromConfig: async () => {
        let projectId = await configFactory.getLinuxProjectId();
        if (!projectId) {
            return undefined;
        }
        return { projectId: projectId };
    }
};

let camera: ICamera | undefined;
let configFactory: Config;
let isExiting = false;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
    try {
        const cameraType = getCameraType();

        const init = await initCliApp(cliOptions);
        const config = init.config;
        configFactory = init.configFactory;

        const { projectId, devKeys } = await setupCliApp(configFactory, config, cliOptions, undefined);

        await configFactory.setLinuxProjectId(projectId);

        const linuxDevice = new LinuxDevice(config, projectId, devKeys, noMicrophone, enableVideo, verboseArgv,
            configFactory);
        const remoteMgmt = new RemoteMgmt(projectId,
            devKeys,
            Object.assign({
                command: <'edge-impulse-linux'>'edge-impulse-linux',
            }, config),
            linuxDevice,
            undefined, // model monitoring object
            url => new Websocket(url),
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

        let firstExit = true;

        const onSignal = async () => {
            if (!firstExit) {
                process.exit(1);
            }
            else {
                isExiting = true;

                console.log(SERIAL_PREFIX, 'Received stop signal, stopping application... ' +
                    'Press CTRL+C again to force quit.');
                firstExit = false;
                try {
                    if (camera) {
                        await camera.stop();
                    }
                    process.exit(0);
                }
                catch (ex2) {
                    let ex = <Error>ex2;
                    console.log(SERIAL_PREFIX, 'Failed to stop inferencing', ex.message);
                }
                process.exit(1);
            }
        };

        process.on('SIGHUP', onSignal);
        process.on('SIGINT', onSignal);

        if (!noMicrophone) {
            let audioDeviceName = '';
            try {
                audioDeviceName = await initMicrophone({
                    audioDeviceNameInConfig: await configFactory.getAudio(),
                    audioNameArgv: microphoneArgv,
                });
            }
            catch (ex2) {
                const ex = <Error>ex2;
                console.warn(SERIAL_PREFIX, (ex.message || ex.toString()));
                process.exit(1);
            }
            await configFactory.storeAudio(audioDeviceName);
            linuxDevice.setAudioDeviceName(audioDeviceName);

            console.log(SERIAL_PREFIX, 'Using microphone', audioDeviceName);
        }

        if (!noCamera) {
            const initedCamera = await initCamera({
                cameraType: cameraType,
                cameraDeviceNameInConfig: await configFactory.getCamera(),
                cameraNameArgv: cameraArgv,
                dimensions: cameraDimensions,
                gstLaunchArgs: gstLaunchArgsArgv,
                verboseOutput: verboseArgv,
                inferenceDimensions: undefined,
                profiling: false,
            });
            camera = await initedCamera.start();
            const cameraOpts = camera.getLastOptions();
            if (cameraOpts) {
                await configFactory.storeCamera(cameraOpts.device);
                console.log(SERIAL_PREFIX, 'Connected to camera ' + cameraOpts.device);
            }

            camera.on('error', error => {
                if (isExiting) return;

                console.log('camera error', error);
                process.exit(1);
            });

            let opts = camera.getLastOptions();
            if (!opts) {
                throw new Error('Could not get selected camera details');
            }
            await configFactory.storeCamera(opts.device);
            linuxDevice.registerCameraSnapshotHandler(camera);

            console.log(SERIAL_PREFIX, 'Connected to camera ' + opts.device);
        }

        remoteMgmt.on('authenticationFailed', async () => {
            console.log(SERIAL_PREFIX, 'Authentication failed');
            if (camera) {
                await camera.stop();
            }
            process.exit(1);
        });

        await remoteMgmt.connect();
    }
    catch (ex) {
        console.error('Failed to initialize linux tool', ex);
        if (camera) {
            await camera.stop();
        }
        process.exit(1);
    }
})();
