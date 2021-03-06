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


export class RenamePortalFileRequest {
    /**
    * S3 path (within the portal)
    */
    'oldPath': string;
    /**
    * S3 path (within the portal)
    */
    'newPath': string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "oldPath",
            "baseName": "oldPath",
            "type": "string"
        },
        {
            "name": "newPath",
            "baseName": "newPath",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return RenamePortalFileRequest.attributeTypeMap;
    }
}

