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

import { OrganizationPipeline } from './organizationPipeline';

export class GetOrganizationPipelinesResponseAllOf {
    'pipeline': OrganizationPipeline;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "pipeline",
            "baseName": "pipeline",
            "type": "OrganizationPipeline"
        }    ];

    static getAttributeTypeMap() {
        return GetOrganizationPipelinesResponseAllOf.attributeTypeMap;
    }
}

