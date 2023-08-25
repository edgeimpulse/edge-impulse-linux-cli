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

import { AdminGetUserTrialResponseAllOf } from './adminGetUserTrialResponseAllOf';
import { EnterpriseTrial } from './enterpriseTrial';
import { GenericApiResponse } from './genericApiResponse';

export class AdminGetUserTrialResponse {
    /**
    * Whether the operation succeeded
    */
    'success': boolean;
    /**
    * Optional error description (set if \'success\' was false)
    */
    'error'?: string;
    'trial': EnterpriseTrial;

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
            "name": "trial",
            "baseName": "trial",
            "type": "EnterpriseTrial"
        }    ];

    static getAttributeTypeMap() {
        return AdminGetUserTrialResponse.attributeTypeMap;
    }
}
