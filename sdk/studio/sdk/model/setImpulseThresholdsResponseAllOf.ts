/**
 * Edge Impulse API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export class SetImpulseThresholdsResponseAllOf {
    /**
    * Whether there were model testing results available before calling this function.
    */
    'hadModelTestingResults': boolean;
    /**
    * Altering thresholds invalidates model testing results. We try to regenerate the results where possible. You\'ll get either \"not_regenerated\" (e.g. no model testing results, or dataset does not support fast regeneration, like for object detection models); \"regenerated\" (regeneration successful); \"started_job\" (regenerate is possible, but requires a job, that was kicked off - e.g. for large test sets); \"requires_job\" (requires a job, but \"allowCreatingRegenerateModelTestingJobs\" was false - start a new job manually via regenerateModelTestingSummary). If a job was started then \"regenerateModelTestingResultsJobId\" is set. 
    */
    'regenerateModelTestingStatus': SetImpulseThresholdsResponseAllOfRegenerateModelTestingStatusEnum;
    /**
    * If there previously were model testing results, and your dataset supports fast re-generation of model testing results (e.g. no object detection blocks), but your dataset is too big to re-generate results inline (e.g. >20K test set samples) - then a job is kicked off to regenerate the results. This field contains the job ID. 
    */
    'regenerateModelTestingResultsJobId'?: number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "hadModelTestingResults",
            "baseName": "hadModelTestingResults",
            "type": "boolean"
        },
        {
            "name": "regenerateModelTestingStatus",
            "baseName": "regenerateModelTestingStatus",
            "type": "SetImpulseThresholdsResponseAllOfRegenerateModelTestingStatusEnum"
        },
        {
            "name": "regenerateModelTestingResultsJobId",
            "baseName": "regenerateModelTestingResultsJobId",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return SetImpulseThresholdsResponseAllOf.attributeTypeMap;
    }
}


export type SetImpulseThresholdsResponseAllOfRegenerateModelTestingStatusEnum = 'not_regenerated' | 'regenerated' | 'started_job' | 'requires_job';
export const SetImpulseThresholdsResponseAllOfRegenerateModelTestingStatusEnumValues: string[] = ['not_regenerated', 'regenerated', 'started_job', 'requires_job'];
