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

import { OrganizationUser } from './organizationUser';

export class Organization {
    'id': number;
    /**
    * EdgeImpulse Inc.
    */
    'name': string;
    'logo'?: string;
    'headerImg'?: string;
    'users': Array<OrganizationUser>;
    'isDeveloperProfile': boolean;
    /**
    * Unique identifier of the white label this project belongs to, if any.
    */
    'whitelabelId': number | null;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "logo",
            "baseName": "logo",
            "type": "string"
        },
        {
            "name": "headerImg",
            "baseName": "headerImg",
            "type": "string"
        },
        {
            "name": "users",
            "baseName": "users",
            "type": "Array<OrganizationUser>"
        },
        {
            "name": "isDeveloperProfile",
            "baseName": "isDeveloperProfile",
            "type": "boolean"
        },
        {
            "name": "whitelabelId",
            "baseName": "whitelabelId",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return Organization.attributeTypeMap;
    }
}
