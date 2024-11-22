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

import { BoundingBox } from './boundingBox';
import { StructuredLabel } from './structuredLabel';

export class SampleProposedChanges {
    /**
    * New label (single-label)
    */
    'label'?: string;
    /**
    * True if the current sample should be disabled; or false if it should not be disabled.
    */
    'isDisabled'?: boolean;
    /**
    * List of bounding boxes. The existing bounding boxes on the sample will be replaced (so if you want to add new bounding boxes, use the existing list as a basis).
    */
    'boundingBoxes'?: Array<BoundingBox>;
    /**
    * Free form associated metadata. The existing metadata on the sample will be replaced (so if you want to add new metadata, use the existing list as a basis).
    */
    'metadata'?: { [key: string]: string; };
    /**
    * New label (multi-label)
    */
    'structuredLabels'?: Array<StructuredLabel>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "label",
            "baseName": "label",
            "type": "string"
        },
        {
            "name": "isDisabled",
            "baseName": "isDisabled",
            "type": "boolean"
        },
        {
            "name": "boundingBoxes",
            "baseName": "boundingBoxes",
            "type": "Array<BoundingBox>"
        },
        {
            "name": "metadata",
            "baseName": "metadata",
            "type": "{ [key: string]: string; }"
        },
        {
            "name": "structuredLabels",
            "baseName": "structuredLabels",
            "type": "Array<StructuredLabel>"
        }    ];

    static getAttributeTypeMap() {
        return SampleProposedChanges.attributeTypeMap;
    }
}
