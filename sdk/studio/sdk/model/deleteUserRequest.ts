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


export class DeleteUserRequest {
    /**
    * User\'s current password. Required if the user has a password set.
    */
    'password'?: string;
    /**
    * TOTP Token. Required if a user has multi-factor authentication with a TOTP token enabled. If a user has MFA enabled, but no totpToken is submitted; then an error starting with \"ERR_TOTP_TOKEN IS REQUIRED\" is returned. Use this to then prompt for an MFA token and re-try this request.
    */
    'totpToken'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "password",
            "baseName": "password",
            "type": "string"
        },
        {
            "name": "totpToken",
            "baseName": "totpToken",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return DeleteUserRequest.attributeTypeMap;
    }
}

