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


export class WhitelabelAdminCreateProjectRequest {
    /**
    * The name of the project.
    */
    'projectName': string;
    /**
    * Unique identifier of the owner of the new project.
    */
    'ownerId'?: number;
    /**
    * Email of the owner of the new project.
    */
    'ownerEmail'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "projectName",
            "baseName": "projectName",
            "type": "string"
        },
        {
            "name": "ownerId",
            "baseName": "ownerId",
            "type": "number"
        },
        {
            "name": "ownerEmail",
            "baseName": "ownerEmail",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return WhitelabelAdminCreateProjectRequest.attributeTypeMap;
    }
}

