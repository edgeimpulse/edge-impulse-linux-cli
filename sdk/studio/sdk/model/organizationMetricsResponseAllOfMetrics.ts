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


export class OrganizationMetricsResponseAllOfMetrics {
    /**
    * Total compute time of all organizational jobs since the creation of the organization (including organizational project jobs). Compute time is the amount of computation time spent in jobs, in minutes used by an organization over a 12 month period, calculated as 1 x CPU + 3 x GPU minutes.
    */
    'totalJobsComputeTime': number;
    /**
    * Total compute time of all organizational jobs in the current contract (including organizational project jobs). Compute time is the amount of computation time spent in jobs, in minutes used by an organization over a 12 month period, calculated as 1 x CPU + 3 x GPU minutes.
    */
    'jobsComputeTimeCurrentYear': number;
    /**
    * The date from which the compute time for the running contract is calculated.
    */
    'jobsComputeTimeCurrentYearSince': Date;
    /**
    * CPU compute time of all jobs in the organization in the current contract (including organizational project jobs).
    */
    'cpuComputeTimeCurrentContract': number;
    /**
    * GPU compute time of all jobs in the organization in the current contract (including organizational project jobs).
    */
    'gpuComputeTimeCurrentContract': number;
    /**
    * Total storage used by the organization.
    */
    'totalStorage': number;
    /**
    * Total number of projects owned by the organization.
    */
    'projectCount': number;
    /**
    * Total number of users in the organization.
    */
    'userCount': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "totalJobsComputeTime",
            "baseName": "totalJobsComputeTime",
            "type": "number"
        },
        {
            "name": "jobsComputeTimeCurrentYear",
            "baseName": "jobsComputeTimeCurrentYear",
            "type": "number"
        },
        {
            "name": "jobsComputeTimeCurrentYearSince",
            "baseName": "jobsComputeTimeCurrentYearSince",
            "type": "Date"
        },
        {
            "name": "cpuComputeTimeCurrentContract",
            "baseName": "cpuComputeTimeCurrentContract",
            "type": "number"
        },
        {
            "name": "gpuComputeTimeCurrentContract",
            "baseName": "gpuComputeTimeCurrentContract",
            "type": "number"
        },
        {
            "name": "totalStorage",
            "baseName": "totalStorage",
            "type": "number"
        },
        {
            "name": "projectCount",
            "baseName": "projectCount",
            "type": "number"
        },
        {
            "name": "userCount",
            "baseName": "userCount",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return OrganizationMetricsResponseAllOfMetrics.attributeTypeMap;
    }
}

