import assert from 'node:assert';
import fs from 'node:fs/promises';
import os from 'node:os';
import Path from 'node:path';
import { prepareAgentBundle, validateAgentBundle } from '../cli/linux/agent-bundle';
import { RunnerHelloInferencingEngine } from '../library/classifier/linux-impulse-runner';
import { writeBundle } from './utils/agent-runner-fixtures';

const validation = { forceTarget: 'test-target', packageVersion: '1.26.1' };
const preparation = { shmBehavior: 'never' as const, startupTimeoutMs: 1000, verbose: false,
    servingMode: 'http' as const };

describe('agent bundle validation and preparation', () => {
    let root: string;
    beforeEach(async () => { root = await fs.mkdtemp(Path.join(os.tmpdir(), 'ei-preparation-')); });
    afterEach(async () => { await fs.rm(root, { recursive: true, force: true }); });

    it('prepares a producer-shaped bundle with stable identity and cleans up its child', async () => {
        const pidPath = Path.join(root, 'child.pid');
        const command = await writeBundle(root, { deploymentVersion: 7, producerLayout: true,
            classifyScore: 0.7, mock: { pidPath } });
        const listeners = process.listenerCount('exit');
        const bundle = await prepareAgentBundle(await validateAgentBundle(command, validation), preparation);
        try {
            assert.strictEqual(bundle.manifestModel.id, 'impulse-1');
            assert.strictEqual(bundle.manifestModel.path, 'models/model.eim');
            assert.strictEqual(bundle.bundle.digest, undefined);
            assert.strictEqual(bundle.model.project.deploy_version, 7);
            assert.strictEqual((await bundle.runner.classify([ 1 ])).result.classification?.value, 0.7);
        }
        finally { await bundle.runner.stop(); }
        const pid = Number(await fs.readFile(pidPath, 'utf8'));
        assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
        assert.strictEqual(process.listenerCount('exit'), listeners);
    });

    for (const incompatible of [
        { name: 'manifest version', change: { manifestVersion: 2 }, error: /manifest is invalid/i },
        { name: 'target', change: { target: 'runner-linux-aarch64' }, error: /does not match runner target/ },
        { name: 'minimum runtime', change: { runtime: { kind: 'inference_runner', minVersion: '2.0.0' } },
            error: /requires inference runner/ },
        { name: 'semantic version', change: { runtime: { kind: 'inference_runner', minVersion: 'invalid' } },
            error: /manifest is invalid/i },
        { name: 'empty model list', change: { models: [] }, error: /manifest is invalid|exactly one model/i },
    ]) {
        it(`rejects ${incompatible.name} before starting model code`, async () => {
            const pidPath = Path.join(root, 'child.pid');
            const command = await writeBundle(root, { deploymentVersion: 7, mock: { pidPath } });
            const path = Path.join(command.bundle.path, 'manifest.json');
            const manifest = JSON.parse(await fs.readFile(path, 'utf8'));
            await fs.writeFile(path, JSON.stringify({ ...manifest, ...incompatible.change }));
            await assert.rejects(validateAgentBundle(command, validation), incompatible.error);
            await assert.rejects(fs.stat(pidPath), { code: 'ENOENT' });
        });
    }

    it('rejects checksum, command version, permissions and escaping symlinks', async () => {
        const command = await writeBundle(root, { deploymentVersion: 7 });
        const path = Path.join(command.bundle.path, 'model.eim');
        await assert.rejects(validateAgentBundle({ ...command,
            bundle: { ...command.bundle, deploymentVersion: 8 } }, validation), /Bundle deployment version 8 does not match/);
        await fs.chmod(path, 0o644);
        await assert.rejects(validateAgentBundle(command, validation), /not executable/);
        await fs.chmod(path, 0o755);
        await fs.appendFile(path, '\nchanged');
        await assert.rejects(validateAgentBundle(command, validation), /checksum/);
        const outside = Path.join(root, 'outside.eim');
        await fs.rename(path, outside);
        await fs.symlink(outside, path);
        await assert.rejects(validateAgentBundle(command, validation), /outside the bundle/);
    });

    for (const mismatch of [
        { name: 'project', change: { projectId: 2 }, error: /\.eim project \d+ does not match manifest project 2$/ },
        { name: 'version', change: { deploymentVersion: 8 }, error: /\.eim deployment version \d+ does not match/ },
        { name: 'output type', change: { modelType: 'object_detection' }, error: /\.eim model type "\w+" does not match/ },
        { name: 'engine', change: { engine: 'tflite-eon' }, error: /\.eim engine is not compatible with manifest engine "tflite-eon"/ },
    ]) {
        it(`stops model code after incompatible ${mismatch.name} metadata`, async () => {
            const pidPath = Path.join(root, 'child.pid');
            const command = await writeBundle(root, { deploymentVersion: 7, mock: { pidPath } });
            const path = Path.join(command.bundle.path, 'manifest.json');
            const manifest = JSON.parse(await fs.readFile(path, 'utf8'));
            Object.assign(manifest.models[0], mismatch.change);
            command.bundle.deploymentVersion = manifest.models[0].deploymentVersion;
            await fs.writeFile(path, JSON.stringify(manifest));
            const listeners = process.listenerCount('exit');
            await assert.rejects(prepareAgentBundle(await validateAgentBundle(command, validation), preparation),
                mismatch.error);
            const pid = Number(await fs.readFile(pidPath, 'utf8'));
            assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
            assert.strictEqual(process.listenerCount('exit'), listeners);
        });
    }

    it('rejects VLM and incompatible serving modes after preparation', async () => {
        const command = await writeBundle(root, { deploymentVersion: 7, sensor: 2 });
        await assert.rejects(prepareAgentBundle(await validateAgentBundle(command, validation),
            { ...preparation, servingMode: 'camera' }), /does not match runner mode/);
        const vlm = await writeBundle(root, { deploymentVersion: 8,
            inferencingEngine: RunnerHelloInferencingEngine.VlmConnector, manifestEngine: 'vlm-connector' });
        await assert.rejects(prepareAgentBundle(await validateAgentBundle(vlm, validation), preparation), /VLM/);
    });
});
