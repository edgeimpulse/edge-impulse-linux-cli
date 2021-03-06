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


export class ObjectDetectionAutoLabelRequest {
    'neuralNetwork': ObjectDetectionAutoLabelRequestNeuralNetworkEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "neuralNetwork",
            "baseName": "neuralNetwork",
            "type": "ObjectDetectionAutoLabelRequestNeuralNetworkEnum"
        }    ];

    static getAttributeTypeMap() {
        return ObjectDetectionAutoLabelRequest.attributeTypeMap;
    }
}


export type ObjectDetectionAutoLabelRequestNeuralNetworkEnum = 'yolov5' | 'currentProject';
export const ObjectDetectionAutoLabelRequestNeuralNetworkEnumValues: string[] = ['yolov5', 'currentProject'];
