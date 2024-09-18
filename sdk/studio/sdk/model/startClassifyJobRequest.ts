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

import { KerasModelVariantEnum } from './kerasModelVariantEnum';

export class StartClassifyJobRequest {
    /**
    * Set of model variants to run the classify job against.
    */
    'modelVariants'?: Array<KerasModelVariantEnum>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "modelVariants",
            "baseName": "modelVariants",
            "type": "Array<KerasModelVariantEnum>"
        }    ];

    static getAttributeTypeMap() {
        return StartClassifyJobRequest.attributeTypeMap;
    }
}
