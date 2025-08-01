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


export class IntegrationSessionStatus {
    /**
    * Integration session status
    */
    'status': IntegrationSessionStatusStatusEnum;
    /**
    * Any relevant additional information, e.g. the reason the session has stopped or any error messages.
    */
    'additionalInfo'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "status",
            "baseName": "status",
            "type": "IntegrationSessionStatusStatusEnum"
        },
        {
            "name": "additionalInfo",
            "baseName": "additionalInfo",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return IntegrationSessionStatus.attributeTypeMap;
    }
}


export type IntegrationSessionStatusStatusEnum = 'pending' | 'active' | 'error' | 'stopped';
export const IntegrationSessionStatusStatusEnumValues: string[] = ['pending', 'active', 'error', 'stopped'];
