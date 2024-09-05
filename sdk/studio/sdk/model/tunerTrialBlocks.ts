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


export class TunerTrialBlocks {
    'id': number;
    'lastActive'?: Date;
    'retries': number;
    'status': TunerTrialBlocksStatusEnum;
    'type': TunerTrialBlocksTypeEnum;
    /**
    * Index of corresponding DSP/learn block in the impulse model passed to createTrial()
    */
    'modelBlockIndex'?: number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "lastActive",
            "baseName": "lastActive",
            "type": "Date"
        },
        {
            "name": "retries",
            "baseName": "retries",
            "type": "number"
        },
        {
            "name": "status",
            "baseName": "status",
            "type": "TunerTrialBlocksStatusEnum"
        },
        {
            "name": "type",
            "baseName": "type",
            "type": "TunerTrialBlocksTypeEnum"
        },
        {
            "name": "modelBlockIndex",
            "baseName": "modelBlockIndex",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return TunerTrialBlocks.attributeTypeMap;
    }
}


export type TunerTrialBlocksStatusEnum = 'pending' | 'running' | 'completed' | 'failed';
export const TunerTrialBlocksStatusEnumValues: string[] = ['pending', 'running', 'completed', 'failed'];

export type TunerTrialBlocksTypeEnum = 'input' | 'dsp' | 'learn';
export const TunerTrialBlocksTypeEnumValues: string[] = ['input', 'dsp', 'learn'];
