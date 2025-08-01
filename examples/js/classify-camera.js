const { ImageClassifier, LinuxImpulseRunner, Ffmpeg, Imagesnap, RunnerHelloHasAnomaly } = require('../../build/library');

(async () => {
    try  {

        // Required arguments:
        //   arg 2: Path to the model file. e.g. /tmp/model.eim
        //   arg 3: Name of the camera device, see output of `gst-device-monitor-1.0`. e.g. "HD Pro Webcam C920"
        // Optional arguments:
        //   arg 4: desired FPS. e.g. 20, default 5
        //   arg 5: desired capture width. e.g. 320, default 640
        //   arg 6: desired capture height. e.g. 200, default 480

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
        let camera;
        if (process.platform === 'darwin') {
            camera = new Imagesnap();
        }
        else if (process.platform === 'linux') {
            camera = new Ffmpeg(false /* verbose */, {
                scaleAndCropInPipeline: true,
            });
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
        });

        console.log('Connected to camera');

        let imageClassifier = new ImageClassifier(runner, camera);

        await imageClassifier.start();

        imageClassifier.on('result', (ev, timeMs, imgAsJpg) => {
            if (ev.result.classification) {
                // print the raw predicted values for this frame
                // (turn into string here so the content does not jump around)
                let c = ev.result.classification;
                for (let k of Object.keys(c)) {
                    c[k] = c[k].toFixed(4);
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
