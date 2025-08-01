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


export class ProjectTrainingDataSummaryResponseAllOfDataSummary {
    /**
    * Labels in the training set
    */
    'labels': Array<string>;
    'dataCount': number;
    /**
    * Whether there are samples in the training dataset that are both time-series data and have multiple labels
    */
    'hasTimeseriesDataWithMultipleLabels': boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "labels",
            "baseName": "labels",
            "type": "Array<string>"
        },
        {
            "name": "dataCount",
            "baseName": "dataCount",
            "type": "number"
        },
        {
            "name": "hasTimeseriesDataWithMultipleLabels",
            "baseName": "hasTimeseriesDataWithMultipleLabels",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return ProjectTrainingDataSummaryResponseAllOfDataSummary.attributeTypeMap;
    }
}

