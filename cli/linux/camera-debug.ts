#!/usr/bin/env node

import { Imagesnap } from "../../library/sensors/imagesnap";
import inquirer from 'inquirer';
import { ICamera } from "../../library/sensors/icamera";
import { GStreamer } from "../../library/sensors/gstreamer";
import { ips } from "../../library/get-ips";
import program from 'commander';
import Path from 'path';
import fs from 'fs';
import { Prophesee } from "../../library/sensors/prophesee";
import express = require('express');
import http from 'http';
import socketIO from 'socket.io';

const packageVersion = (<{ version: string }>JSON.parse(fs.readFileSync(
    Path.join(__dirname, '..', '..', '..', 'package.json'), 'utf-8'))).version;

program
    .description('Edge Impulse Camera debug client ' + packageVersion)
    .version(packageVersion)
    .option('--verbose', 'Enable debug logs')
    .option('--fps <fps>', 'Frames per second (default: 30)')
    .option('--width <px>', 'Desired width of the camera stream')
    .option('--height <px>', 'Desired height of the camera stream')
    .allowUnknownOption(true)
    .parse(process.argv);

const verboseArgv: boolean = !!program.verbose;
const isProphesee = process.env.PROPHESEE_CAM === '1';
const fps = program.fps ? Number(program.fps) : 30;
const dimensions = program.width && program.height ? {
    width: Number(program.width),
    height: Number(program.height)
} : undefined;

if ((program.width && !program.height) || (!program.width && program.height)) {
    console.error('--width and --height need to either be both specified or both omitted');
    process.exit(1);
}

const SERIAL_PREFIX = '\x1b[33m[SER]\x1b[0m';

// tslint:disable-next-line: no-floating-promises
(async () => {
    let camera: ICamera | undefined;
    try {
        if (isProphesee) {
            camera = new Prophesee(verboseArgv);
        }
        else if (process.platform === 'darwin') {
            camera = new Imagesnap();
        }
        else if (process.platform === 'linux') {
            camera = new GStreamer(verboseArgv);
        }
        else {
            throw new Error('Unsupported platform: "' + process.platform + '"');
        }
        await camera.init();

        let firstExit = true;

        const onSignal = async () => {
            if (!firstExit) {
                process.exit(1);
            }
            else {
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

        let cameraDevice: string | undefined;
        const cameraDevices = await camera.listDevices();
        if (cameraDevices.length === 0) {
            throw new Error('Cannot find any webcams, run this command with --disable-camera to skip selection');
        }

        if (cameraDevices.length === 1) {
            cameraDevice = cameraDevices[0];
        }
        else {
            let inqRes = await inquirer.prompt([{
                type: 'list',
                choices: (cameraDevices || []).map(p => ({ name: p, value: p })),
                name: 'camera',
                message: 'Select a camera',
                pageSize: 20
            }]);
            cameraDevice = <string>inqRes.camera;
        }

        console.log(SERIAL_PREFIX, 'Using camera', cameraDevice, 'starting (' + fps + ' fps)...');

        await camera.start({
            device: cameraDevice,
            intervalMs: 1000 / fps,
            dimensions: dimensions
        });

        camera.on('error', error => {
            console.log('camera error', error);
        });

        console.log(SERIAL_PREFIX, 'Connected to camera');

        let webserverPort = await startWebServer(camera, cameraDevice);
        console.log('');
        console.log('To see a feed of the camera and live classification in your browser? ' +
            'Go to http://' + (ips.length > 0 ? ips[0].address : 'localhost') + ':' + webserverPort);
        console.log('');

    }
    catch (ex) {
        console.error('Failed to initialize linux tool', ex);
        if (camera) {
            await camera.stop();
        }
        process.exit(1);
    }
})();


function startWebServer(camera: ICamera, cameraName: string) {
    const app = express();
    app.use(express.static(Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public')));

    const server = new http.Server(app);
    const io = socketIO(server);

    camera.on('snapshot', async (data, fileName) => {
        io.emit('image', {
            img: 'data:image/jpeg;base64,' + data.toString('base64'),
            fileName: fileName
        });
    });

    io.on('connection', socket => {
        socket.emit('hello', {
            projectName: 'Camera debugger (' + cameraName + ')'
        });
    });

    return new Promise<number>((resolve) => {
        server.listen(Number(process.env.PORT) || 4913, process.env.HOST || '0.0.0.0', async () => {
            resolve((Number(process.env.PORT) || 4913));
        });
    });
}
