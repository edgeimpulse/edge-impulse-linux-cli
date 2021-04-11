# Edge Impulse Linux SDK for Node.js

This library lets you run machine learning models and collect sensor data on Linux machines using Node.js. This SDK is part of [Edge Impulse](https://www.edgeimpulse.com) where we enable developers to create the next generation of intelligent device solutions with embedded machine learning. [Start here to learn more and train your first model](https://docs.edgeimpulse.com).

## Installation guide

Add the library to your application via:

```
$ npm install edge-impulse-linux
```

## Collecting data

Before you can classify data you'll first need to collect it. If you want to collect data from the camera or microphone on your system you can use the Edge Impulse CLI, and if you want to collect data from different sensors (like accelerometers or proprietary control systems) you can do so in a few lines of code.

### Collecting data from the camera or microphone

1. Install the Edge Impulse CLI for Linux:

    ```
    $ npm install edge-impulse-linux -g --unsafe-perm
    ```

1. Start the CLI and follow the instructions:

    ```
    $ edge-impulse-linux
    ```

1. That's it. Your device is now connected to Edge Impulse and you can capture data from the camera and microphone.

### Collecting data from other sensors

To collect data from other sensors you'll need to write some code where you instantiate a `DataForwarder` object, write data samples, and finally call `finalize()` which uploads the data to Edge Impulse. [Here's an end-to-end example](https://github.com/edgeimpulse/edge-impulse-linux-cli/blob/master/examples/collect-custom.ts).

### CLI Options

You can pass in options to the CLI. Here are the key ones:

* `--disable-camera` - disables the camera.
* `--disable-microphone` - disable the microphone.
* `--clean` - clear credentials, and re-authenticate. Use this to switch projects or devices.
* `--api-key <apikey>` - set an API key, useful for automatic authentication with a new project.
* `--help` - see all options.

## Classifying data

To classify data (whether this is from the camera, the microphone, or a custom sensor) you'll need a model file. This model file contains all signal processing code, classical ML algorithms and neural networks - and typically contains hardware optimizations to run as fast as possible. To grab a model file:

1. Train your model in Edge Impulse.
1. Install the Edge Impulse CLI:

    ```
    $ npm install edge-impulse-linux -g --unsafe-perm
    ```

1. Download the model file via:

    ```
    $ edge-impulse-linux-runner --download modelfile.eim
    ```

    This downloads the file into `modelfile.eim`. (Want to switch projects? Add `--clean`)

Then you can start classifying realtime sensor data. We have examples for:

* [Audio](https://github.com/edgeimpulse/edge-impulse-linux-cli/blob/master/examples/js/classify-audio.js) - grabs data from the microphone and classifies it in realtime.
* [Audio (moving average filter)](https://github.com/edgeimpulse/edge-impulse-linux-cli/blob/master/examples/js/classify-audio-maf.js) - as above, but shows how to use the moving-average filter to smooth your data and reduce false positives.
* [Camera](https://github.com/edgeimpulse/edge-impulse-linux-cli/blob/master/examples/js/classify-camera.js) - grabs data from a webcam and classifies it in realtime.
* [Custom data](https://github.com/edgeimpulse/edge-impulse-linux-cli/blob/master/examples/js/classify-custom.js) - classifies custom sensor data.

### Moving average filter

To smooth your results and reduce false positives there's an implementation of a moving-average filter in this library. To use it:

```js
const { MovingAverageFilter } = require("edge-impulse-linux");

let movingAverageFilter = new MovingAverageFilter(
    4 /* filter size, smooths over X results */,
    model.modelParameters.labels);

// classify item
let res = await runner.classify(features);

// run the filter
let filteredRes = movingAverageFilter.run(res);
```
