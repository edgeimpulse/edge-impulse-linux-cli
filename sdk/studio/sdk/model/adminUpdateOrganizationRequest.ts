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

import { EntitlementLimits } from './entitlementLimits';

/**
* Only fields set in this object will be updated.
*/
export class AdminUpdateOrganizationRequest {
    /**
    * New logo URL, or set to `null` to remove the logo.
    */
    'logo'?: string;
    /**
    * New leader image URL, or set to `null` to remove the leader.
    */
    'headerImg'?: string;
    /**
    * New organization name.
    */
    'name'?: string;
    'experiments'?: Array<string>;
    /**
    * Readme for the organization (in Markdown)
    */
    'readme'?: string;
    'billable'?: boolean;
    'entitlementLimits'?: EntitlementLimits;
    /**
    * The date in which the organization contract started. Compute time will be calculated from this date.
    */
    'contractStartDate'?: Date;
    /**
    * The domain of the organization. The organization domain is used to add new users to an organization. For example, new @edgeimpulse.com would be added to the Edge Impulse organization if this organization has edgeimpulse.com as the domain.
    */
    'domain'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
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
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "experiments",
            "baseName": "experiments",
            "type": "Array<string>"
        },
        {
            "name": "readme",
            "baseName": "readme",
            "type": "string"
        },
        {
            "name": "billable",
            "baseName": "billable",
            "type": "boolean"
        },
        {
            "name": "entitlementLimits",
            "baseName": "entitlementLimits",
            "type": "EntitlementLimits"
        },
        {
            "name": "contractStartDate",
            "baseName": "contractStartDate",
            "type": "Date"
        },
        {
            "name": "domain",
            "baseName": "domain",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return AdminUpdateOrganizationRequest.attributeTypeMap;
    }
}

