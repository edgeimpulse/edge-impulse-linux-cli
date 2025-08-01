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

import { LearnBlockType } from './learnBlockType';

export class ImpulseLearnBlock {
    /**
    * Identifier for this block. Make sure to up this number when creating a new block via `getNewBlockId`, and don\'t re-use identifiers. If the block hasn\'t changed, keep the ID as-is. ID must be unique across the project and greather than zero (>0).
    */
    'id': number;
    'type': LearnBlockType;
    /**
    * Block name, will be used in menus. If a block has a baseBlockId, this field is ignored and the base block\'s name is used instead.
    */
    'name': string;
    /**
    * DSP dependencies, identified by DSP block ID
    */
    'dsp': Array<number>;
    /**
    * Block title, used in the impulse UI
    */
    'title': string;
    /**
    * The system component that created the block version (createImpulse | clone | tuner). Cannot be set via API.
    */
    'createdBy'?: string;
    /**
    * The datetime that the block version was created. Cannot be set via API.
    */
    'createdAt'?: Date;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "type",
            "baseName": "type",
            "type": "LearnBlockType"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "dsp",
            "baseName": "dsp",
            "type": "Array<number>"
        },
        {
            "name": "title",
            "baseName": "title",
            "type": "string"
        },
        {
            "name": "createdBy",
            "baseName": "createdBy",
            "type": "string"
        },
        {
            "name": "createdAt",
            "baseName": "createdAt",
            "type": "Date"
        }    ];

    static getAttributeTypeMap() {
        return ImpulseLearnBlock.attributeTypeMap;
    }
}

