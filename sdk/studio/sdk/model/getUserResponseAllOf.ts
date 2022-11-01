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

import { GetUserResponseAllOfOrganizations } from './getUserResponseAllOfOrganizations';
import { Project } from './project';
import { ProjectInfoResponseAllOfExperiments } from './projectInfoResponseAllOfExperiments';

export class GetUserResponseAllOf {
    'email': string;
    'activated': boolean;
    /**
    * Organizations that the user is a member of. Only filled when requesting information about yourself.
    */
    'organizations': Array<GetUserResponseAllOfOrganizations>;
    'projects': Array<Project>;
    /**
    * Experiments the user has access to. Enabling experiments can only be done through a JWT token.
    */
    'experiments': Array<ProjectInfoResponseAllOfExperiments>;
    /**
    * Whether this is an ephemeral evaluation account.
    */
    'evaluation'?: boolean;
    /**
    * Whether this user is an ambassador.
    */
    'ambassador'?: boolean;
    /**
    * Whether to show the Imagine 2022 banner.
    */
    'showImagine2022': boolean;
    /**
    * The user account tier.
    */
    'tier': GetUserResponseAllOfTierEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "email",
            "baseName": "email",
            "type": "string"
        },
        {
            "name": "activated",
            "baseName": "activated",
            "type": "boolean"
        },
        {
            "name": "organizations",
            "baseName": "organizations",
            "type": "Array<GetUserResponseAllOfOrganizations>"
        },
        {
            "name": "projects",
            "baseName": "projects",
            "type": "Array<Project>"
        },
        {
            "name": "experiments",
            "baseName": "experiments",
            "type": "Array<ProjectInfoResponseAllOfExperiments>"
        },
        {
            "name": "evaluation",
            "baseName": "evaluation",
            "type": "boolean"
        },
        {
            "name": "ambassador",
            "baseName": "ambassador",
            "type": "boolean"
        },
        {
            "name": "showImagine2022",
            "baseName": "showImagine2022",
            "type": "boolean"
        },
        {
            "name": "tier",
            "baseName": "tier",
            "type": "GetUserResponseAllOfTierEnum"
        }    ];

    static getAttributeTypeMap() {
        return GetUserResponseAllOf.attributeTypeMap;
    }
}


export type GetUserResponseAllOfTierEnum = 'free' | 'pro';
export const GetUserResponseAllOfTierEnumValues: string[] = ['free', 'pro'];