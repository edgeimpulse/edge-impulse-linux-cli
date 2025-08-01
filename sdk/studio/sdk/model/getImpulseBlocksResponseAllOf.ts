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

import { DSPBlock } from './dSPBlock';
import { InputBlock } from './inputBlock';
import { LearnBlock } from './learnBlock';
import { PostProcessingBlock } from './postProcessingBlock';

export class GetImpulseBlocksResponseAllOf {
    'inputBlocks': Array<InputBlock>;
    'dspBlocks': Array<DSPBlock>;
    'learnBlocks': Array<LearnBlock>;
    'postProcessingBlocks': Array<PostProcessingBlock>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "inputBlocks",
            "baseName": "inputBlocks",
            "type": "Array<InputBlock>"
        },
        {
            "name": "dspBlocks",
            "baseName": "dspBlocks",
            "type": "Array<DSPBlock>"
        },
        {
            "name": "learnBlocks",
            "baseName": "learnBlocks",
            "type": "Array<LearnBlock>"
        },
        {
            "name": "postProcessingBlocks",
            "baseName": "postProcessingBlocks",
            "type": "Array<PostProcessingBlock>"
        }    ];

    static getAttributeTypeMap() {
        return GetImpulseBlocksResponseAllOf.attributeTypeMap;
    }
}

