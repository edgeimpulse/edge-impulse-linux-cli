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

import { ResourceRange } from './resourceRange';
import { TargetMemory } from './targetMemory';

export class TargetProcessor {
    /**
    * The exact part number, if available
    */
    'part'?: string;
    /**
    * Performance category of the processor
    */
    'performance'?: string;
    /**
    * Processor type, serving as a broad descriptor for the intended use-case
    */
    'format'?: string;
    /**
    * Processor architecture, informing about the processor\'s instruction set and core design
    */
    'architecture'?: string;
    /**
    * Does the target processor have a floating point unit
    */
    'fpu'?: boolean;
    'clockRateMhz'?: ResourceRange;
    'memory'?: TargetMemory;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "part",
            "baseName": "part",
            "type": "string"
        },
        {
            "name": "performance",
            "baseName": "performance",
            "type": "string"
        },
        {
            "name": "format",
            "baseName": "format",
            "type": "string"
        },
        {
            "name": "architecture",
            "baseName": "architecture",
            "type": "string"
        },
        {
            "name": "fpu",
            "baseName": "fpu",
            "type": "boolean"
        },
        {
            "name": "clockRateMhz",
            "baseName": "clockRateMhz",
            "type": "ResourceRange"
        },
        {
            "name": "memory",
            "baseName": "memory",
            "type": "TargetMemory"
        }    ];

    static getAttributeTypeMap() {
        return TargetProcessor.attributeTypeMap;
    }
}

