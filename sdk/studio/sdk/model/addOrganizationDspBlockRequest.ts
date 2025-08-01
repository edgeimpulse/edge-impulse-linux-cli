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


export class AddOrganizationDspBlockRequest {
    'name': string;
    'dockerContainer': string;
    'description': string;
    'requestsCpu'?: number;
    'requestsMemory'?: number;
    'limitsCpu'?: number;
    'limitsMemory'?: number;
    'port': number;
    /**
    * Whether the source code is only available for staff users.
    */
    'sourceCodeDownloadStaffOnly'?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "dockerContainer",
            "baseName": "dockerContainer",
            "type": "string"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "requestsCpu",
            "baseName": "requestsCpu",
            "type": "number"
        },
        {
            "name": "requestsMemory",
            "baseName": "requestsMemory",
            "type": "number"
        },
        {
            "name": "limitsCpu",
            "baseName": "limitsCpu",
            "type": "number"
        },
        {
            "name": "limitsMemory",
            "baseName": "limitsMemory",
            "type": "number"
        },
        {
            "name": "port",
            "baseName": "port",
            "type": "number"
        },
        {
            "name": "sourceCodeDownloadStaffOnly",
            "baseName": "sourceCodeDownloadStaffOnly",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return AddOrganizationDspBlockRequest.attributeTypeMap;
    }
}

