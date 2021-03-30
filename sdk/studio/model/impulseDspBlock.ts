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


export class ImpulseDspBlock {
    /**
    * Identifier for this block. Make sure to up this number when creating a new block, and don\'t re-use identifiers. If the block hasn\'t changed, keep the ID as-is.
    */
    'id': number;
    /**
    * Block type
    */
    'type': string;
    /**
    * Block name, will be used in menus
    */
    'name': string;
    /**
    * Input axes, identified by the name in the name of the axis
    */
    'axes': Array<string>;
    /**
    * Block title, used in the impulse UI
    */
    'title': string;
    /**
    * Number of features this DSP block outputs per axis. This is only set when the DSP block is configured.
    */
    'valuesPerAxis'?: number;
    /**
    * Implementation version of the block
    */
    'implementationVersion': number;

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
            "type": "string"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "axes",
            "baseName": "axes",
            "type": "Array<string>"
        },
        {
            "name": "title",
            "baseName": "title",
            "type": "string"
        },
        {
            "name": "valuesPerAxis",
            "baseName": "valuesPerAxis",
            "type": "number"
        },
        {
            "name": "implementationVersion",
            "baseName": "implementationVersion",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return ImpulseDspBlock.attributeTypeMap;
    }
}

