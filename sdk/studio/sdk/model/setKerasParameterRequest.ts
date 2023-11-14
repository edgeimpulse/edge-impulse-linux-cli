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

import { AkidaEdgeLearningConfig } from './akidaEdgeLearningConfig';
import { AnomalyCapacity } from './anomalyCapacity';
import { AugmentationPolicyImageEnum } from './augmentationPolicyImageEnum';
import { AugmentationPolicySpectrogram } from './augmentationPolicySpectrogram';
import { KerasModelTypeEnum } from './kerasModelTypeEnum';
import { KerasVisualLayer } from './kerasVisualLayer';

/**
* Only fields defined in this object are set
*/
export class SetKerasParameterRequest {
    /**
    * Whether to use visual or expert mode.
    */
    'mode'?: SetKerasParameterRequestModeEnum;
    /**
    * Minimum confidence score, if the neural network scores a sample below this threshold it will be flagged as uncertain.
    */
    'minimumConfidenceRating'?: number;
    'selectedModelType'?: KerasModelTypeEnum;
    /**
    * Raw Keras script (only used in expert mode)
    */
    'script'?: string;
    /**
    * The visual layers for the neural network (only in visual mode).
    */
    'visualLayers'?: Array<KerasVisualLayer>;
    /**
    * Number of training cycles (only in visual mode).
    */
    'trainingCycles'?: number;
    /**
    * Learning rate (between 0 and 1) (only in visual mode).
    */
    'learningRate'?: number;
    /**
    * Batch size used during training (only in visual mode).
    */
    'batchSize'?: number;
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
    'augmentationPolicyImage'?: AugmentationPolicyImageEnum;
    'augmentationPolicySpectrogram'?: AugmentationPolicySpectrogram;
    /**
    * Whether to profile the i8 model (might take a very long time)
    */
    'profileInt8'?: boolean;
    /**
    * If set, skips creating embeddings and measuring memory (used in tests)
    */
    'skipEmbeddingsAndMemory'?: boolean;
    'akidaEdgeLearningConfig'?: AkidaEdgeLearningConfig;
    /**
    * If the \'custom validation split\' experiment is enabled, this metadata key is used to prevent group data leakage between train and validation datasets.
    */
    'customValidationMetadataKey'?: string;
    /**
    * Whether the \'Advanced training settings\' UI element should be expanded.
    */
    'showAdvancedTrainingSettings'?: boolean;
    /**
    * Training parameters, this list depends on the list of parameters that the model exposes.
    */
    'customParameters'?: { [key: string]: string; };
    'anomalyCapacity'?: AnomalyCapacity;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "mode",
            "baseName": "mode",
            "type": "SetKerasParameterRequestModeEnum"
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
            "name": "script",
            "baseName": "script",
            "type": "string"
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
            "name": "batchSize",
            "baseName": "batchSize",
            "type": "number"
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
            "name": "profileInt8",
            "baseName": "profileInt8",
            "type": "boolean"
        },
        {
            "name": "skipEmbeddingsAndMemory",
            "baseName": "skipEmbeddingsAndMemory",
            "type": "boolean"
        },
        {
            "name": "akidaEdgeLearningConfig",
            "baseName": "akidaEdgeLearningConfig",
            "type": "AkidaEdgeLearningConfig"
        },
        {
            "name": "customValidationMetadataKey",
            "baseName": "customValidationMetadataKey",
            "type": "string"
        },
        {
            "name": "showAdvancedTrainingSettings",
            "baseName": "showAdvancedTrainingSettings",
            "type": "boolean"
        },
        {
            "name": "customParameters",
            "baseName": "customParameters",
            "type": "{ [key: string]: string; }"
        },
        {
            "name": "anomalyCapacity",
            "baseName": "anomalyCapacity",
            "type": "AnomalyCapacity"
        }    ];

    static getAttributeTypeMap() {
        return SetKerasParameterRequest.attributeTypeMap;
    }
}


export type SetKerasParameterRequestModeEnum = 'expert' | 'visual';
export const SetKerasParameterRequestModeEnumValues: string[] = ['expert', 'visual'];
