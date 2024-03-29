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


export class LogAnalyticsEventRequest {
    /**
    * Optional session ID for users who have not signed in yet. Helps match anonymous activity with user activity once they sign in.
    */
    'sessionId'?: string;
    'eventName': string;
    'eventProperties': object;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "sessionId",
            "baseName": "sessionId",
            "type": "string"
        },
        {
            "name": "eventName",
            "baseName": "eventName",
            "type": "string"
        },
        {
            "name": "eventProperties",
            "baseName": "eventProperties",
            "type": "object"
        }    ];

    static getAttributeTypeMap() {
        return LogAnalyticsEventRequest.attributeTypeMap;
    }
}

