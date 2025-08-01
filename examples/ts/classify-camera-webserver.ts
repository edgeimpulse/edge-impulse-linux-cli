import { ImageClassifier, LinuxImpulseRunner, ICamera, Imagesnap, ModelInformation, GStreamer } from "../../library";
import { ips } from "../../cli-common/get-ips";
import sharp from 'sharp';
import express = require('express');
import { Server as SocketIoServer } from 'socket.io';
import http from 'http';
import Path from 'path';
import { RunnerHelloHasAnomaly } from "../../library/classifier/linux-impulse-runner";

(async () => {
    try  {

        // Required arguments:
        //   arg 2: Path to the model file. e.g. /tmp/model.eim
        //   arg 3: Name of the camera device, see output of `gst-device-monitor-1.0`. e.g. "HD Pro Webcam C920"
        // Optional arguments:
        //   arg 4: desired FPS. e.g. 20, default 5
        //   arg 5: desired capture width. e.g. 320, default 640
        //   arg 6: desired capture height. e.g. 200, default 480
        //   arg 7: webserver port. e.g. 4999, default 4912

        const argModelFile = process.argv[2];
        const argCamDevice = process.argv[3];
        const fps = process.argv[4] ? Number(process.argv[4]) : 5;
        const dimensions = (process.argv[5] && process.argv[6]) ? {
            width: Number(process.argv[5]),
            height: Number(process.argv[6])
        } : {
            width: 640,
            height: 480
        };

        const port = process.argv[7] ? Number(process.argv[7]) : (process.env.PORT ? Number(process.env.PORT) : 4912);

        if (!argModelFile) {
            console.log('Missing one argument (model file)');
            process.exit(1);
        }

        let runner = new LinuxImpulseRunner(argModelFile);
        let model = await runner.init();

        let labels = model.modelParameters.labels;
        if (model.modelParameters.has_anomaly === RunnerHelloHasAnomaly.VisualGMM) {
            labels.push('anomaly');
        }

        console.log('Starting the image classifier for',
            model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
        console.log('Parameters',
            'image size', model.modelParameters.image_input_width + 'x' + model.modelParameters.image_input_height + ' px (' +
                model.modelParameters.image_channel_count + ' channels)',
            'classes', labels);

        // select a camera... you can implement this interface for other targets :-)
        let camera: ICamera;
        if (process.platform === 'darwin') {
            camera = new Imagesnap();
        }
        else if (process.platform === 'linux') {
            camera = new GStreamer(false /* verbose */);
        }
        else {
            throw new Error('Unsupported platform "' + process.platform + '"');
        }
        await camera.init();

        const devices = await camera.listDevices();
        if (devices.length === 0) {
            throw new Error('Cannot find any webcams');
        }
        if (devices.length > 1 && !argCamDevice) {
            throw new Error('Multiple cameras found (' + devices.map(n => '"' + n + '"').join(', ') + '), add ' +
                'the camera to use to this script (node classify-camera.js model.eim cameraname)');
        }

        let device = argCamDevice || devices[0];

        console.log('Using camera', device, 'starting...');

        await camera.start({
            device: device,
            intervalMs: 1000 / fps,
            dimensions: dimensions,
            inferenceDimensions: {
                width: model.modelParameters.image_input_width,
                height: model.modelParameters.image_input_height,
                resizeMode: model.modelParameters.image_resize_mode || 'none',
            },
        });

        camera.on('error', error => {
            console.log('camera error', error);
            process.exit(1);
        });

        console.log('Connected to camera');

        let imageClassifier = new ImageClassifier(runner, camera);

        await imageClassifier.start();

        let webserverPort = await startWebServer(model, camera, imageClassifier, port);
        console.log('');
        console.log('Want to see a feed of the camera and live classification in your browser? ' +
            'Go to http://' + (ips.length > 0 ? ips[0].address : 'localhost') + ':' + webserverPort);
        console.log('');

        imageClassifier.on('result', (ev, timeMs, imgAsJpg) => {
            if (ev.result.classification) {
                // print the raw predicted values for this frame
                // (turn into string here so the content does not jump around)
                let c = <{ [k: string]: string | number }>(<any>ev.result.classification);
                for (let k of Object.keys(c)) {
                    c[k] = (<number>c[k]).toFixed(4);
                }
                console.log('classification', timeMs + 'ms.', c);
            }
            if (ev.result.bounding_boxes) {
                console.log('boundingBoxes', timeMs + 'ms.', JSON.stringify(ev.result.bounding_boxes));
            }
            if (ev.result.visual_anomaly_grid) {
                console.log('visual anomalies', timeMs + 'ms.', JSON.stringify(ev.result.visual_anomaly_grid));
            }
        });
    }
    catch (ex) {
        console.error(ex);
        process.exit(1);
    }
})();

function startWebServer(model: ModelInformation, camera: ICamera, imgClassifier: ImageClassifier, port: number) {
    const app = express();
    app.use(express.static(Path.join(__dirname, '..', '..', '..', 'cli', 'linux', 'webserver', 'public')));

    const server = new http.Server(app);
    const io = new SocketIoServer(server);

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
        server.listen(port, process.env.HOST || '0.0.0.0', async () => {
            resolve(port);
        });
    });
}
