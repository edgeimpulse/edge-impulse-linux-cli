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


export class UpdateWhitelabelLearningBlocksRequest {
    /**
    * The types of the learning blocks that are enabled for this whitelabel.
    */
    'learningBlocks'?: Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "learningBlocks",
            "baseName": "learningBlocks",
            "type": "Array<string>"
        }    ];

    static getAttributeTypeMap() {
        return UpdateWhitelabelLearningBlocksRequest.attributeTypeMap;
    }
}
