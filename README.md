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

To collect data from other sensors you'll need to write some code where you instantiate a `DataForwarder` object, write data samples, and finally call `finalize()` which uploads the data to Edge Impulse. [Here's an end-to-end example](https://github.com/edgeimpulse/edge-impulse-linux-cli/blob/master/examples/ts/collect-custom.ts).

### CLI Options

You can pass in options to the CLI. Here are the key ones:

* `--disable-camera` - disables the camera.
* `--disable-microphone` - disable the microphone.
* `--clean` - clear credentials, and re-authenticate. Use this to switch projects or devices.
* `--api-key <apikey>` - set an API key, useful for automatic authentication with a new project.
* `--greengrass` - utilize the AWS IoT Greengrass authentication context and AWS Secrets Manager to authenticate with a new project. See additional Greegrass notes below.
* `--help` - see all options.

#### Greengrass Integration Note

edge-impulse-linux and edge-impulse-linux-runner can be run as a service via a custom AWS IoT Greengrass component(s). When provided with the "--greengrass" option, both services will utilize the AWS IoT Greengrass authentication context (ONLY present when launched as a AWS IoT Greengrass custom component) as well as AWS Secrets Manager to extract the api key to be used to authenticate to a new project. If the authentication context is abscent and/or incorrect, both services will simply ignore the "--greengrass" option that was provided and continue with any of the other provided options normally.

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

For VLM models on certain Qualcomm targets (RB3 Gen 2, IQ-9), you can enable GPU acceleration by passing `--enable-gpu` to `edge-impulse-linux-runner`. OpenCL drivers should be configured for this to work.

### Runner environment variables

#### Standard runner mode

By default, `edge-impulse-linux-runner` runs directly under the user or service that launched it. It can authenticate with Edge Impulse, download a model or run a local `.eim`, select sensors, and expose its preview or inference HTTP server. For the variables below, a corresponding command-line option takes precedence over the environment variable.

| Variable | Purpose and accepted values | Corresponding command-line option and precedence |
| --- | --- | --- |
| `PORT` | Port for the preview interface. Defaults to `4912`. It is ignored when the runner uses `--run-http-server`. | `--preview-port <port>` takes precedence. |
| `HOST` | Network address or hostname on which HTTP servers listen. Defaults to `0.0.0.0`. | For the preview interface, `--preview-host <host>` takes precedence. With `--run-http-server`, `HOST` controls the inference API bind address and `--preview-host` does not apply. |
| `EI_HOST` | Edge Impulse Studio hostname used for authentication and model download, for example a self-hosted or development instance. | There is no value-taking command-line equivalent; `--dev` provides an interactive server selector instead. |
| `PROPHESEE_CAM` | Set to `1` to advertise video support to remote management for Prophesee camera deployments. | No command-line equivalent. |
| `ENABLE_VIDEO` | Set to `1` to advertise video support to remote management. | No command-line equivalent. |

#### Experimental agent-managed mode

Agent-managed mode is experimental and is not included in the standard published package or runner image. A build that enables it must explicitly include the experimental agent client and device protocol validators.

Pass `--agent <socket>` or set `EI_AGENT_SOCKET` to enable this mode. The runner then skips its normal Edge Impulse login and remote-management connection. Instead, it registers with the local device agent, receives commands, and sends inference events as HTTP/1.1 messages over the agent's Unix socket. Agent mode cannot be combined with `--api-key`, `--monitor`, or `--greengrass`.

Agent-specific environment variables are ignored unless agent mode is enabled. `--agent` takes precedence over `EI_AGENT_SOCKET`; after agent mode is enabled, each other command-line option takes precedence over its corresponding environment variable.

| Variable | Purpose and accepted values | Corresponding command-line option and precedence |
| --- | --- | --- |
| `EI_AGENT_SOCKET` | Enables agent-managed mode and gives the path of the agent's Unix socket. | `--agent <socket>` takes precedence. |
| `EI_MODEL_FILE` | Path to the `.eim` model to execute. This is currently required because the agent does not yet tell the runner which model file to load. | `--model-file <file>` takes precedence. |
| `EI_IMPULSE_ID` | Numeric Studio impulse ID associated with `EI_MODEL_FILE`. This is currently required because a `.eim` does not contain its impulse ID. | `--impulse-id <id>` takes precedence. |
| `EI_RUNNER_HTTP_PORT` | Port from `1` to `65535` for on-demand HTTP inference. | `--run-http-server <port>` takes precedence. |
| `EI_RUNNER_MODE` | Runner behavior: `streaming` reads continuously from a camera or microphone; `http-server` waits for inference requests. | `--mode <mode>` takes precedence. Passing `--run-http-server` also selects `http-server` unless `--mode` is explicitly set. |
| `EI_CAMERA` | Camera name or device path for streaming mode. It avoids an interactive device-selection prompt. | `--camera <camera>` takes precedence. |
| `EI_MICROPHONE` | Microphone name or device path for streaming mode. It avoids an interactive device-selection prompt. | `--microphone <microphone>` takes precedence. |
| `EI_RUNNER_IMAGE` | Container image reference reported to the agent as runner metadata. Defaults to `edge-impulse-linux-runner:<package-version>`. | No command-line equivalent. |
| `EI_RUNNER_IMAGE_DIGEST` | Optional immutable container image digest reported to the agent as runner metadata. | No command-line equivalent. |

#### Greengrass integration

These variables affect only the standard runner's AWS IoT Greengrass integration, enabled with `--greengrass`.

| Variable | Purpose and accepted values | Corresponding command-line option |
| --- | --- | --- |
| `EI_SHUTDOWN_BEHAVIOR` | In Greengrass mode, set to `wait_on_restart` to keep the process alive after a camera error while it waits for an AWS IoT Core restart command. Any other value uses the default behavior and exits. | No command-line equivalent; only used with `--greengrass`. |
| `EI_INCLUDE_BASE64_IMAGE` | In Greengrass mode, set to `yes` to include the current JPEG as base64 in each AWS IoT inference payload. Other values omit the image. | No command-line equivalent; only used with `--greengrass`. |

Then you can start classifying realtime sensor data. We have examples for:

* [Audio](https://github.com/edgeimpulse/edge-impulse-linux-cli/blob/master/examples/js/classify-audio.js) - grabs data from the microphone and classifies it in realtime.
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

## Development tips

### Auto-reload the runner

If you're working on something in the runner, and want to auto-recompile on changes; start with:

```
npm run watch-runner -- "--model-file /Users/yourname/Downloads/yourmodel-v36.eim --run-http-server 1338"
```
