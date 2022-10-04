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


export class TunerSpaceImpulse {
    /**
    * Input Blocks that are part of this impulse
    */
    'inputBlocks': Array<any>;
    /**
    * DSP Blocks that are part of this impulse
    */
    'dspBlocks': Array<any>;
    /**
    * Learning Blocks that are part of this impulse
    */
    'learnBlocks': Array<any>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "inputBlocks",
            "baseName": "inputBlocks",
            "type": "Array<any>"
        },
        {
            "name": "dspBlocks",
            "baseName": "dspBlocks",
            "type": "Array<any>"
        },
        {
            "name": "learnBlocks",
            "baseName": "learnBlocks",
            "type": "Array<any>"
        }    ];

    static getAttributeTypeMap() {
        return TunerSpaceImpulse.attributeTypeMap;
    }
}

