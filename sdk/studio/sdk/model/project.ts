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

import { ProjectCollaborator } from './projectCollaborator';
import { ProjectTierEnum } from './projectTierEnum';
import { PublicProjectLicense } from './publicProjectLicense';

export class Project {
    'id': number;
    'name': string;
    'description': string;
    'created': Date;
    /**
    * User or organization that owns the project
    */
    'owner': string;
    'lastAccessed'?: Date;
    'lastModified'?: Date;
    /**
    * Details about the last modification
    */
    'lastModificationDetails'?: string;
    /**
    * Custom logo for this project (not available for all projects)
    */
    'logo'?: string;
    'ownerUserId'?: number;
    'ownerOrganizationId'?: number;
    /**
    * URL of the project owner avatar, if any.
    */
    'ownerAvatar'?: string;
    'ownerIsDeveloperProfile': boolean;
    /**
    * User ID of the developer profile, if any.
    */
    'developerProfileUserId'?: number;
    'collaborators': Array<ProjectCollaborator>;
    'labelingMethod': ProjectLabelingMethodEnum;
    /**
    * Metadata about the project
    */
    'metadata': object;
    'dataExplorerScreenshot'?: string;
    /**
    * Whether this is an enterprise project
    */
    'isEnterpriseProject': boolean;
    /**
    * Unique identifier of the white label this project belongs to, if any.
    */
    'whitelabelId': number | null;
    /**
    * Name of the white label this project belongs to, if any.
    */
    'whitelabelName'?: string;
    /**
    * List of project tags
    */
    'tags'?: Array<string>;
    /**
    * Project category
    */
    'category'?: ProjectCategoryEnum;
    'license'?: PublicProjectLicense;
    'tier': ProjectTierEnum;
    /**
    * Whether this project has been published or not.
    */
    'hasPublicVersion': boolean;
    /**
    * Whether this is a public version of a project. A version is a snapshot of a project at a certain point in time, which can be used to periodically save the state of a project. Versions can be private (just for internal use and reference) or public, available to everyone. A public version can be cloned by anyone, restoring the state of the project at the time into a new, separate project. 
    */
    'isPublic': boolean;
    /**
    * Whether this project allows live, public access. Unlike a public version, a live public project is not fixed in time, and always includes the latest project changes. Similar to public versions, a live public project can be cloned by anyone, creating a new, separate project. 
    */
    'allowsLivePublicAccess': boolean;
    'indPauseProcessingSamples': boolean;
    /**
    * If the project allows public access, whether to list it the public projects overview response. If not listed, the project is still accessible via direct link. If the project does not allow public access, this field has no effect. 
    */
    'publicProjectListed': boolean;
    'deletedDate'?: Date;
    'fullDeletionDate'?: Date;
    'scheduledFullDeletionDate'?: Date;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "number"
        },
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
            "name": "created",
            "baseName": "created",
            "type": "Date"
        },
        {
            "name": "owner",
            "baseName": "owner",
            "type": "string"
        },
        {
            "name": "lastAccessed",
            "baseName": "lastAccessed",
            "type": "Date"
        },
        {
            "name": "lastModified",
            "baseName": "lastModified",
            "type": "Date"
        },
        {
            "name": "lastModificationDetails",
            "baseName": "lastModificationDetails",
            "type": "string"
        },
        {
            "name": "logo",
            "baseName": "logo",
            "type": "string"
        },
        {
            "name": "ownerUserId",
            "baseName": "ownerUserId",
            "type": "number"
        },
        {
            "name": "ownerOrganizationId",
            "baseName": "ownerOrganizationId",
            "type": "number"
        },
        {
            "name": "ownerAvatar",
            "baseName": "ownerAvatar",
            "type": "string"
        },
        {
            "name": "ownerIsDeveloperProfile",
            "baseName": "ownerIsDeveloperProfile",
            "type": "boolean"
        },
        {
            "name": "developerProfileUserId",
            "baseName": "developerProfileUserId",
            "type": "number"
        },
        {
            "name": "collaborators",
            "baseName": "collaborators",
            "type": "Array<ProjectCollaborator>"
        },
        {
            "name": "labelingMethod",
            "baseName": "labelingMethod",
            "type": "ProjectLabelingMethodEnum"
        },
        {
            "name": "metadata",
            "baseName": "metadata",
            "type": "object"
        },
        {
            "name": "dataExplorerScreenshot",
            "baseName": "dataExplorerScreenshot",
            "type": "string"
        },
        {
            "name": "isEnterpriseProject",
            "baseName": "isEnterpriseProject",
            "type": "boolean"
        },
        {
            "name": "whitelabelId",
            "baseName": "whitelabelId",
            "type": "number"
        },
        {
            "name": "whitelabelName",
            "baseName": "whitelabelName",
            "type": "string"
        },
        {
            "name": "tags",
            "baseName": "tags",
            "type": "Array<string>"
        },
        {
            "name": "category",
            "baseName": "category",
            "type": "ProjectCategoryEnum"
        },
        {
            "name": "license",
            "baseName": "license",
            "type": "PublicProjectLicense"
        },
        {
            "name": "tier",
            "baseName": "tier",
            "type": "ProjectTierEnum"
        },
        {
            "name": "hasPublicVersion",
            "baseName": "hasPublicVersion",
            "type": "boolean"
        },
        {
            "name": "isPublic",
            "baseName": "isPublic",
            "type": "boolean"
        },
        {
            "name": "allowsLivePublicAccess",
            "baseName": "allowsLivePublicAccess",
            "type": "boolean"
        },
        {
            "name": "indPauseProcessingSamples",
            "baseName": "indPauseProcessingSamples",
            "type": "boolean"
        },
        {
            "name": "publicProjectListed",
            "baseName": "publicProjectListed",
            "type": "boolean"
        },
        {
            "name": "deletedDate",
            "baseName": "deletedDate",
            "type": "Date"
        },
        {
            "name": "fullDeletionDate",
            "baseName": "fullDeletionDate",
            "type": "Date"
        },
        {
            "name": "scheduledFullDeletionDate",
            "baseName": "scheduledFullDeletionDate",
            "type": "Date"
        }    ];

    static getAttributeTypeMap() {
        return Project.attributeTypeMap;
    }
}


export type ProjectLabelingMethodEnum = 'single_label' | 'object_detection';
export const ProjectLabelingMethodEnumValues: string[] = ['single_label', 'object_detection'];

export type ProjectCategoryEnum = 'Accelerometer' | 'Audio' | 'Images' | 'Keyword spotting' | 'Object detection' | 'Other';
export const ProjectCategoryEnumValues: string[] = ['Accelerometer', 'Audio', 'Images', 'Keyword spotting', 'Object detection', 'Other'];
