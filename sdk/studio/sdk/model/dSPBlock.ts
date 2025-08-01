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

import { BlockType } from './blockType';
import { DSPNamedAxis } from './dSPNamedAxis';

export class DSPBlock {
    'type': string;
    'title': string;
    'author': string;
    'description': string;
    'name': string;
    'recommended': boolean;
    'experimental': boolean;
    'latestImplementationVersion': number;
    'organizationId'?: number;
    'organizationDspId'?: number;
    'blockType': BlockType;
    'namedAxes'?: Array<DSPNamedAxis>;
    /**
    * List of target devices that support this DSP block. If undefined this block works on all targets.
    */
    'supportedTargets'?: Array<string>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "type",
            "baseName": "type",
            "type": "string"
        },
        {
            "name": "title",
            "baseName": "title",
            "type": "string"
        },
        {
            "name": "author",
            "baseName": "author",
            "type": "string"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "recommended",
            "baseName": "recommended",
            "type": "boolean"
        },
        {
            "name": "experimental",
            "baseName": "experimental",
            "type": "boolean"
        },
        {
            "name": "latestImplementationVersion",
            "baseName": "latestImplementationVersion",
            "type": "number"
        },
        {
            "name": "organizationId",
            "baseName": "organizationId",
            "type": "number"
        },
        {
            "name": "organizationDspId",
            "baseName": "organizationDspId",
            "type": "number"
        },
        {
            "name": "blockType",
            "baseName": "blockType",
            "type": "BlockType"
        },
        {
            "name": "namedAxes",
            "baseName": "namedAxes",
            "type": "Array<DSPNamedAxis>"
        },
        {
            "name": "supportedTargets",
            "baseName": "supportedTargets",
            "type": "Array<string>"
        }    ];

    static getAttributeTypeMap() {
        return DSPBlock.attributeTypeMap;
    }
}

