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

import { GenericApiResponse } from './genericApiResponse';
import { GetStudioConfigResponseAllOf } from './getStudioConfigResponseAllOf';
import { GetStudioConfigResponseAllOfConfig } from './getStudioConfigResponseAllOfConfig';

export class GetStudioConfigResponse {
    /**
    * Whether the operation succeeded
    */
    'success': boolean;
    /**
    * Optional error description (set if \'success\' was false)
    */
    'error'?: string;
    /**
    * List of config items
    */
    'config': Array<GetStudioConfigResponseAllOfConfig>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "success",
            "baseName": "success",
            "type": "boolean"
        },
        {
            "name": "error",
            "baseName": "error",
            "type": "string"
        },
        {
            "name": "config",
            "baseName": "config",
            "type": "Array<GetStudioConfigResponseAllOfConfig>"
        }    ];

    static getAttributeTypeMap() {
        return GetStudioConfigResponse.attributeTypeMap;
    }
}

