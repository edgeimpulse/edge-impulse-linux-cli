import { ImageClassifier, LinuxImpulseRunner, Ffmpeg, ICamera, Imagesnap } from "../../library";

// tslint:disable-next-line: no-floating-promises
(async () => {
    try  {
        if (!process.argv[2]) {
            console.log('Missing one argument (model file)');
            process.exit(1);
        }

        let runner = new LinuxImpulseRunner(process.argv[2]);
        let model = await runner.init();

        console.log('Starting the image classifier for',
            model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
        console.log('Parameters',
            'image size', model.modelParameters.image_input_width + 'x' + model.modelParameters.image_input_height + ' px (' +
                model.modelParameters.image_channel_count + ' channels)',
            'classes', model.modelParameters.labels);

        // select a camera... you can implement this interface for other targets :-)
        let camera: ICamera;
        if (process.platform === 'darwin') {
            camera = new Imagesnap();
        }
        else if (process.platform === 'linux') {
            camera = new Ffmpeg(false /* verbose */);
        }
        else {
            throw new Error('Unsupported platform "' + process.platform + '"');
        }
        await camera.init();

        const devices = await camera.listDevices();
        if (devices.length === 0) {
            throw new Error('Cannot find any webcams');
        }
        if (devices.length > 1 && !process.argv[3]) {
            throw new Error('Multiple cameras found (' + devices.map(n => '"' + n + '"').join(', ') + '), add ' +
                'the camera to use to this script (node classify-camera.js model.eim cameraname)');
        }

        let device = process.argv[3] || devices[0];

        console.log('Using camera', device, 'starting...');

        await camera.start({
            device: device,
            intervalMs: 200,
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
                // tslint:disable-next-line: no-unsafe-any
                let c = <{ [k: string]: string | number }>(<any>ev.result.classification);
                for (let k of Object.keys(c)) {
                    c[k] = (<number>c[k]).toFixed(4);
                }
                console.log('classification', timeMs + 'ms.', c);
            }
            else if (ev.result.bounding_boxes) {
                console.log('boundingBoxes', timeMs + 'ms.', JSON.stringify(ev.result.bounding_boxes));
            }
        });
    }
    catch (ex) {
        console.error(ex);
        process.exit(1);
    }
})();
