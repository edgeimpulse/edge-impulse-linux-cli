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

import { KerasModelTypeEnum } from './kerasModelTypeEnum';

export class BuildOrganizationOnDeviceModelRequest {
    /**
    * Inferencing engine
    */
    'engine': BuildOrganizationOnDeviceModelRequestEngineEnum;
    'deployBlockId': number;
    'modelType'?: KerasModelTypeEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "engine",
            "baseName": "engine",
            "type": "BuildOrganizationOnDeviceModelRequestEngineEnum"
        },
        {
            "name": "deployBlockId",
            "baseName": "deployBlockId",
            "type": "number"
        },
        {
            "name": "modelType",
            "baseName": "modelType",
            "type": "KerasModelTypeEnum"
        }    ];

    static getAttributeTypeMap() {
        return BuildOrganizationOnDeviceModelRequest.attributeTypeMap;
    }
}


export type BuildOrganizationOnDeviceModelRequestEngineEnum = 'tflite' | 'tflite-eon' | 'tensorrt' | 'tensaiflow' | 'drp-ai' | 'tidl';
export const BuildOrganizationOnDeviceModelRequestEngineEnumValues: string[] = ['tflite', 'tflite-eon', 'tensorrt', 'tensaiflow', 'drp-ai', 'tidl'];
