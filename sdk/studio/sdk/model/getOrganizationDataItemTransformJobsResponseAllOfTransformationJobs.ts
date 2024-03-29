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


export class GetOrganizationDataItemTransformJobsResponseAllOfTransformationJobs {
    'id': number;
    'transformationJobId': number;
    'createProjectId': number;
    'created': Date;
    'jobId': number;
    'jobStarted'?: Date;
    'jobFinished'?: Date;
    'jobFinishedSuccessful'?: boolean;
    'transformationBlockName': string;
    'pipelineName'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "transformationJobId",
            "baseName": "transformationJobId",
            "type": "number"
        },
        {
            "name": "createProjectId",
            "baseName": "createProjectId",
            "type": "number"
        },
        {
            "name": "created",
            "baseName": "created",
            "type": "Date"
        },
        {
            "name": "jobId",
            "baseName": "jobId",
            "type": "number"
        },
        {
            "name": "jobStarted",
            "baseName": "jobStarted",
            "type": "Date"
        },
        {
            "name": "jobFinished",
            "baseName": "jobFinished",
            "type": "Date"
        },
        {
            "name": "jobFinishedSuccessful",
            "baseName": "jobFinishedSuccessful",
            "type": "boolean"
        },
        {
            "name": "transformationBlockName",
            "baseName": "transformationBlockName",
            "type": "string"
        },
        {
            "name": "pipelineName",
            "baseName": "pipelineName",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return GetOrganizationDataItemTransformJobsResponseAllOfTransformationJobs.attributeTypeMap;
    }
}

