# Edge Impulse Linux SDK for Node.js

This library lets you run machine learning models and collect sensor data on Linux machines using Node.js. This SDK is part of [Edge Impulse](https://www.edgeimpulse.com) where we enable developers to create the next generation of intelligent device solutions with embedded machine learning. [Start here to learn more and train your first model](https://docs.edgeimpulse.com).

## Installation guide

Add the library to your application via:

```
$ npm install edge-impulse-linux
```

## Windows offline installer (for locked-down environments)

For corporate-managed Windows devices where `npm install` is blocked (TLS interception, no build tools, restricted package access), this repo also supports a prebuilt Windows installer artifact via GitHub Actions.

### What this installer includes

* Bundled `node.exe` runtime (no separate Node.js install required)
* Prebuilt `node_modules` from CI (no local `node-gyp` / Python toolchain required)
* Installed CLI shims in PATH:
    * `edge-impulse-linux`
    * `edge-impulse-linux-runner`
    * `edge-impulse-camera-debug`

### End-user requirements

* Windows 10/11 (`x64` or `arm64` artifact)
* Administrator rights to install (writes to `Program Files` and system PATH)
* WSL is not required for installation, but recommended for full Linux CLI behavior

### Important runtime note

This is still the Linux CLI package, packaged for Windows installation. Some commands or hardware flows that depend on Linux-specific behavior or drivers may still require Linux/WSL at runtime.

For full functionality, install WSL first from an elevated Command Prompt:

```
wsl --install
```

### Build and download installer artifacts

Use the workflow in this repository:

* **Actions** → **Build Windows Linux-CLI Installer**

Artifacts produced:

* `edge-impulse-linux-cli-windows-x64`
* `edge-impulse-linux-cli-windows-arm64`

Each artifact zip contains a `.exe` installer.

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

### Snapdragon Hardware Acceleration (Windows ARM64)

The Windows installer for ARM64 devices on Qualcomm Snapdragon platforms includes automatic detection and support for **QNN (Qualcomm Neural Network)** hardware acceleration.

#### What this enables

* Neural network inference via Snapdragon NPU (Neural Processing Unit)
* Optimized DSP (Digital Signal Processing) for audio/signal preprocessing
* Accelerated model compilation to ONNX and TensorFlow Lite formats
* Automatic fallback to CPU mode if acceleration libraries unavailable

#### Supported devices

* Windows 11 ARM64 on Snapdragon processors (X SoC, Gen 3, etc.)
* Qualcomm reference boards (RB3 Gen 2, IQ-9)

#### Checking for Snapdragon acceleration

After installation, run the included detection script to verify acceleration support:

```powershell
# From Command Prompt or PowerShell
%PROGRAMFILES%\EdgeImpulse Linux CLI\bin\detect-snapdragon.ps1
```

Expected output for Snapdragon device:

```
✓ Snapdragon device detected: <processor-name>
✓ QNN runtime available - hardware acceleration enabled
```

If QNN runtime is not detected:

```
ℹ Qualcomm Snapdragon detected: <processor-name>
ℹ QNN runtime not detected - install Qualcomm AI Hub or Snapdragon SDK for acceleration
```

#### Installing QNN runtime

To enable QNN hardware acceleration, install one of:

1. **Qualcomm AI Hub** - Recommended for developers
   - Download from https://qualcomm.ai/hub
   - Includes QNN SDK and runtime libraries

2. **Snapdragon SDK** - For Snapdragon platform development
   - Available via Qualcomm Developer Network
   - Includes TensorFlow Lite with QNN delegate support

After installation, the CLI will automatically detect and use QNN for model execution. The system gracefully falls back to CPU inference if QNN libraries are unavailable.

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

Pass `--agent <socket>` or set `EI_AGENT_SOCKET` to enable this mode. The runner then skips its normal Edge Impulse login and remote-management connection. It registers with no model, waits for the agent to send an `activateBundle` command, and sends inference events as HTTP/1.1 messages over the agent's Unix socket. Agent mode cannot be combined with `--api-key`, `--monitor`, `--greengrass`, `--model-file`, or `--impulse-id`.

The agent stages each model as a directory containing `manifest.json` and one executable `.eim`, then mounts that directory read-only into the runner container. Initial activation validates and starts the model, builds its sensor or HTTP pipeline, and registers it before reporting success. A different bundle is statically validated while the current model remains available; the runner then exits without completing the command so its supervisor can restart it and the agent can replay the activation in a fresh process. A replacement rejected by static checks leaves the current model running. A bundle that passes those checks but fails while its `.eim` or input pipeline starts is recovered by the agent rolling back and restarting the previous bundle.

Agent-specific environment variables are ignored unless agent mode is enabled. `--agent` takes precedence over `EI_AGENT_SOCKET`; after agent mode is enabled, each other command-line option takes precedence over its corresponding environment variable.

| Variable | Purpose and accepted values | Corresponding command-line option and precedence |
| --- | --- | --- |
| `EI_AGENT_SOCKET` | Enables agent-managed mode and gives the path of the agent's Unix socket. | `--agent <socket>` takes precedence. |
| `EI_RUNNER_TARGET` | Exact Studio deployment target expected in bundle manifests, for example `runner-linux-aarch64-qnn-ventuno-q`. Set this when automatic host detection is less specific than the deployment format. | `--force-target <target>` takes precedence. |
| `EI_AGENT_BUNDLE_PREPARE_TIMEOUT_MS` | Maximum time for a staged `.eim` to initialize, including accelerator warm-up. Defaults to `25000`; deployments must leave enough of the current activation lease to stop a failed candidate and post its result. Rollback starts a separate activation with its own lease. | No command-line equivalent. |
| `EI_MODEL_FILE` | Not supported in agent mode; models are selected only through `activateBundle`. | The runner exits with a clear error if this or `--model-file` is set. |
| `EI_IMPULSE_ID` | Not supported in agent mode; model identity comes from the bundle manifest. | The runner exits with a clear error if this or `--impulse-id` is set. |
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

### Model monitoring summaries

Run `edge-impulse-linux-runner --monitor` to enable Model Monitoring. The CLI receives
its summary interval from Remote Management based on the project's active alert rules.

`--monitor-summary-interval-ms <ms>` saves a preferred interval (minimum `5000`). Active
rules may require faster reporting; the CLI shows the effective interval and keeps the saved
preference. Summaries are produced as inference results arrive, so slow or paused inference
can delay reporting and alerts.

## Development tips

### Auto-reload the runner

If you're working on something in the runner, and want to auto-recompile on changes; start with:

```
npm run watch-runner -- "--model-file /Users/yourname/Downloads/yourmodel-v36.eim --run-http-server 1338"
```
