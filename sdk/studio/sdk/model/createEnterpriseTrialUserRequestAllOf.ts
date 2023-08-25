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


export class CreateEnterpriseTrialUserRequestAllOf {
    /**
    * Name of the user.
    */
    'name': string;
    /**
    * Username, minimum 4 and maximum 30 characters. May contain alphanumeric characters, hyphens, underscores and dots. Validated according to `^(?=.{4,30}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._-]+(?<![_.])$`.
    */
    'username': string;
    /**
    * Email of the user. Only business email addresses are allowed. Emails with free domains like gmail.com or yahoo.com are not allowed.
    */
    'email': string;
    /**
    * Whether the user has accepted the terms of service and privacy policy.
    */
    'privacyPolicy': boolean;
    /**
    * Password of the user. Minimum length 8 characters.
    */
    'password'?: string;
    /**
    * Job title of the user.
    */
    'jobTitle'?: string;
    /**
    * Name of the company requesting the trial.
    */
    'companyName'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
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
            "name": "privacyPolicy",
            "baseName": "privacyPolicy",
            "type": "boolean"
        },
        {
            "name": "password",
            "baseName": "password",
            "type": "string"
        },
        {
            "name": "jobTitle",
            "baseName": "jobTitle",
            "type": "string"
        },
        {
            "name": "companyName",
            "baseName": "companyName",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return CreateEnterpriseTrialUserRequestAllOf.attributeTypeMap;
    }
}

