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

import { DeploymentTargetBadge } from './deploymentTargetBadge';
import { DeploymentTargetEngine } from './deploymentTargetEngine';
import { DeploymentTargetVariant } from './deploymentTargetVariant';

export class DeploymentTarget {
    'name': string;
    'description': string;
    'image': string;
    'imageClasses': string;
    'format': string;
    'latencyDevice'?: string;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasEonCompiler': boolean;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasTensorRT': boolean;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasTensaiFlow': boolean;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasDRPAI': boolean;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasTIDL': boolean;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasAkida': boolean;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasMemryx': boolean;
    /**
    * Preferably use supportedEngines / preferredEngine
    */
    'hasStAton': boolean;
    'hideOptimizations': boolean;
    'badge'?: DeploymentTargetBadge;
    'uiSection': DeploymentTargetUiSectionEnum;
    'customDeployId'?: number;
    'integrateUrl'?: string;
    'ownerOrganizationName'?: string;
    'supportedEngines': Array<DeploymentTargetEngine>;
    'preferredEngine': DeploymentTargetEngine;
    'url'?: string;
    'docsUrl': string;
    'firmwareRepoUrl'?: string;
    'modelVariants': Array<DeploymentTargetVariant>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "image",
            "baseName": "image",
            "type": "string"
        },
        {
            "name": "imageClasses",
            "baseName": "imageClasses",
            "type": "string"
        },
        {
            "name": "format",
            "baseName": "format",
            "type": "string"
        },
        {
            "name": "latencyDevice",
            "baseName": "latencyDevice",
            "type": "string"
        },
        {
            "name": "hasEonCompiler",
            "baseName": "hasEonCompiler",
            "type": "boolean"
        },
        {
            "name": "hasTensorRT",
            "baseName": "hasTensorRT",
            "type": "boolean"
        },
        {
            "name": "hasTensaiFlow",
            "baseName": "hasTensaiFlow",
            "type": "boolean"
        },
        {
            "name": "hasDRPAI",
            "baseName": "hasDRPAI",
            "type": "boolean"
        },
        {
            "name": "hasTIDL",
            "baseName": "hasTIDL",
            "type": "boolean"
        },
        {
            "name": "hasAkida",
            "baseName": "hasAkida",
            "type": "boolean"
        },
        {
            "name": "hasMemryx",
            "baseName": "hasMemryx",
            "type": "boolean"
        },
        {
            "name": "hasStAton",
            "baseName": "hasStAton",
            "type": "boolean"
        },
        {
            "name": "hideOptimizations",
            "baseName": "hideOptimizations",
            "type": "boolean"
        },
        {
            "name": "badge",
            "baseName": "badge",
            "type": "DeploymentTargetBadge"
        },
        {
            "name": "uiSection",
            "baseName": "uiSection",
            "type": "DeploymentTargetUiSectionEnum"
        },
        {
            "name": "customDeployId",
            "baseName": "customDeployId",
            "type": "number"
        },
        {
            "name": "integrateUrl",
            "baseName": "integrateUrl",
            "type": "string"
        },
        {
            "name": "ownerOrganizationName",
            "baseName": "ownerOrganizationName",
            "type": "string"
        },
        {
            "name": "supportedEngines",
            "baseName": "supportedEngines",
            "type": "Array<DeploymentTargetEngine>"
        },
        {
            "name": "preferredEngine",
            "baseName": "preferredEngine",
            "type": "DeploymentTargetEngine"
        },
        {
            "name": "url",
            "baseName": "url",
            "type": "string"
        },
        {
            "name": "docsUrl",
            "baseName": "docsUrl",
            "type": "string"
        },
        {
            "name": "firmwareRepoUrl",
            "baseName": "firmwareRepoUrl",
            "type": "string"
        },
        {
            "name": "modelVariants",
            "baseName": "modelVariants",
            "type": "Array<DeploymentTargetVariant>"
        }    ];

    static getAttributeTypeMap() {
        return DeploymentTarget.attributeTypeMap;
    }
}


export type DeploymentTargetUiSectionEnum = 'library' | 'firmware' | 'mobile' | 'hidden';
export const DeploymentTargetUiSectionEnumValues: string[] = ['library', 'firmware', 'mobile', 'hidden'];
