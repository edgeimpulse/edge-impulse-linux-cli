const { AudioClassifier, LinuxImpulseRunner, AudioRecorder } = require("../../build/library");

// This script expects one argument:
// 1. The model file

// tslint:disable-next-line: no-floating-promises
(async () => {
    try  {
        if (!process.argv[2]) {
            console.log('Missing one argument (model file)');
            process.exit(1);
        }

        let runner = new LinuxImpulseRunner(process.argv[2]);
        let model = await runner.init();

        console.log('Starting the audio classifier for',
            model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
        console.log('Parameters', 'freq', model.modelParameters.frequency + 'Hz',
            'window length', ((model.modelParameters.input_features_count / model.modelParameters.frequency) * 1000) + 'ms.',
            'classes', model.modelParameters.labels);

        // Find the right microphone to run this model with (can be passed in as argument to the script)
        let devices = await AudioRecorder.ListDevices();
        if (devices.length === 0) {
            devices = [{ id: '', name: 'Default microphone' }];
        }
        if (devices.length > 1 && !process.argv[3]) {
            throw new Error('Multiple microphones found (' + devices.map(n => '"' + n.name + '"').join(', ') + '), ' +
                'add the microphone to use to this script (node classify-audio.js model.eim microphone)');
        }
        let device;
        if (process.argv[3]) {
            let d = devices.find(x => x.name === process.argv[3]);
            if (!d) {
                throw new Error('Invalid microphone name (' + process.argv[3] + '), found: ' +
                    devices.map(n => '"' + n.name + '"').join(', '));
            }
            device = d.id;
        }
        else {
            device = devices[0].id;
        }

        let audioClassifier = new AudioClassifier(runner, false /* verbose */);

        audioClassifier.on('noAudioError', async () => {
            console.log('');
            console.log('ERR: Did not receive any audio. Here are some potential causes:');
            console.log('* If you are on macOS this might be a permissions issue.');
            console.log('  Are you running this command from a simulated shell (like in Visual Studio Code)?');
            console.log('* If you are on Linux and use a microphone in a webcam, you might also want');
            console.log('  to initialize the camera (see camera.js)');
            await audioClassifier.stop();
            process.exit(1);
        });

        await audioClassifier.start(device, 250 /* interval, so here 4 times per second */);

        // when new data comes in, this handler is called.
        // Use it to draw conclusions, send interesting events to the cloud etc.
        audioClassifier.on('result', (ev, timeMs, audioAsPcm) => {
            if (!ev.result.classification) return;

            // print the raw predicted values for this frame
            // (turn into string here so the content does not jump around)
            let c = ev.result.classification;
            for (let k of Object.keys(c)) {
                c[k] = c[k].toFixed(4);
            }
            console.log('classification', timeMs + 'ms.', c);
        });
    }
    catch (ex) {
        console.error(ex);
        process.exit(1);
    }
})();
