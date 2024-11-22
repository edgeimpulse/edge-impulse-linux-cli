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


export class ProjectVersionRequest {
    /**
    * Data bucket ID. Keep empty to store in Edge Impulse hosted storage.
    */
    'bucketId'?: number;
    'description': string;
    /**
    * Whether to make this version available on a public URL.
    */
    'makePublic': boolean;
    /**
    * Whether to run model testing when creating this version (if this value is omitted, it will use the current state of \'runModelTestingWhileVersioning\' that is returned in ListVersionsResponse).
    */
    'runModelTestingWhileVersioning'?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "bucketId",
            "baseName": "bucketId",
            "type": "number"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "makePublic",
            "baseName": "makePublic",
            "type": "boolean"
        },
        {
            "name": "runModelTestingWhileVersioning",
            "baseName": "runModelTestingWhileVersioning",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return ProjectVersionRequest.attributeTypeMap;
    }
}

