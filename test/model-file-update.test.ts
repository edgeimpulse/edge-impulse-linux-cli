import assert from 'node:assert';
import * as models from '../sdk/studio';
import { chooseModelFileUpdateVariant } from '../cli/linux/runner-downloader';

const TARGET = 'runner-linux-aarch64';
const PROJECT_ID = 1;
const IMPULSE_ID = 2;

/**
 * Exercises how a runner started with --model-file picks the variant to download when Studio
 * requests a model update. The file does not record its variant and the update cannot prompt, so
 * the choice follows the startup flags, the saved choice and the project's reference variant,
 * always limited to what the deployment target supports.
 */
describe('model file update variant', () => {
    // Explicit flags beat any saved or project default, as they do at startup.
    it('downloads the variant asked for on the command line', async () => {
        const api = fakeApi([ supported('float32'), supported('int8') ], [ 'float32', 'int8' ], 'float32');

        assert.strictEqual(await choose(api, { forceVariant: 'float32', savedVariant: 'int8' }), 'float32');
        assert.strictEqual(await choose(api, { quantized: true, savedVariant: 'float32' }), 'int8');
    });

    // A flag the target cannot honour must fail the update instead of loading another variant.
    it('fails when the target cannot run the variant asked for', async () => {
        const api = fakeApi([ supported('float32'), { variant: 'int8', supported: false, hint: 'No int8 kernels' }],
            [ 'float32', 'int8' ], 'float32');

        await assert.rejects(choose(api, { quantized: true }),
            /Variant "int8" \(via --quantized\) is not supported on "runner-linux-aarch64": No int8 kernels/);
        await assert.rejects(choose(api, { forceVariant: 'akida' }),
            /Variant "akida" \(via --force-variant\) is not supported on "runner-linux-aarch64"$/);
    });

    // Without flags, the host's earlier choice for the project wins over the project's reference variant.
    it('keeps the variant saved for the project', async () => {
        const api = fakeApi([ supported('float32'), supported('int8') ], [ 'float32', 'int8' ], 'float32');

        assert.strictEqual(await choose(api, { savedVariant: 'int8' }), 'int8');
        assert.strictEqual(await choose(api, {}), 'float32');
        assert.strictEqual(await choose(api, { savedVariant: 'akida' }), 'float32');
    });

    // Saved and reference variants the target cannot run fall through to the first one it can, in API order.
    it('skips variants the target cannot run', async () => {
        const api = fakeApi([{ variant: 'float32', supported: false }, supported('int8'), supported('akida') ],
            [ 'float32', 'akida', 'int8' ], 'float32');

        assert.strictEqual(await choose(api, { savedVariant: 'float32' }), 'akida');
    });

    // An update with nothing runnable, or for a target the project does not list, must fail.
    it('fails when nothing can be deployed on the target', async () => {
        await assert.rejects(choose(fakeApi([{ variant: 'float32', supported: false }], [ 'float32' ], 'float32'), {}),
            /No available model variants can be deployed on "runner-linux-aarch64"/);
        await assert.rejects(choose(fakeApi([], [ 'float32' ], 'float32', 'runner-linux-x86_64'), {}),
            /Failed to find deployment target "runner-linux-aarch64"/);
    });
});

type FakeApi = Parameters<typeof chooseModelFileUpdateVariant>[0]['api'];

/** A variant the deployment target can run. */
function supported(variant: models.KerasModelVariantEnum): models.DeploymentTargetVariant {
    return { variant, supported: true };
}

/**
 * Studio's answers for one deployment target and one impulse. Both calls must ask about the
 * project and impulse being updated.
 */
function fakeApi(
    targetVariants: models.DeploymentTargetVariant[],
    projectVariants: models.KerasModelVariantEnum[],
    referenceVariant: models.KerasModelVariantEnum,
    targetFormat = TARGET,
): FakeApi {
    return {
        deployment: {
            listDeploymentTargetsForProjectDataSources: (projectId, queryParams) => {
                assert.deepStrictEqual([ projectId, queryParams ], [ PROJECT_ID, { impulseId: IMPULSE_ID }]);
                return Promise.resolve(<models.DeploymentTargetsResponse>{
                    success: true,
                    targets: [{ format: targetFormat, modelVariants: targetVariants }],
                });
            },
        },
        projects: {
            getModelVariants: (projectId, queryParams) => {
                assert.deepStrictEqual([ projectId, queryParams ], [ PROJECT_ID, { impulseId: IMPULSE_ID }]);
                return Promise.resolve(<models.GetModelVariantsResponse>{
                    success: true,
                    modelVariants: projectVariants.map(variant => ({
                        variant,
                        isReferenceVariant: variant === referenceVariant,
                        isEnabled: true,
                        isSelected: false,
                    })),
                });
            },
        },
    };
}

/** Runs the choice for the fake project and impulse, with no flags or saved variant unless given. */
function choose(api: FakeApi, opts: {
    forceVariant?: models.KerasModelVariantEnum,
    quantized?: boolean,
    savedVariant?: models.KerasModelVariantEnum,
}) {
    return chooseModelFileUpdateVariant({
        api,
        projectId: PROJECT_ID,
        impulseId: IMPULSE_ID,
        deploymentType: TARGET,
        forceVariant: opts.forceVariant,
        quantized: opts.quantized ?? false,
        savedVariant: opts.savedVariant ?? null,
    });
}
