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

import { KerasCustomMetric } from './kerasCustomMetric';
import { KerasModelVariantEnum } from './kerasModelVariantEnum';
import { ProfileModelInfoMemory } from './profileModelInfoMemory';

export class ProfileModelInfo {
    'variant': KerasModelVariantEnum;
    'device': string;
    'tfliteFileSizeBytes': number;
    'isSupportedOnMcu': boolean;
    'memory'?: ProfileModelInfoMemory;
    'timePerInferenceMs'?: number;
    'mcuSupportError'?: string;
    /**
    * Custom, device-specific performance metrics
    */
    'customMetrics': Array<KerasCustomMetric>;
    /**
    * If false, then no metrics are available for this target
    */
    'hasPerformance': boolean;
    /**
    * Specific error during profiling (e.g. model not supported)
    */
    'profilingError'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "variant",
            "baseName": "variant",
            "type": "KerasModelVariantEnum"
        },
        {
            "name": "device",
            "baseName": "device",
            "type": "string"
        },
        {
            "name": "tfliteFileSizeBytes",
            "baseName": "tfliteFileSizeBytes",
            "type": "number"
        },
        {
            "name": "isSupportedOnMcu",
            "baseName": "isSupportedOnMcu",
            "type": "boolean"
        },
        {
            "name": "memory",
            "baseName": "memory",
            "type": "ProfileModelInfoMemory"
        },
        {
            "name": "timePerInferenceMs",
            "baseName": "timePerInferenceMs",
            "type": "number"
        },
        {
            "name": "mcuSupportError",
            "baseName": "mcuSupportError",
            "type": "string"
        },
        {
            "name": "customMetrics",
            "baseName": "customMetrics",
            "type": "Array<KerasCustomMetric>"
        },
        {
            "name": "hasPerformance",
            "baseName": "hasPerformance",
            "type": "boolean"
        },
        {
            "name": "profilingError",
            "baseName": "profilingError",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return ProfileModelInfo.attributeTypeMap;
    }
}

