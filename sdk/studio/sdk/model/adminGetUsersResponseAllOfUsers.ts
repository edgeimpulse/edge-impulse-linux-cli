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


export class AdminGetUsersResponseAllOfUsers {
    'id': number;
    'username': string;
    'email': string;
    'name': string;
    'photo'?: string;
    'created': Date;
    'lastSeen'?: Date;
    'activated'?: boolean;
    'fromEvaluation'?: boolean;
    'tier'?: AdminGetUsersResponseAllOfUsersTierEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
        {
            "name": "username",
            "baseName": "username",
            "type": "string"
        },
        {
            "name": "email",
            "baseName": "email",
            "type": "string"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "photo",
            "baseName": "photo",
            "type": "string"
        },
        {
            "name": "created",
            "baseName": "created",
            "type": "Date"
        },
        {
            "name": "lastSeen",
            "baseName": "lastSeen",
            "type": "Date"
        },
        {
            "name": "activated",
            "baseName": "activated",
            "type": "boolean"
        },
        {
            "name": "fromEvaluation",
            "baseName": "from_evaluation",
            "type": "boolean"
        },
        {
            "name": "tier",
            "baseName": "tier",
            "type": "AdminGetUsersResponseAllOfUsersTierEnum"
        }    ];

    static getAttributeTypeMap() {
        return AdminGetUsersResponseAllOfUsers.attributeTypeMap;
    }
}


export type AdminGetUsersResponseAllOfUsersTierEnum = 'free' | 'pro' | 'enterprise';
export const AdminGetUsersResponseAllOfUsersTierEnumValues: string[] = ['free', 'pro', 'enterprise'];
