import { LinuxImpulseRunner } from "../../library";
import fs from 'fs';

// This script expects two arguments:
// 1. The model file
// 2. A features file with raw data. You can get this by going to **Live classification > Load sample**
//    then copy the features from the 'Raw features' block.

(async () => {
    try  {
        if (!process.argv[2]) {
            console.log('Missing one argument (model file)');
            process.exit(1);
        }

        if (!process.argv[3]) {
            console.log('Missing second argument (features file)');
            process.exit(1);
        }

        // Load the model
        let runner = new LinuxImpulseRunner(process.argv[2]);
        let model = await runner.init();

        const windowLengthMs = ((model.modelParameters.input_features_count /
            model.modelParameters.frequency /
            model.modelParameters.axis_count) * 1000);

        console.log('Starting the custom classifier for',
            model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
        console.log('Parameters', 'freq', model.modelParameters.frequency + 'Hz',
            'window length', windowLengthMs + 'ms.',
            'classes', model.modelParameters.labels);

        // read the features file (comma separated numbers)
        // Newlines deliminate samples
        // Create an array of array of Numbers.  Each inner array is a sample.
        let samples = (<string>await fs.promises.readFile(process.argv[3], 'utf-8'))
            .trim().split('\n').map(line => line.split(',').map(n => Number(n)));

        for (let features of samples) {
            // and classify the data, this should match the classification in the Studio
            let res = await runner.classify(features);

            console.log('Begin output');
            if (res.result.classification) {
                let ret: number[] = [];
                for (let k of Object.keys(res.result.classification)) {
                    ret.push(res.result.classification[k]);
                }
                if (typeof res.result.visual_anomaly_max === 'number') {
                    ret.push(res.result.visual_anomaly_max);
                }
                else if (typeof res.result.anomaly === 'number') {
                    ret.push(res.result.anomaly);
                }
                console.log('[' + ret.map(x => x.toFixed(5)).join(', ') + ']');
            }
            if (res.result.bounding_boxes) {
                for (let bb of res.result.bounding_boxes) {
                    if (bb.value === 0) {
                        continue;
                    }
                    console.log(`${bb.label} (${bb.value.toFixed(5)}) ` +
                        `[ x: ${bb.x}, y: ${bb.y}, width: ${bb.width}, height: ${bb.height} ]`);
                }
            }
            if (res.result.visual_anomaly_grid) {
                for (let bb of res.result.visual_anomaly_grid) {
                    console.log(`${bb.label} (${bb.value.toFixed(5)}) ` +
                        `[ x: ${bb.x}, y: ${bb.y}, width: ${bb.width}, height: ${bb.height} ]`);
                }
            }
            console.log('End output');

            // if you want to fill in data on the fly you can also do this; e.g. if you have 3-axis accelerometer
            // with 2 second window and 100Hz, then input_features_count=600, axis_count=3
            // let features = [];
            // for (let ix = 0; ix <
            //   model.modelParameters.input_features_count; ix += model.modelParameters.axis_count) {
            //     features.push(x);
            //     features.push(y);
            //     features.push(z);
            // }
            // and classify features
        }
        await runner.stop();
    }
    catch (ex) {
        console.error(ex);
        process.exit(1);
    }
    finally {
        process.exit(0);
    }
})();
