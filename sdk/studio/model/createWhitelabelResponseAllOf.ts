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


export class CreateWhitelabelResponseAllOf {
    /**
    * Unique whitelabel identifier
    */
    'id': number;
    /**
    * Unique identifier for the theme associated with the white label
    */
    'themeId': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "themeId",
            "baseName": "themeId",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return CreateWhitelabelResponseAllOf.attributeTypeMap;
    }
}

