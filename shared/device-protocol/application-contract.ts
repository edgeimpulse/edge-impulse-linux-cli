// Generated from device-services-contracts/schema/ by device-services-contracts/generate.sh. Do not edit.

/**
 * Any body of the contract, in either direction. The root of the
 * `application-contract.json` schema.
 *
 * The contract is HTTP/1.1 on a Unix domain socket under the agent's
 * runtime directory. Bodies are JSON. Paths carry the major version:
 *
 * | Operation | Method and path | Request | Response |
 * | --- | --- | --- | --- |
 * | Register | `POST /v1/register` | `RegisterRequest` | `RegisterResponse` |
 * | Post events | `POST /v1/events` | `EventBatch` | `EventBatchResponse` |
 * | Command stream | `GET /v1/commands` | none | server-sent events, each `data:` a `Command` |
 * | Command result | `POST /v1/commands/{commandId}/result` | `CommandResult` | empty |
 * | Preview sample | `POST /v1/preview` | `PreviewSample` | `PreviewAck` |
 *
 * The application registers before using the other operations. An inference
 * application initially reports no models, then replaces that registration
 * after a successful bundle activation with the models it now serves. A
 * dropped command stream is reopened for the same registered session. If
 * the agent loses that session or returns `not_registered`, the application
 * registers again with its current state before reopening the stream.
 *
 * Commands are delivered at least once: the agent sends a command without a
 * result again when the stream reconnects. An application handles the same command
 * ID idempotently. If the agent stops waiting for a command, a later result may
 * be refused with `unknown_command`.
 *
 * A live preview starts with the `startPreview` command, which the agent sends
 * only to an application that declared the `preview` capability. The application
 * then posts the preview's samples, one per request, and the answer to each one
 * is the lease: the application stops the preview when an answer says
 * `active: false`, or when `timeoutMs` passes without an answer that says
 * `active: true`. There is no stop command.
 *
 * A refused request answers an HTTP error status with a `ContractError`.
 */
export type ApplicationContractMessage =
    | RegisterRequest
    | RegisterResponse
    | EventBatch
    | EventBatchResponse
    | Command
    | CommandResult
    | ContractError
    | PreviewSample
    | PreviewAck;
/**
 * Application to agent: `POST /v1/register`. The application must register before using the other
 * operations on its socket. Registration replaces the state for that application session rather than
 * creating another application. An inference application registers at startup with an empty `models`
 * array before it has a bundle, and registers again after successful activation with the models it now
 * serves. Reopening a dropped command stream does not require another registration while the agent
 * retains the session. After `not_registered` or an agent restart, the application registers again
 * with its current active models.
 */
export type RegisterRequest =
    InferenceRunnerRegistration | WorkflowRuntimeRegistration | CustomSdkApplicationRegistration;
/**
 * The Linux runner in agent-managed mode. Its artifact is the container image it runs from. It
 * registers with empty `models` at startup, then with the single model from its active inference
 * bundle.
 */
export type InferenceRunnerRegistration = RegisterRequestCommon & {
    /**
     * The runner's input mode: camera, microphone or HTTP input. Runners report it both before and after
     * bundle activation. Optional for registrations created before mode reporting was introduced; absence
     * means unspecified.
     */
    mode?: 'camera' | 'microphone' | 'http';
    artifact: Artifact;
    /**
     * Always `inference_runner`.
     */
    kind: 'inference_runner';
};
/**
 * The kind of the activated inference bundle.
 */
export type InferenceBundleKind = 'model' | 'workflow';
/**
 * The contract's major version, the same as in the path.
 */
export type ContractVersion = 1;
/**
 * What the model produces.
 */
export type ModelType = 'classification' | 'object_detection' | 'constrained_object_detection' | 'freeform';
/**
 * A threshold of one block of the impulse, exactly as the `.eim` reports
 * it in its `model_parameters.thresholds`: the block's ID, its type, and
 * the block's numeric parameters as sibling keys. The SDK adds parameters
 * and block types with each release, so the parameters are an open map
 * rather than a closed union, and the values are numbers. The types and
 * keys the SDK reports today
 * (`edge-impulse-sdk/classifier/postprocessing/ei_postprocessing_thresholds.h`):
 *
 * | `type` | Keys |
 * | --- | --- |
 * | `classification` | `min_score` (the runner's monitor reads it; the SDK does not report it yet) |
 * | `object_detection` | `min_score`; PaddleOCR instead `min_score_pixel`, `min_score_box`,
 * `unclip_ratio` |
 * | `anomaly_gmm` | `min_anomaly_score`, for GMM, K-means and visual anomaly blocks |
 * | `object_tracking` | `keep_grace`, `max_observations`, `threshold`; SORT instead `max_age`,
 * `min_hits`, `iou_threshold` |
 * | `performance_calibration` | `average_window_duration_ms`, `detection_threshold`, `suppression_ms`,
 * `suppression_flags` |
 *
 * A model may report no classification threshold.
 */
export type BlockThreshold = {id: number; type: string} & {[parameter: string]: number | string};
/**
 * Whether this is the application's container image or its inference bundle.
 */
export type ArtifactKind = 'containerImage' | 'inferenceBundle';
/**
 * The workflow runtime serves an inference bundle of kind workflow. Its artifact identifies its image
 * or inferenceBundle; `models` lists the models from the active manifest, and is empty before the
 * first activation.
 */
export type WorkflowRuntimeRegistration = RegisterRequestCommon & {
    artifact: Artifact1;
    /**
     * Always `workflow_runtime`.
     */
    kind: 'workflow_runtime';
};
/**
 * A custom application built on the SDK. The agent reports it by its
 * `version` when it has no artifact.
 */
export type CustomSdkApplicationRegistration = RegisterRequestCommon & {
    artifact?: Artifact2;
    /**
     * Always `custom_sdk_application`.
     */
    kind: 'custom_sdk_application';
};
/**
 * Which inputs to attach to events, until a command replaces it.
 */
export type InputPolicy = InputPolicyNone | InputPolicyFraction | InputPolicyAll;
/**
 * One inference of the application.
 */
export type InferenceEvent = FailedInferenceEvent | CompletedInferenceEvent;
/**
 * The inference failed, in one model or before any ran.
 */
export type FailedInferenceEvent = InferenceEventCommon & {
    failure: InferenceFailure;
    /**
     * The results of the models that did finish, if any.
     */
    results?: ModelResult[];
};
/**
 * The input, when the input policy selected it. An image is what the model received, so the
 * coordinates of the results are in its pixels. An application that attaches another image of the same
 * frame sets `resized` and `resizeMode` in each image model's result, with `originalWidth` and
 * `originalHeight` the size of the attached image.
 */
export type Input = InlineInput | SpoolInput;
/**
 * In the message, base64 encoded. Up to the inline size limit.
 */
export type InlineInput = InputCommon & {
    /**
     * The bytes, base64 encoded.
     */
    bufferBase64: string;
    /**
     * Always `inline`.
     */
    location: 'inline';
};
/**
 * The input's format.
 */
export type InputFormat = 'jpg' | 'wav' | 'cbor' | 'json';
/**
 * A file in the spool directory, which the agent copies if it keeps the
 * input and otherwise ignores.
 */
export type SpoolInput = InputCommon & {
    /**
     * Always `spool`.
     */
    location: 'spool';
    /**
     * The name of a file directly in the spool directory, without a directory
     * part. The agent refuses other paths, symbolic links and files with other
     * hard links.
     */
    path: string;
    /**
     * The file's size, so the agent can apply its budget before reading it.
     */
    sizeBytes: number;
};
/**
 * How the input image was resized, for image models.
 */
export type ResizeMode = 'none' | 'fit-shortest' | 'fit-longest' | 'squash';
/**
 * Every model finished. One result per model, at least one. `failure` is forbidden, so a failed event
 * never matches this variant.
 */
export type CompletedInferenceEvent = InferenceEventCommon & {
    /**
     * One result per model that ran on the input, at least one.
     *
     * @minItems 1
     */
    results: [ModelResult, ...ModelResult[]];
    failure?: never;
};
/**
 * Agent to application: one event of the command stream.
 */
export type Command = ActivateBundleCommand | UpdateInputPolicyCommand | CaptureCommand | StartPreviewCommand;
/**
 * Activate a staged inference bundle. Needs the `activateBundle` capability. The application reads
 * manifest.json from the bundle directory and registers again with the models it now serves.
 */
export type ActivateBundleCommand = CommandCommon & {
    bundle: InferenceBundle;
    /**
     * Always `activateBundle`.
     */
    type: 'activateBundle';
};
/**
 * A single-model bundle for the runner or a workflow bundle for the workflow runtime.
 */
export type InferenceBundleKind1 = 'model' | 'workflow';
/**
 * Replace the input policy from the registration.
 */
export type UpdateInputPolicyCommand = CommandCommon & {
    inputPolicy: InputPolicy1;
    /**
     * Always `updateInputPolicy`.
     */
    type: 'updateInputPolicy';
};
/**
 * The new input policy.
 */
export type InputPolicy1 = InputPolicyNone | InputPolicyFraction | InputPolicyAll;
/**
 * Take one sample from a sensor. Needs the `capture` capability.
 */
export type CaptureCommand = CommandCommon & {
    capture: CaptureRequest;
    /**
     * Always `capture`.
     */
    type: 'capture';
};
/**
 * Start a live preview of a sensor. Needs the `preview` capability. The command's ID is the preview's
 * ID. The application answers once it is ready to post samples, without waiting for the first one. The
 * agent waits up to 5 seconds for the command result after sending the command, including the time to
 * post the result. If that deadline expires, it ends the preview and may refuse a later result with
 * `unknown_command`. This startup deadline is separate from the sample lease in `timeoutMs`. The same
 * ID again while that preview runs changes nothing; another ID for the same sensor ends the running
 * preview and starts this one. There is no stop command: the answer to each `PreviewSample` is the
 * lease.
 */
export type StartPreviewCommand = CommandCommon & {
    preview: PreviewRequest;
    /**
     * Always `startPreview`.
     */
    type: 'startPreview';
};
/**
 * Application to agent: `POST /v1/commands/{commandId}/result`. The result names the command's type
 * and whether it succeeded, so a successful `capture` must carry its sample, and the agent checks the
 * type against the command it sent. If the agent no longer waits for the command, it may answer
 * `unknown_command`.
 */
export type CommandResult = CommandFailure | CaptureResult | CommandSuccess;
/**
 * The command's type.
 */
export type CommandType = 'activateBundle' | 'updateInputPolicy' | 'capture' | 'startPreview';
/**
 * The sample's bytes, inline or in the spool.
 */
export type Input1 = InlineInput | SpoolInput;
/**
 * Always `capture`.
 */
export type CaptureResultType = 'capture';
/**
 * The command's type.
 */
export type PlainCommandType = 'activateBundle' | 'updateInputPolicy' | 'startPreview';
/**
 * Why the request was refused.
 */
export type ContractErrorCode =
    'invalid_request' | 'not_registered' | 'rate_limited' | 'unknown_command' | 'unsupported_version' | 'internal';
/**
 * Application to agent: `POST /v1/preview`. One sample of a running preview, at most `maxPerSecond` of
 * them. Samples are not events: the agent shows the latest one and keeps none. The application never
 * queues samples, skips one while a post of the same preview is in progress, and does not retry a
 * refused one. A refused or failed post neither renews the lease nor stops the preview. The agent
 * refuses a sample with `not_registered` (`409`); with `invalid_request` (`400`) when the body is not
 * valid, the application did not declare the `preview` capability, or a frame is over `maxFrameBytes`
 * or not a JPEG; and with `rate_limited` (`429`) over `maxPerSecond`. The agent answers `active:
 * false` to a sample of a preview it has ended.
 */
export type PreviewSample = PreviewFrame | PreviewLevel;
/**
 * A camera frame.
 */
export type PreviewFrame = PreviewSampleCommon & {
    /**
     * The frame as a JPEG, in standard base64, at most `maxWidth` by `maxHeight` pixels and
     * `maxFrameBytes` bytes. Always inline, never in the spool.
     */
    jpegBase64: string;
    /**
     * Always `frame`.
     */
    type: 'frame';
};
/**
 * A microphone level over the audio since the previous sample.
 */
export type PreviewLevel = PreviewSampleCommon & {
    /**
     * The peak level in dB relative to full scale, from -120 to 0.
     */
    peakDbfs: number;
    /**
     * The RMS level in dB relative to full scale, from -120 (silence) to 0.
     */
    rmsDbfs: number;
    /**
     * Always `level`.
     */
    type: 'level';
};

/**
 * The fields every variant of `RegisterRequest` shares.
 */
export interface RegisterRequestCommon {
    activeBundle?: ActiveInferenceBundle;
    /**
     * What the application can do beyond posting events, from
     * [`capability`]. Unknown names are ignored.
     */
    capabilities?: string[];
    contractVersion: ContractVersion;
    /**
     * A snapshot of the models the application currently serves. An inference application sends an empty
     * array on its initial registration before a bundle is active. After successful activation it replaces
     * the registration with the models from the active bundle. A registration used to recover a lost agent
     * session reports the models that remain active in the application.
     */
    models: ModelRegistration[];
    /**
     * The sensors the application can capture from, with the names and
     * frequencies Studio validates. The agent declares them in Hello.
     */
    sensors?: Sensor[];
    /**
     * The application's software version: the runner's version, for example.
     */
    version: string;
}
/**
 * The complete verified active bundle, reported by bundleIdentity peers independently of their image
 * artifact.
 */
export interface ActiveInferenceBundle {
    /**
     * The activated bundle version, independent of its models' individual versions.
     */
    deploymentVersion: number;
    kind: InferenceBundleKind;
    /**
     * The verified content digest defined by InferenceBundle.digest.
     */
    digest: string;
}
/**
 * One model the application serves from its active inference bundle, with identity fields from
 * manifest.json and runtime model information.
 */
export interface ModelRegistration {
    /**
     * The deployment version of the impulse the model was built from.
     */
    deploymentVersion: number;
    /**
     * The inference engine, as the `.eim` names it: `tflite`, `tensorrt`,
     * `qnn`.
     */
    engine: string;
    /**
     * The bundle-local model ID from manifest.json, which events refer to. Unique within the application.
     */
    id: string;
    /**
     * The impulse within the project.
     */
    impulseId: number;
    /**
     * The model's labels, in the order its output uses.
     */
    labels: string[];
    modelType: ModelType;
    /**
     * The Studio project the model was built in. The agent opens one
     * Remote Management session per project.
     */
    projectId: number;
    /**
     * The project's name, which the agent's Hello reports to Studio.
     */
    projectName?: string;
    /**
     * The project owner's name, which the agent's Hello reports to Studio.
     */
    projectOwner?: string;
    /**
     * The model's per-block thresholds, as the `.eim` reports them. May be empty.
     */
    thresholds?: BlockThreshold[];
}
/**
 * A sensor a device offers for sampling, as Hello declares it. Remote
 * Management requires at least one frequency unless the name starts with
 * `Camera` or `Video`.
 */
export interface Sensor {
    /**
     * Supported sampling frequencies, in hertz. Empty for a camera.
     */
    frequencies: number[];
    /**
     * The longest sample this sensor can take, in seconds.
     */
    maxSampleLengthS: number;
    /**
     * `Camera (WxH)` or `Microphone` in the demo, as Studio validates them.
     */
    name: string;
}
/**
 * The container image the runner runs from; the bundle it serves is represented by `models`.
 */
export interface Artifact {
    /**
     * The image or inference bundle digest, when the application knows it.
     */
    digest?: string;
    kind: ArtifactKind;
    /**
     * The container image reference or the inference bundle directory.
     */
    reference: string;
}
/**
 * The container image the runtime runs from or the inferenceBundle it serves; the active bundle's
 * models are reported in `models`.
 */
export interface Artifact1 {
    /**
     * The image or inference bundle digest, when the application knows it.
     */
    digest?: string;
    kind: ArtifactKind;
    /**
     * The container image reference or the inference bundle directory.
     */
    reference: string;
}
/**
 * The artifact, when something deploys the application.
 */
export interface Artifact2 {
    /**
     * The image or inference bundle digest, when the application knows it.
     */
    digest?: string;
    kind: ArtifactKind;
    /**
     * The container image reference or the inference bundle directory.
     */
    reference: string;
}
/**
 * Agent to application: the answer to a registration.
 */
export interface RegisterResponse {
    /**
     * The agent marks the application unhealthy when its command stream has
     * been down for longer than this. Announced so the application reconnects
     * well within it.
     */
    commandStreamTimeoutS?: number;
    /**
     * Inputs up to this size travel inline; larger ones go to the spool.
     */
    inlineSizeLimitBytes: number;
    inputPolicy: InputPolicy;
    /**
     * The spool directory shared with the agent, as the application sees it.
     * Absent when the application has no spool and must drop larger inputs.
     */
    spoolDirectory?: string;
    /**
     * The ID the agent gave this application.
     */
    applicationId: string;
}
/**
 * Attach no input. `fraction` is forbidden in this mode.
 */
export interface InputPolicyNone {
    /**
     * Always `none`.
     */
    mode: 'none';
    fraction?: never;
}
/**
 * Attach this fraction of inputs, 0 to 1.
 */
export interface InputPolicyFraction {
    /**
     * The fraction of inputs to attach, 0 to 1.
     */
    fraction: number;
    /**
     * Always `fraction`.
     */
    mode: 'fraction';
    /**
     * At most this many inputs per second.
     */
    maxPerSecond?: number;
}
/**
 * Attach every input. `fraction` is forbidden in this mode.
 */
export interface InputPolicyAll {
    /**
     * Always `all`.
     */
    mode: 'all';
    fraction?: never;
    /**
     * At most this many inputs per second.
     */
    maxPerSecond?: number;
}
/**
 * Application to agent: `POST /v1/events`.
 */
export interface EventBatch {
    /**
     * The events since the last batch, oldest first. At least one.
     *
     * @minItems 1
     */
    events: [InferenceEvent, ...InferenceEvent[]];
}
/**
 * The fields every variant of `InferenceEvent` shares.
 */
export interface InferenceEventCommon {
    /**
     * When the input was captured, if the application knows it.
     */
    captureTimestamp?: number;
    /**
     * Unique within the application, so a retried batch is idempotent.
     */
    id: string;
    /**
     * When the inference ran.
     */
    inferenceTimestamp: number;
    input?: Input;
}
/**
 * The fields every variant of `Input` shares.
 */
export interface InputCommon {
    /**
     * A reference to the original capture the input was cut from, when the
     * application keeps one.
     */
    captureRef?: string;
    type: InputFormat;
}
/**
 * What failed.
 */
export interface InferenceFailure {
    /**
     * The model that failed, when one did; absent when the input could not
     * be read at all.
     */
    modelId?: string;
    /**
     * What went wrong, for a person reading the records.
     */
    reason: string;
}
/**
 * The result of one model on one input.
 */
export interface ModelResult {
    /**
     * A note from the `.eim`, when it returns one.
     */
    info?: string;
    /**
     * The model's ID from the registration.
     */
    modelId: string;
    result: InferenceResult;
    timing: InferenceTiming;
}
/**
 * The model's result, as the `.eim` returns it.
 */
export interface InferenceResult {
    /**
     * Score of a GMM or K-means anomaly block.
     */
    anomaly?: number;
    /**
     * Detections of an object detection model.
     */
    bounding_boxes?: BoundingBox[];
    /**
     * Score per label of a classification model.
     */
    classification?: {
        [k: string]: number;
    };
    /**
     * The raw output tensors of a freeform model, one row per output.
     */
    freeform?: number[][];
    /**
     * Detections with identities, from an object tracking block.
     */
    object_tracking?: TrackedObject[];
    resizeMode?: ResizeMode;
    resized?: Resized;
    /**
     * Cells of a visual anomaly model above its threshold.
     */
    visual_anomaly_grid?: BoundingBox[];
    /**
     * The highest anomaly score over the whole grid.
     */
    visual_anomaly_max?: number;
    /**
     * The mean anomaly score over the whole grid.
     */
    visual_anomaly_mean?: number;
}
/**
 * A detection, or one cell of a visual anomaly grid.
 */
export interface BoundingBox {
    /**
     * Height in pixels.
     */
    height: number;
    /**
     * The detected label.
     */
    label: string;
    /**
     * The score of the detection, or the anomaly score of the cell.
     */
    value: number;
    /**
     * Width in pixels.
     */
    width: number;
    /**
     * Left edge, in pixels of the model's input.
     */
    x: number;
    /**
     * Top edge, in pixels of the model's input.
     */
    y: number;
}
/**
 * A detection with the identity an object tracking block assigned to it.
 */
export interface TrackedObject {
    /**
     * Height in pixels.
     */
    height: number;
    /**
     * The detected label.
     */
    label: string;
    /**
     * Stable across frames while the tracker follows the object.
     */
    object_id: number;
    /**
     * The score of the detection.
     */
    value: number;
    /**
     * Width in pixels.
     */
    width: number;
    /**
     * Left edge, in pixels of the model's input.
     */
    x: number;
    /**
     * Top edge, in pixels of the model's input.
     */
    y: number;
}
/**
 * The input image's size before and after resizing.
 */
export interface Resized {
    /**
     * Height after resizing.
     */
    newHeight: number;
    /**
     * Width after resizing.
     */
    newWidth: number;
    /**
     * Height of the captured image.
     */
    originalHeight: number;
    /**
     * Width of the captured image.
     */
    originalWidth: number;
}
/**
 * Time spent in each stage.
 */
export interface InferenceTiming {
    /**
     * Zero when the model has no anomaly block.
     */
    anomaly: number;
    /**
     * Time in the learn block.
     */
    classification: number;
    /**
     * Time in the DSP blocks.
     */
    dsp: number;
    /**
     * Present when the impulse has a postprocessing block.
     */
    postprocessing?: number;
}
/**
 * Agent to application: the answer to a batch. The device agent accepts the
 * whole batch or refuses the request, so `accepted` is the number of events in
 * the batch, deduplicated events included, and `dropped` is zero.
 */
export interface EventBatchResponse {
    /**
     * Events of the batch the agent accepted, counting the ones it had
     * already accepted under the same event ID, so a retried batch is accepted
     * again without being kept twice.
     */
    accepted: number;
    /**
     * Events of the batch the agent dropped. The device agent always returns
     * zero because it refuses a whole batch with `rate_limited` instead of partly
     * accepting it.
     */
    dropped: number;
}
/**
 * The fields every variant of `Command` shares.
 */
export interface CommandCommon {
    /**
     * Unique per application. The result names it. Delivery is at least once,
     * so the application handles another command with the same ID idempotently.
     */
    id: string;
}
/**
 * The staged inference bundle to activate; its manifest.json describes the models.
 */
export interface InferenceBundle {
    /**
     * The bundle's deployment version, as Studio names it.
     */
    deploymentVersion: number;
    /**
     * The bundle's digest, when the agent verified it. For bundleIdentity peers, use sha256:<lowercase
     * hex> over the byte string: UTF-8 edge-impulse-bundle-v1 followed by NUL, then every manifest-listed
     * file plus manifest.json, sorted by UTF-8 relative path bytes. Each entry is its path byte length as
     * unsigned 64-bit big-endian, its UTF-8 path, its file byte length as unsigned 64-bit big-endian, then
     * its raw file bytes. Include the workflow file for workflow bundles; include each path once. This
     * includes workflow-only changes and is independent of the directory's location. Applications verify
     * this identity before reporting activeBundle.
     */
    digest?: string;
    kind: InferenceBundleKind1;
    /**
     * The staged directory containing manifest.json, as the application sees it.
     */
    path: string;
}
/**
 * What to capture.
 */
export interface CaptureRequest {
    /**
     * How long to record, for a microphone. Absent for a camera, which
     * takes one frame.
     */
    lengthMs?: number;
    /**
     * The sensor's name from the registration.
     */
    sensor: string;
}
/**
 * What to preview and within which limits.
 */
export interface PreviewRequest {
    /**
     * The largest JPEG to post, in bytes, for a camera. A larger frame is skipped.
     */
    maxFrameBytes?: number;
    /**
     * The tallest frame to post, in pixels, for a camera. A taller source is scaled down.
     */
    maxHeight?: number;
    /**
     * The most samples to post per second.
     */
    maxPerSecond: number;
    /**
     * The widest frame to post, in pixels, for a camera. A wider source is scaled down.
     */
    maxWidth?: number;
    /**
     * The sensor's name from the registration.
     */
    sensor: string;
    /**
     * The application stops the preview if it receives no `active: true` response within this time.
     */
    timeoutMs: number;
}
/**
 * The command failed.
 */
export interface CommandFailure {
    /**
     * The command's ID.
     */
    commandId: string;
    /**
     * Why the command failed.
     */
    reason: string;
    /**
     * Always `false`.
     */
    success: false;
    type: CommandType;
}
/**
 * A `capture` command succeeded, with its sample.
 */
export interface CaptureResult {
    capture: CaptureSample;
    /**
     * The command's ID.
     */
    commandId: string;
    /**
     * Always `true`.
     */
    success: true;
    type: CaptureResultType;
}
/**
 * The sample.
 */
export interface CaptureSample {
    input: Input1;
    metadata: CaptureMetadata;
}
/**
 * What the application knows about the sample.
 */
export interface CaptureMetadata {
    /**
     * When the capture started.
     */
    capturedAt: number;
    /**
     * Recording length, for a microphone.
     */
    durationMs?: number;
    /**
     * Anything else, as strings, which the upload's metadata carries.
     */
    extra?: {
        [k: string]: string;
    };
    /**
     * Image height in pixels, for a camera.
     */
    height?: number;
    /**
     * Sample rate, for a microphone.
     */
    sampleRateHz?: number;
    /**
     * The sensor's name from the registration.
     */
    sensor: string;
    /**
     * Image width in pixels, for a camera.
     */
    width?: number;
}
/**
 * Any other command succeeded.
 */
export interface CommandSuccess {
    /**
     * The command's ID.
     */
    commandId: string;
    /**
     * Always `true`.
     */
    success: true;
    type: PlainCommandType;
}
/**
 * Agent to application: the body of an HTTP error response.
 */
export interface ContractError {
    code: ContractErrorCode;
    /**
     * Detail for a person reading the application's log.
     */
    message: string;
}
/**
 * The fields every variant of `PreviewSample` shares.
 */
export interface PreviewSampleCommon {
    /**
     * When the sample was taken.
     */
    capturedAt: number;
    /**
     * The ID of the `startPreview` command that started the preview.
     */
    previewId: string;
}
/**
 * Agent to application: the answer to a `PreviewSample`. It is the preview's lease.
 */
export interface PreviewAck {
    /**
     * Whether the agent still wants this preview. On `false` the application stops it at once. An answer
     * with `true` renews the lease of `timeoutMs`.
     */
    active: boolean;
}
