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

import { ProjectType } from './projectType';

/**
* Only fields set in this object will be updated.
*/
export class UpdateWhitelabelRequest {
    'supportedProjectTypes'?: Array<ProjectType>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "supportedProjectTypes",
            "baseName": "supportedProjectTypes",
            "type": "Array<ProjectType>"
        }    ];

    static getAttributeTypeMap() {
        return UpdateWhitelabelRequest.attributeTypeMap;
    }
}

