import { LinuxImpulseRunner } from "../../library";
import fs from 'fs';

// This script expects two arguments:
// 1. The model file
// 2. A features file with raw data. You can get this by going to **Live classification > Load sample**
//    then copy the features from the 'Raw features' block.

// tslint:disable-next-line: no-floating-promises
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

        console.log('Starting the custom classifier for',
            model.project.owner + ' / ' + model.project.name, '(v' + model.project.deploy_version + ')');
        console.log('Parameters', 'freq', model.modelParameters.frequency + 'Hz',
            'window length', ((model.modelParameters.input_features_count / model.modelParameters.frequency) * 1000) + 'ms.',
            'classes', model.modelParameters.labels);

        // read the features file (comma separated numbers)
        let features = (<string>await fs.promises.readFile(process.argv[3], 'utf-8'))
            .trim().split(',').map(n => Number(n));

        // and classify the data, this should match the classification in the Studio
        let res = await runner.classify(features);
        console.log('classification', res.result, 'timing', res.timing);

        // if you want to fill in data on the fly you can also do this; e.g. if you have 3-axis accelerometer
        // with 2 second window and 100Hz, then input_features_count=600, axis_count=3
        // let features = [];
        // for (let ix = 0; ix < model.modelParameters.input_features_count; ix += model.modelParameters.axis_count) {
        //     features.push(x);
        //     features.push(y);
        //     features.push(z);
        // }
        // and classify features

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
