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


export class GetDataExplorerSettingsResponseAllOf {
    'dimensionalityReductionRecommendation': GetDataExplorerSettingsResponseAllOfDimensionalityReductionRecommendationEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "dimensionalityReductionRecommendation",
            "baseName": "dimensionalityReductionRecommendation",
            "type": "GetDataExplorerSettingsResponseAllOfDimensionalityReductionRecommendationEnum"
        }    ];

    static getAttributeTypeMap() {
        return GetDataExplorerSettingsResponseAllOf.attributeTypeMap;
    }
}


export type GetDataExplorerSettingsResponseAllOfDimensionalityReductionRecommendationEnum = 'tsne' | 'pca';
export const GetDataExplorerSettingsResponseAllOfDimensionalityReductionRecommendationEnumValues: string[] = ['tsne', 'pca'];
