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


/**
* Defines the folder structure for writing to the output dataset. Used only when uploading into a default (non-clinical) dataset.
*/

export type OrganizationCreateProjectOutputDatasetPathRule = 'no-subfolders' | 'subfolder-per-item' | 'use-full-path';
export const OrganizationCreateProjectOutputDatasetPathRuleValues: string[] = ['no-subfolders', 'subfolder-per-item', 'use-full-path'];