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

import { AIActionsDataCategory } from './aIActionsDataCategory';

export class PreviewAIActionsSamplesRequest {
    /**
    * If this is passed in, the `previewConfig` of the AI action is overwritten (requires actionId to be a valid action).
    */
    'saveConfig': boolean;
    'dataCategory': AIActionsDataCategory;
    /**
    * Metadata key to filter on. Required if dataCategory is equal to \"dataWithoutMetadataKey\" or \"dataWithMetadata\".
    */
    'dataMetadataKey'?: string;
    /**
    * Metadata value to filter on. Required if dataCategory is equal to \"dataWithMetadata\".
    */
    'dataMetadataValue'?: string;
    /**
    * Max. amount of data items to return.
    */
    'maxDataPreviewCount': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "saveConfig",
            "baseName": "saveConfig",
            "type": "boolean"
        },
        {
            "name": "dataCategory",
            "baseName": "dataCategory",
            "type": "AIActionsDataCategory"
        },
        {
            "name": "dataMetadataKey",
            "baseName": "dataMetadataKey",
            "type": "string"
        },
        {
            "name": "dataMetadataValue",
            "baseName": "dataMetadataValue",
            "type": "string"
        },
        {
            "name": "maxDataPreviewCount",
            "baseName": "maxDataPreviewCount",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return PreviewAIActionsSamplesRequest.attributeTypeMap;
    }
}

