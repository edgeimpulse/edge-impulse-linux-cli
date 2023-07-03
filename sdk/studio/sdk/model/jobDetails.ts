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

import { Job } from './job';
import { JobDetailsAllOf } from './jobDetailsAllOf';
import { JobState } from './jobState';

export class JobDetails {
    /**
    * Job id, use this to refer back to the job. The web socket API also uses this ID.
    */
    'id': number;
    'category': string;
    /**
    * External job identifier, this can be used to categorize jobs, and recover job status. E.g. set this to \'keras-192\' for a Keras learning block with ID 192. When a user refreshes the page you can check whether a job is active for this ID and re-attach. 
    */
    'key': string;
    /**
    * When the job was created.
    */
    'created': Date;
    /**
    * When the job was started.
    */
    'started'?: Date;
    /**
    * When the job was finished.
    */
    'finished'?: Date;
    /**
    * Whether the job finished successfully.
    */
    'finishedSuccessful'?: boolean;
    /**
    * The IDs of users who should be notified when a job is finished.
    */
    'jobNotificationUids': Array<number>;
    /**
    * Additional metadata associated with this job.
    */
    'additionalInfo'?: string;
    /**
    * Job duration time in seconds from start to finished, measured by k8s job watcher.
    */
    'computeTime'?: number;
    /**
    * List of jobs children isd triggered by this job
    */
    'childrenIds'?: Array<number>;
    /**
    * List of states the job went through
    */
    'states': Array<JobState>;
    /**
    * Job specification (Kubernetes specification or other underlying engine)
    */
    'spec'?: object;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "category",
            "baseName": "category",
            "type": "string"
        },
        {
            "name": "key",
            "baseName": "key",
            "type": "string"
        },
        {
            "name": "created",
            "baseName": "created",
            "type": "Date"
        },
        {
            "name": "started",
            "baseName": "started",
            "type": "Date"
        },
        {
            "name": "finished",
            "baseName": "finished",
            "type": "Date"
        },
        {
            "name": "finishedSuccessful",
            "baseName": "finishedSuccessful",
            "type": "boolean"
        },
        {
            "name": "jobNotificationUids",
            "baseName": "jobNotificationUids",
            "type": "Array<number>"
        },
        {
            "name": "additionalInfo",
            "baseName": "additionalInfo",
            "type": "string"
        },
        {
            "name": "computeTime",
            "baseName": "computeTime",
            "type": "number"
        },
        {
            "name": "childrenIds",
            "baseName": "childrenIds",
            "type": "Array<number>"
        },
        {
            "name": "states",
            "baseName": "states",
            "type": "Array<JobState>"
        },
        {
            "name": "spec",
            "baseName": "spec",
            "type": "object"
        }    ];

    static getAttributeTypeMap() {
        return JobDetails.attributeTypeMap;
    }
}

