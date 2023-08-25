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

import { CreateEnterpriseTrialUserRequestAllOf } from './createEnterpriseTrialUserRequestAllOf';
import { StartEnterpriseTrialRequest } from './startEnterpriseTrialRequest';

export class CreateEnterpriseTrialUserRequest {
    /**
    * Email of the user. Only business email addresses are allowed. Emails with free domains like gmail.com or yahoo.com are not allowed.
    */
    'email': string;
    /**
    * Name of the trial organization. All enterprise features are tied to an organization. This organization will be deleted after the trial ends. If no organization name is provided, the user\'s name will be used.
    */
    'organizationName'?: string;
    /**
    * Expiration date of the trial. The trial will be set as expired after this date. There will be a grace period of 30 days after a trial expires before fully deleting the trial organization. This field is ignored if the trial is requested by a non-admin user, defaulting to 14 days trial.
    */
    'expirationDate'?: Date;
    /**
    * Notes about the trial. Free form text. This field is ignored if the trial is requested by a non-admin user.
    */
    'notes'?: string;
    /**
    * Use case of the trial.
    */
    'useCase'?: string;
    /**
    * Whether the user has ML models in production.
    */
    'userHasMLModelsInProduction'?: CreateEnterpriseTrialUserRequestUserHasMLModelsInProductionEnum;
    /**
    * Name of the company requesting the trial.
    */
    'companyName'?: string;
    /**
    * Size of the company requesting the trial. This is a range of number of employees.
    */
    'companySize'?: string;
    /**
    * Country of the company requesting the trial.
    */
    'country'?: string;
    /**
    * State or province of the company requesting the trial.
    */
    'stateOrProvince'?: string;
    /**
    * Name of the user.
    */
    'name': string;
    /**
    * Username, minimum 4 and maximum 30 characters. May contain alphanumeric characters, hyphens, underscores and dots. Validated according to `^(?=.{4,30}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._-]+(?<![_.])$`.
    */
    'username': string;
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

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "email",
            "baseName": "email",
            "type": "string"
        },
        {
            "name": "organizationName",
            "baseName": "organizationName",
            "type": "string"
        },
        {
            "name": "expirationDate",
            "baseName": "expirationDate",
            "type": "Date"
        },
        {
            "name": "notes",
            "baseName": "notes",
            "type": "string"
        },
        {
            "name": "useCase",
            "baseName": "useCase",
            "type": "string"
        },
        {
            "name": "userHasMLModelsInProduction",
            "baseName": "userHasMLModelsInProduction",
            "type": "CreateEnterpriseTrialUserRequestUserHasMLModelsInProductionEnum"
        },
        {
            "name": "companyName",
            "baseName": "companyName",
            "type": "string"
        },
        {
            "name": "companySize",
            "baseName": "companySize",
            "type": "string"
        },
        {
            "name": "country",
            "baseName": "country",
            "type": "string"
        },
        {
            "name": "stateOrProvince",
            "baseName": "stateOrProvince",
            "type": "string"
        },
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
        }    ];

    static getAttributeTypeMap() {
        return CreateEnterpriseTrialUserRequest.attributeTypeMap;
    }
}


export type CreateEnterpriseTrialUserRequestUserHasMLModelsInProductionEnum = 'yes' | 'no' | 'no, but we will soon';
export const CreateEnterpriseTrialUserRequestUserHasMLModelsInProductionEnumValues: string[] = ['yes', 'no', 'no, but we will soon'];
