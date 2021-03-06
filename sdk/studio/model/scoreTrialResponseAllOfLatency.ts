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


export class ScoreTrialResponseAllOfLatency {
    'dspMips': number;
    'dspMs': number;
    'learnMaccs': number;
    'learnMs': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "dspMips",
            "baseName": "dspMips",
            "type": "number"
        },
        {
            "name": "dspMs",
            "baseName": "dspMs",
            "type": "number"
        },
        {
            "name": "learnMaccs",
            "baseName": "learnMaccs",
            "type": "number"
        },
        {
            "name": "learnMs",
            "baseName": "learnMs",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return ScoreTrialResponseAllOfLatency.attributeTypeMap;
    }
}

