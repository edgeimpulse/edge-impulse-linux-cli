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

import { OptimizeConfigSearchSpaceTemplate } from './optimizeConfigSearchSpaceTemplate';
import { OptimizeConfigTargetDevice } from './optimizeConfigTargetDevice';
import { TunerSpaceImpulse } from './tunerSpaceImpulse';

export class OptimizeConfig {
    'name'?: string;
    /**
    * Target latency in MS
    */
    'targetLatency': number;
    'targetDevice': OptimizeConfigTargetDevice;
    'compiler'?: Array<string>;
    'precision'?: Array<string>;
    /**
    * Maximum number of training cycles
    */
    'trainingCycles'?: number;
    /**
    * Maximum number of trials
    */
    'tuningMaxTrials'?: number;
    /**
    * Maximum number of parallel workers/jobs
    */
    'tuningWorkers'?: number;
    /**
    * Number of initial trials
    */
    'initialTrials'?: number;
    /**
    * Number of optimization rounds
    */
    'optimizationRounds'?: number;
    /**
    * Number of trials per optimization round
    */
    'trialsPerOptimizationRound'?: number;
    'minMACCS'?: number;
    'maxMACCS'?: number;
    /**
    * Tuning algorithm to use to search hyperparameter space
    */
    'tuningAlgorithm'?: OptimizeConfigTuningAlgorithmEnum;
    'notificationOnCompletion'?: boolean;
    /**
    * Whether to import metrics for previous EON tuner runs in the same project to accelerate the hyperparameter search process
    */
    'importProjectMetrics'?: boolean;
    /**
    * Whether to import resource usage (RAM/ROM/latency) metrics to accelerate the hyperparameter search process
    */
    'importResourceMetrics'?: boolean;
    /**
    * Number of project trials to import
    */
    'numImportProjectMetrics'?: number;
    /**
    * Number of resource usage trials to import
    */
    'numImportResourceMetrics'?: number;
    /**
    * Enable standard error of the mean (SEM)
    */
    'enableSEM'?: boolean;
    /**
    * Standard error of the trial accuracy mean
    */
    'accuracySEM'?: number;
    /**
    * Standard error of the trial latency mean
    */
    'latencySEM'?: number;
    /**
    * Hyperparameter optimization objective
    */
    'optimizationObjective'?: OptimizeConfigOptimizationObjectiveEnum;
    /**
    * Model variant to optimize for
    */
    'optimizationPrecision'?: OptimizeConfigOptimizationPrecisionEnum;
    /**
    * Enable trial level early stopping based on loss metrics during training
    */
    'earlyStopping'?: boolean;
    /**
    * Stops the EON tuner if the feasible (mean) objective has not improved over the past “window_size” iterations
    */
    'earlyStoppingWindowSize'?: number;
    /**
    * Threshold (in [0,1]) for considering relative improvement over the best point.
    */
    'earlyStoppingImprovementBar'?: number;
    /**
    * Enable Multi-fidelity Multi-Objective optimization
    */
    'MOMF'?: boolean;
    /**
    * Enable verbose logging
    */
    'verboseLogging'?: boolean;
    'tunerSpaceOptions'?: { [key: string]: Array<string>; };
    /**
    * List of impulses specifying the EON Tuner search space
    */
    'space'?: Array<TunerSpaceImpulse>;
    'searchSpaceTemplate'?: OptimizeConfigSearchSpaceTemplate;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "targetLatency",
            "baseName": "targetLatency",
            "type": "number"
        },
        {
            "name": "targetDevice",
            "baseName": "targetDevice",
            "type": "OptimizeConfigTargetDevice"
        },
        {
            "name": "compiler",
            "baseName": "compiler",
            "type": "Array<string>"
        },
        {
            "name": "precision",
            "baseName": "precision",
            "type": "Array<string>"
        },
        {
            "name": "trainingCycles",
            "baseName": "trainingCycles",
            "type": "number"
        },
        {
            "name": "tuningMaxTrials",
            "baseName": "tuningMaxTrials",
            "type": "number"
        },
        {
            "name": "tuningWorkers",
            "baseName": "tuningWorkers",
            "type": "number"
        },
        {
            "name": "initialTrials",
            "baseName": "initialTrials",
            "type": "number"
        },
        {
            "name": "optimizationRounds",
            "baseName": "optimizationRounds",
            "type": "number"
        },
        {
            "name": "trialsPerOptimizationRound",
            "baseName": "trialsPerOptimizationRound",
            "type": "number"
        },
        {
            "name": "minMACCS",
            "baseName": "minMACCS",
            "type": "number"
        },
        {
            "name": "maxMACCS",
            "baseName": "maxMACCS",
            "type": "number"
        },
        {
            "name": "tuningAlgorithm",
            "baseName": "tuningAlgorithm",
            "type": "OptimizeConfigTuningAlgorithmEnum"
        },
        {
            "name": "notificationOnCompletion",
            "baseName": "notificationOnCompletion",
            "type": "boolean"
        },
        {
            "name": "importProjectMetrics",
            "baseName": "importProjectMetrics",
            "type": "boolean"
        },
        {
            "name": "importResourceMetrics",
            "baseName": "importResourceMetrics",
            "type": "boolean"
        },
        {
            "name": "numImportProjectMetrics",
            "baseName": "numImportProjectMetrics",
            "type": "number"
        },
        {
            "name": "numImportResourceMetrics",
            "baseName": "numImportResourceMetrics",
            "type": "number"
        },
        {
            "name": "enableSEM",
            "baseName": "enableSEM",
            "type": "boolean"
        },
        {
            "name": "accuracySEM",
            "baseName": "accuracySEM",
            "type": "number"
        },
        {
            "name": "latencySEM",
            "baseName": "latencySEM",
            "type": "number"
        },
        {
            "name": "optimizationObjective",
            "baseName": "optimizationObjective",
            "type": "OptimizeConfigOptimizationObjectiveEnum"
        },
        {
            "name": "optimizationPrecision",
            "baseName": "optimizationPrecision",
            "type": "OptimizeConfigOptimizationPrecisionEnum"
        },
        {
            "name": "earlyStopping",
            "baseName": "earlyStopping",
            "type": "boolean"
        },
        {
            "name": "earlyStoppingWindowSize",
            "baseName": "earlyStoppingWindowSize",
            "type": "number"
        },
        {
            "name": "earlyStoppingImprovementBar",
            "baseName": "earlyStoppingImprovementBar",
            "type": "number"
        },
        {
            "name": "MOMF",
            "baseName": "MOMF",
            "type": "boolean"
        },
        {
            "name": "verboseLogging",
            "baseName": "verboseLogging",
            "type": "boolean"
        },
        {
            "name": "tunerSpaceOptions",
            "baseName": "tunerSpaceOptions",
            "type": "{ [key: string]: Array<string>; }"
        },
        {
            "name": "space",
            "baseName": "space",
            "type": "Array<TunerSpaceImpulse>"
        },
        {
            "name": "searchSpaceTemplate",
            "baseName": "searchSpaceTemplate",
            "type": "OptimizeConfigSearchSpaceTemplate"
        }    ];

    static getAttributeTypeMap() {
        return OptimizeConfig.attributeTypeMap;
    }
}


export type OptimizeConfigTuningAlgorithmEnum = 'random' | 'hyperband' | 'bayesian' | 'custom';
export const OptimizeConfigTuningAlgorithmEnumValues: string[] = ['random', 'hyperband', 'bayesian', 'custom'];

export type OptimizeConfigOptimizationObjectiveEnum = 'accuracy' | 'ram' | 'rom' | 'latency';
export const OptimizeConfigOptimizationObjectiveEnumValues: string[] = ['accuracy', 'ram', 'rom', 'latency'];

export type OptimizeConfigOptimizationPrecisionEnum = 'float32' | 'int8';
export const OptimizeConfigOptimizationPrecisionEnumValues: string[] = ['float32', 'int8'];
