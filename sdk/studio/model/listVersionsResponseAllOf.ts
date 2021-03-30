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

import { ListVersionsResponseAllOfVersions } from './listVersionsResponseAllOfVersions';

export class ListVersionsResponseAllOf {
    'nextVersion'?: number;
    'versions'?: Array<ListVersionsResponseAllOfVersions>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "nextVersion",
            "baseName": "nextVersion",
            "type": "number"
        },
        {
            "name": "versions",
            "baseName": "versions",
            "type": "Array<ListVersionsResponseAllOfVersions>"
        }    ];

    static getAttributeTypeMap() {
        return ListVersionsResponseAllOf.attributeTypeMap;
    }
}

