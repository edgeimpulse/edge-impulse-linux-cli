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


export class CreateWhitelabelRequest {
    /**
    * The name of the white label.
    */
    'name': string;
    /**
    * The domain where the white label lives.
    */
    'domain': string;
    'ownerOrganizationId': number;
    /**
    * The list of allowed identity providers.
    */
    'identityProviders'?: Array<string>;
    /**
    * Whether this white label accepts password based authentication.
    */
    'allowPasswordAuth'?: boolean;
    /**
    * The list of deployment targets to show on the UI
    */
    'deploymentTargets'?: Array<string>;
    /**
    * Custom documentation URL
    */
    'documentationUrl'?: string;
    /**
    * Whether this white label allow sign ups or not.
    */
    'allowSignup'?: boolean;
    /**
    * Whether this white label allows the creation of free projects.
    */
    'allowFreeProjects'?: boolean;
    /**
    * Whether this white label should work in sandboxed mode or not.
    */
    'sandboxed'?: boolean;
    /**
    * Whether public projects created in this white label scope should be exposed through the Public Projects API or not.
    */
    'exposePublicProjects'?: boolean;
    /**
    * The list of learning block types to show on the UI
    */
    'learningBlocks'?: Array<string>;
    /**
    * The maximum number of organizations that can be created under this white label.
    */
    'organizationsLimit'?: number | null;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "domain",
            "baseName": "domain",
            "type": "string"
        },
        {
            "name": "ownerOrganizationId",
            "baseName": "ownerOrganizationId",
            "type": "number"
        },
        {
            "name": "identityProviders",
            "baseName": "identityProviders",
            "type": "Array<string>"
        },
        {
            "name": "allowPasswordAuth",
            "baseName": "allowPasswordAuth",
            "type": "boolean"
        },
        {
            "name": "deploymentTargets",
            "baseName": "deploymentTargets",
            "type": "Array<string>"
        },
        {
            "name": "documentationUrl",
            "baseName": "documentationUrl",
            "type": "string"
        },
        {
            "name": "allowSignup",
            "baseName": "allowSignup",
            "type": "boolean"
        },
        {
            "name": "allowFreeProjects",
            "baseName": "allowFreeProjects",
            "type": "boolean"
        },
        {
            "name": "sandboxed",
            "baseName": "sandboxed",
            "type": "boolean"
        },
        {
            "name": "exposePublicProjects",
            "baseName": "exposePublicProjects",
            "type": "boolean"
        },
        {
            "name": "learningBlocks",
            "baseName": "learningBlocks",
            "type": "Array<string>"
        },
        {
            "name": "organizationsLimit",
            "baseName": "organizationsLimit",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return CreateWhitelabelRequest.attributeTypeMap;
    }
}

