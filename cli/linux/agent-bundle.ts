import { createHash } from 'node:crypto';
import fs from 'node:fs';
import Path from 'node:path';
import semver from 'semver';
import { ActivateBundleCommand, InferenceBundle } from '../../shared/device-protocol/workload-contract';
import { BundleModel, ModelBundleManifest } from '../../shared/device-protocol/inference-bundle-manifest';
import { validateInferenceBundleManifest } from '../../shared/device-protocol/validators';
import {
    LinuxImpulseRunner,
    ModelInformation,
    RunnerHelloInferencingEngine,
} from '../../library/classifier/linux-impulse-runner';
import { RunnerDownloader } from './runner-downloader';
import { agentEngineName } from './agent-runner-metadata';

/** Bundle artifacts that passed every check available without starting model code. */
export type ValidatedAgentBundle = {
    // Workload contract identity and location supplied by the activateBundle command.
    bundle: InferenceBundle;
    // Validated manifest read from the staged bundle directory.
    manifest: ModelBundleManifest;
    // Single model entry selected from the manifest for this inference runner.
    manifestModel: BundleModel;
    // Canonical executable path contained within the staged bundle directory.
    modelPath: string;
};

/** Validated bundle paired with its initialized and runtime-checked model process. */
export type PreparedAgentBundle = ValidatedAgentBundle & {
    // Metadata reported by the initialized .eim process.
    model: ModelInformation;
    // Unmodified .eim metadata retained for agent registration before runtime overrides are applied.
    registrationModel: ModelInformation;
    // Initialized process ready to become the runner's initial active model.
    runner: LinuxImpulseRunner;
};

/** Host compatibility values used for filesystem-only bundle validation. */
export type ValidateAgentBundleOptions = {
    // Optional target override used by the ordinary Linux runner target detector.
    forceTarget?: string;
    // Version of this runner package, checked against the manifest's minimum runtime version.
    packageVersion: string;
};

/** Process settings and runtime constraints used to initialize a validated bundle. */
export type PrepareAgentBundleOptions = {
    // Exposes a runner immediately after construction so shutdown can stop an in-progress init.
    onRunnerCreated?: (runner: LinuxImpulseRunner) => void;
    // Configured input mode checked against the sensor type reported by the initialized model.
    servingMode?: 'camera' | 'microphone' | 'http';
    // Shared-memory transport setting forwarded to the staged .eim runner.
    shmBehavior: 'auto' | 'always' | 'never';
    // Complete .eim startup budget, including accelerator warm-up.
    startupTimeoutMs: number;
    // Enables verbose output from the staged .eim runner.
    verbose: boolean;
};

/** Preparation failure carrying an unconfirmed model-process cleanup, when cleanup also failed. */
export class AgentBundlePreparationError extends Error {
    readonly cleanupError: Error | undefined;

    /** Preserves preparation and cleanup failures so the lifecycle can retain process ownership. */
    constructor(preparationError: Error, cleanupError?: Error) {
        super(cleanupError ?
            `Cannot prepare bundle model: ${preparationError.message}; ` +
                `failed to stop model process: ${cleanupError.message}` :
            `Cannot prepare bundle model: ${preparationError.message}`);
        this.cleanupError = cleanupError;
    }
}

/**
 * Resolves an agent-staged bundle and checks every property available without executing its model.
 *
 * @param command Agent command identifying the staged bundle and expected deployment version.
 * @param options Host values used to check target and minimum runtime compatibility.
 */
export async function validateAgentBundle(
    command: ActivateBundleCommand,
    options: ValidateAgentBundleOptions
): Promise<ValidatedAgentBundle> {
    if (command.bundle.kind !== 'model') {
        throw new Error(`Cannot activate bundle kind "${command.bundle.kind}" in the inference runner`);
    }

    const bundlePath = await realpathWithContext(command.bundle.path, 'bundle directory');
    const bundleStat = await fs.promises.stat(bundlePath);
    if (!bundleStat.isDirectory()) {
        throw new Error(`Bundle path is not a directory: ${command.bundle.path}`);
    }

    // Resolve symlinks before reading either artifact. A staged bundle must not be able to select a
    // manifest or executable elsewhere on the host through `..` traversal or a symlink.
    const manifestPath = await containedRealpath(bundlePath, Path.join(bundlePath, 'manifest.json'), 'manifest');
    let parsedManifest: unknown;
    try {
        parsedManifest = JSON.parse(await fs.promises.readFile(manifestPath, 'utf-8'));
    }
    catch (ex2) {
        const ex = <Error>ex2;
        throw new Error(`Cannot read bundle manifest: ${ex.message || ex.toString()}`);
    }

    if (!validateInferenceBundleManifest(parsedManifest)) {
        const validationError = validateInferenceBundleManifest.errors?.[0];
        throw new Error(`Bundle manifest is invalid at ${validationError?.instancePath || '/'}: ` +
            `${validationError?.message || 'schema mismatch'}`);
    }
    if (parsedManifest.kind !== 'model' || parsedManifest.models.length !== 1) {
        throw new Error('Inference runner requires a model bundle containing exactly one model');
    }
    const manifest = parsedManifest;
    const manifestModel = manifest.models[0];

    if (manifestModel.deploymentVersion !== command.bundle.deploymentVersion) {
        throw new Error(`Bundle deployment version ${command.bundle.deploymentVersion} does not match ` +
            `manifest model version ${manifestModel.deploymentVersion}`);
    }
    const target = await RunnerDownloader.getDeploymentType(options.forceTarget);
    if (manifest.target !== target) {
        throw new Error(`Bundle target "${manifest.target}" does not match runner target "${target}"`);
    }
    if (!semver.gte(options.packageVersion, manifest.runtime.minVersion)) {
        throw new Error(`Bundle requires inference runner ${manifest.runtime.minVersion} or later; ` +
            `this runner is ${options.packageVersion}`);
    }

    const modelPath = await containedRealpath(bundlePath, Path.resolve(bundlePath, manifestModel.path), 'model file');
    const modelStat = await fs.promises.stat(modelPath);
    if (!modelStat.isFile()) {
        throw new Error(`Bundle model is not a regular file: ${manifestModel.path}`);
    }
    const permissions = modelStat.mode % 0o1000;
    const executable = permissions % 2 === 1 ||
        Math.floor(permissions / 0o10) % 2 === 1 ||
        Math.floor(permissions / 0o100) % 2 === 1;
    if (!executable) {
        throw new Error(`Bundle model is not executable: ${manifestModel.path}`);
    }
    const sha256 = await fileSha256(modelPath);
    if (sha256.toLowerCase() !== manifestModel.sha256.toLowerCase()) {
        throw new Error(`Bundle model checksum does not match manifest: ${manifestModel.path}`);
    }

    return {
        bundle: command.bundle,
        manifest,
        manifestModel,
        modelPath,
    };
}

/**
 * Starts a validated bundle's `.eim` and verifies its runtime metadata against the manifest.
 *
 * @param validated Bundle artifacts already checked without executing model code.
 * @param options Process settings and serving mode used for runtime compatibility checks.
 */
export async function prepareAgentBundle(
    validated: ValidatedAgentBundle,
    options: PrepareAgentBundleOptions
): Promise<PreparedAgentBundle> {
    const runner = new LinuxImpulseRunner(validated.modelPath, {
        verbose: options.verbose,
        shmBehavior: options.shmBehavior,
        startupTimeoutMs: options.startupTimeoutMs,
    });
    options.onRunnerCreated?.(runner);
    try {
        const model = await runner.init();
        validateModelMetadata(model, validated.manifest, validated.manifestModel, options.servingMode);
        return { ...validated, model, registrationModel: structuredClone(model), runner };
    }
    catch (ex2) {
        const preparationError = ex2 instanceof Error ? ex2 : new Error(String(ex2));
        try {
            await runner.stop();
        }
        catch (cleanupError) {
            throw new AgentBundlePreparationError(
                preparationError,
                cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError))
            );
        }
        throw new AgentBundlePreparationError(preparationError);
    }
}

/**
 * Verifies that runtime metadata reported by a staged `.eim` describes the same model as its
 * manifest and can be served through the input pipeline already owned by this process.
 *
 * @param model Metadata returned by the staged `.eim` hello response.
 * @param manifest Validated bundle manifest containing target and runtime declarations.
 * @param manifestModel Single model entry selected from the bundle manifest.
 * @param servingMode Existing camera, microphone, or HTTP serving mode, when already known.
 */
function validateModelMetadata(
    model: ModelInformation,
    manifest: ModelBundleManifest,
    manifestModel: BundleModel,
    servingMode: PrepareAgentBundleOptions['servingMode']
): void {
    if (model.project.id !== manifestModel.projectId) {
        throw new Error(`.eim project ${model.project.id} does not match manifest project ${manifestModel.projectId}`);
    }
    if (model.project.deploy_version !== manifestModel.deploymentVersion) {
        throw new Error(`.eim deployment version ${model.project.deploy_version} does not match ` +
            `manifest version ${manifestModel.deploymentVersion}`);
    }
    if (model.modelParameters.model_type !== manifestModel.modelType) {
        throw new Error(`.eim model type "${model.modelParameters.model_type}" does not match ` +
            `manifest type "${manifestModel.modelType}"`);
    }
    if (!engineIsCompatible(manifest.target, manifestModel.engine, model)) {
        throw new Error(`.eim engine is not compatible with manifest engine "${manifestModel.engine}" ` +
            `and target "${manifest.target}"`);
    }

    if (model.modelParameters.inferencing_engine === RunnerHelloInferencingEngine.VlmConnector) {
        throw new Error('VLM bundles are not supported by the agent-managed inference runner');
    }

    const sensorType = model.modelParameters.sensorType;
    if ((servingMode === 'camera' || servingMode === 'microphone') && sensorType !== servingMode) {
        throw new Error(`Bundle sensor type "${sensorType}" does not match runner mode "${servingMode}"`);
    }
    if (servingMode === 'http' && sensorType !== 'camera' && sensorType !== 'microphone' &&
        sensorType !== 'accelerometer' && sensorType !== 'positional') {
        throw new Error(`Bundle sensor type "${sensorType}" is not supported in HTTP mode`);
    }
    if (!servingMode && sensorType !== 'camera' && sensorType !== 'microphone') {
        throw new Error(`Bundle sensor type "${sensorType}" requires the runner to use HTTP mode`);
    }
}

/**
 * Determines whether `.eim` engine metadata is compatible with the manifest declaration. Older
 * runners expose a numeric engine ID, while accelerated targets can expose the engine only through
 * target or engine-property strings, so all three representations are considered.
 *
 * @param target Deployment target recorded by the manifest.
 * @param manifestEngine Stable engine name recorded by the manifest.
 * @param model Metadata returned by the staged `.eim` hello response.
 */
function engineIsCompatible(target: string, manifestEngine: string, model: ModelInformation): boolean {
    const engine = model.modelParameters.inferencing_engine;
    const helloEngine = typeof engine === 'number' ? agentEngineName(engine) : 'unknown';
    if (helloEngine === manifestEngine) {
        return true;
    }
    // Some hardware-specific `.eim` files do not have a one-to-one numeric engine mapping. Their
    // target name or inferencing-engine properties still carry the stable manifest engine name.
    const normalizedEngine = manifestEngine.toLowerCase();
    const properties = (model.inferencingEngine?.properties || []).map(property => property.toLowerCase());
    return target.toLowerCase().includes(normalizedEngine) ||
        properties.some(property => property.includes(normalizedEngine));
}

/**
 * Resolves a bundle artifact and rejects traversal or symlinks that escape the staged directory.
 *
 * @param bundlePath Canonical path to the staged bundle directory.
 * @param path Candidate artifact path to resolve.
 * @param description Human-readable artifact name used in errors.
 */
async function containedRealpath(bundlePath: string, path: string, description: string): Promise<string> {
    const resolved = await realpathWithContext(path, description);
    const relative = Path.relative(bundlePath, resolved);
    if (relative === '..' || relative.startsWith(`..${Path.sep}`) || Path.isAbsolute(relative)) {
        throw new Error(`Bundle ${description} resolves outside the bundle directory`);
    }
    return resolved;
}

/**
 * Resolves a canonical filesystem path while preserving bundle-specific error context.
 *
 * @param path Filesystem path to resolve.
 * @param description Human-readable bundle path name used in errors.
 */
async function realpathWithContext(path: string, description: string): Promise<string> {
    try {
        return await fs.promises.realpath(path);
    }
    catch (ex2) {
        const ex = <Error>ex2;
        throw new Error(`Cannot resolve bundle ${description}: ${ex.message || ex.toString()}`);
    }
}

/**
 * Calculates a file's SHA-256 digest without loading a potentially large model into memory.
 *
 * @param path Path to the model executable.
 */
async function fileSha256(path: string): Promise<string> {
    const hash = createHash('sha256');
    await new Promise<void>((resolve, reject) => {
        const stream = fs.createReadStream(path);
        stream.on('data', chunk => hash.update(chunk));
        stream.on('error', reject);
        stream.on('end', resolve);
    });
    return hash.digest('hex');
}
