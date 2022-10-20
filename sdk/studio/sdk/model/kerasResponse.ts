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

import { AugmentationPolicyImageEnum } from './augmentationPolicyImageEnum';
import { AugmentationPolicySpectrogram } from './augmentationPolicySpectrogram';
import { DependencyData } from './dependencyData';
import { GenericApiResponse } from './genericApiResponse';
import { KerasModelTypeEnum } from './kerasModelTypeEnum';
import { KerasResponseAllOf } from './kerasResponseAllOf';
import { KerasVisualLayer } from './kerasVisualLayer';
import { LearnBlockType } from './learnBlockType';
import { TransferLearningModel } from './transferLearningModel';

export class KerasResponse {
    /**
    * Whether the operation succeeded
    */
    'success': boolean;
    /**
    * Optional error description (set if \'success\' was false)
    */
    'error'?: string;
    'dependencies': DependencyData;
    /**
    * Whether the block is trained
    */
    'trained': boolean;
    'name': string;
    'type'?: LearnBlockType;
    /**
    * The Keras script. This script might be empty if the mode is visual.
    */
    'script': string;
    /**
    * Minimum confidence rating required for the neural network. Scores below this confidence are tagged as uncertain.
    */
    'minimumConfidenceRating': number;
    'selectedModelType': KerasModelTypeEnum;
    /**
    * The mode (visual or expert) to use for editing this network.
    */
    'mode': KerasResponseModeEnum;
    /**
    * The visual layers (if in visual mode) for the neural network. This will be an empty array when in expert mode.
    */
    'visualLayers': Array<KerasVisualLayer>;
    /**
    * Number of training cycles. If in expert mode this will be 0.
    */
    'trainingCycles': number;
    /**
    * Learning rate (between 0 and 1). If in expert mode this will be 0.
    */
    'learningRate': number;
    /**
    * Python-formatted tuple of input axes
    */
    'shape': string;
    /**
    * Train/test split (between 0 and 1)
    */
    'trainTestSplit'?: number;
    /**
    * Whether to automatically balance class weights, use this for skewed datasets.
    */
    'autoClassWeights'?: boolean;
    /**
    * Automatically select the optimal learning rate for your data set.
    */
    'findLearningRate'?: boolean;
    'augmentationPolicyImage': AugmentationPolicyImageEnum;
    'augmentationPolicySpectrogram'?: AugmentationPolicySpectrogram;
    'transferLearningModels': Array<TransferLearningModel>;
    /**
    * Whether to profile the i8 model (might take a very long time)
    */
    'profileInt8': boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "success",
            "baseName": "success",
            "type": "boolean"
        },
        {
            "name": "error",
            "baseName": "error",
            "type": "string"
        },
        {
            "name": "dependencies",
            "baseName": "dependencies",
            "type": "DependencyData"
        },
        {
            "name": "trained",
            "baseName": "trained",
            "type": "boolean"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "type",
            "baseName": "type",
            "type": "LearnBlockType"
        },
        {
            "name": "script",
            "baseName": "script",
            "type": "string"
        },
        {
            "name": "minimumConfidenceRating",
            "baseName": "minimumConfidenceRating",
            "type": "number"
        },
        {
            "name": "selectedModelType",
            "baseName": "selectedModelType",
            "type": "KerasModelTypeEnum"
        },
        {
            "name": "mode",
            "baseName": "mode",
            "type": "KerasResponseModeEnum"
        },
        {
            "name": "visualLayers",
            "baseName": "visualLayers",
            "type": "Array<KerasVisualLayer>"
        },
        {
            "name": "trainingCycles",
            "baseName": "trainingCycles",
            "type": "number"
        },
        {
            "name": "learningRate",
            "baseName": "learningRate",
            "type": "number"
        },
        {
            "name": "shape",
            "baseName": "shape",
            "type": "string"
        },
        {
            "name": "trainTestSplit",
            "baseName": "trainTestSplit",
            "type": "number"
        },
        {
            "name": "autoClassWeights",
            "baseName": "autoClassWeights",
            "type": "boolean"
        },
        {
            "name": "findLearningRate",
            "baseName": "findLearningRate",
            "type": "boolean"
        },
        {
            "name": "augmentationPolicyImage",
            "baseName": "augmentationPolicyImage",
            "type": "AugmentationPolicyImageEnum"
        },
        {
            "name": "augmentationPolicySpectrogram",
            "baseName": "augmentationPolicySpectrogram",
            "type": "AugmentationPolicySpectrogram"
        },
        {
            "name": "transferLearningModels",
            "baseName": "transferLearningModels",
            "type": "Array<TransferLearningModel>"
        },
        {
            "name": "profileInt8",
            "baseName": "profileInt8",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return KerasResponse.attributeTypeMap;
    }
}


export type KerasResponseModeEnum = 'visual' | 'expert';
export const KerasResponseModeEnumValues: string[] = ['visual', 'expert'];
