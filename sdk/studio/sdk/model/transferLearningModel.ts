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

import { DSPGroupItem } from './dSPGroupItem';
import { KerasVisualLayerType } from './kerasVisualLayerType';
import { LearnBlockType } from './learnBlockType';

export class TransferLearningModel {
    'name': string;
    'shortName': string;
    'description': string;
    'hasNeurons': boolean;
    'hasDropout': boolean;
    'defaultNeurons'?: number;
    'defaultDropout'?: number;
    'defaultLearningRate'?: number;
    'defaultTrainingCycles'?: number;
    'hasImageAugmentation'?: boolean;
    'type': KerasVisualLayerType;
    'learnBlockType'?: LearnBlockType;
    'organizationModelId'?: number;
    'implementationVersion'?: number;
    'repositoryUrl'?: string;
    'author': string;
    'blockType': TransferLearningModelBlockTypeEnum;
    'customParameters'?: Array<DSPGroupItem>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "shortName",
            "baseName": "shortName",
            "type": "string"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "hasNeurons",
            "baseName": "hasNeurons",
            "type": "boolean"
        },
        {
            "name": "hasDropout",
            "baseName": "hasDropout",
            "type": "boolean"
        },
        {
            "name": "defaultNeurons",
            "baseName": "defaultNeurons",
            "type": "number"
        },
        {
            "name": "defaultDropout",
            "baseName": "defaultDropout",
            "type": "number"
        },
        {
            "name": "defaultLearningRate",
            "baseName": "defaultLearningRate",
            "type": "number"
        },
        {
            "name": "defaultTrainingCycles",
            "baseName": "defaultTrainingCycles",
            "type": "number"
        },
        {
            "name": "hasImageAugmentation",
            "baseName": "hasImageAugmentation",
            "type": "boolean"
        },
        {
            "name": "type",
            "baseName": "type",
            "type": "KerasVisualLayerType"
        },
        {
            "name": "learnBlockType",
            "baseName": "learnBlockType",
            "type": "LearnBlockType"
        },
        {
            "name": "organizationModelId",
            "baseName": "organizationModelId",
            "type": "number"
        },
        {
            "name": "implementationVersion",
            "baseName": "implementationVersion",
            "type": "number"
        },
        {
            "name": "repositoryUrl",
            "baseName": "repositoryUrl",
            "type": "string"
        },
        {
            "name": "author",
            "baseName": "author",
            "type": "string"
        },
        {
            "name": "blockType",
            "baseName": "blockType",
            "type": "TransferLearningModelBlockTypeEnum"
        },
        {
            "name": "customParameters",
            "baseName": "customParameters",
            "type": "Array<DSPGroupItem>"
        }    ];

    static getAttributeTypeMap() {
        return TransferLearningModel.attributeTypeMap;
    }
}


export type TransferLearningModelBlockTypeEnum = 'official' | 'personal' | 'enterprise' | 'community';
export const TransferLearningModelBlockTypeEnumValues: string[] = ['official', 'personal', 'enterprise', 'community'];
