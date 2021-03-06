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


export class StartPerformanceCalibrationRequest {
    /**
    * The label used to signify background noise in the impulse
    */
    'backgroundNoiseLabel': string;
    /**
    * Any other labels that should be considered equivalent to background noise
    */
    'otherNoiseLabels'?: Array<string>;
    /**
    * The key of an uploaded sample. If not present, a synthetic sample will be created.
    */
    'uploadKey'?: string;
    /**
    * The length of sample to create (required for synthetic samples)
    */
    'sampleLengthMinutes'?: number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "backgroundNoiseLabel",
            "baseName": "backgroundNoiseLabel",
            "type": "string"
        },
        {
            "name": "otherNoiseLabels",
            "baseName": "otherNoiseLabels",
            "type": "Array<string>"
        },
        {
            "name": "uploadKey",
            "baseName": "uploadKey",
            "type": "string"
        },
        {
            "name": "sampleLengthMinutes",
            "baseName": "sampleLengthMinutes",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return StartPerformanceCalibrationRequest.attributeTypeMap;
    }
}

