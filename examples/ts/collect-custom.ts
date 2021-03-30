import { DataForwarder, getIps } from '../../library';

// Your API & HMAC keys here (go to your project > Dashboard > Keys to find this)
const API_KEY = process.env.API_KEY || 'ei_...';
const HMAC_KEY = process.env.HMAC_KEY || '0';

// tslint:disable-next-line: no-floating-promises
(async () => {
    try {
        // instantiate a DataForwarder object to collect custom data from a sensor
        let dataForwarder = new DataForwarder({
            // use MAC address of network interface as deviceId
            deviceId: getIps().length > 0 ? getIps()[0].mac : undefined,
            deviceType: 'CUSTOM-COLLECTOR',
            apiKey: API_KEY,
            // This is the interval between samples (alt. you can use `frequency` here)
            // here we have new data every 16 ms.
            intervalMs: 16,
            hmacKey: HMAC_KEY,
            // list all the sensors, one item per axis
            sensors: [
                { name: 'accX', units: 'm/s2' },
                { name: 'accY', units: 'm/s2' },
                { name: 'accZ', units: 'm/s2' },
            ]
        });

        // after instantiating the DataForwarder object we'll write new data (grab this data from your sensors)
        // here we'll collect 2 seconds of data (16ms. = 62.5Hz)
        for (let ix = 0; ix < 62.5 * 2; ix++) {
            // make some nice wave forms
            dataForwarder.addData([
                Math.sin(ix * 0.1) * 10,
                Math.cos(ix * 0.1) * 10,
                (Math.sin(ix * 0.1) + Math.cos(ix * 0.1)) * 10,
            ]);
        }

        console.log('Uploading data...');

        // afer you're done, send the data to Edge Impulse
        await dataForwarder.upload({
            filename: 'linux-test.json',
            label: 'linuxtest',
            // category can either be training, testing or split
            // (the latter takes the hash of the file and splits it between training/testing automatically)
            category: 'training',
        });

        console.log('Uploading data OK');
    }
    catch (ex) {
        console.error(ex);
        process.exit(1);
    }
})();
