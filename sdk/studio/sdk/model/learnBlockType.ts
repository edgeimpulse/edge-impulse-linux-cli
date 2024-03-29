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
* The type of learning block (anomaly, keras, keras-transfer-image, keras-transfer-kws, keras-object-detection, keras-regression). Each behaves differently.
*/

export type LearnBlockType = 'anomaly' | 'anomaly-gmm' | 'keras' | 'keras-transfer-image' | 'keras-transfer-kws' | 'keras-object-detection' | 'keras-regression' | 'keras-akida' | 'keras-akida-transfer-image' | 'keras-akida-object-detection' | 'keras-visual-anomaly';
export const LearnBlockTypeValues: string[] = ['anomaly', 'anomaly-gmm', 'keras', 'keras-transfer-image', 'keras-transfer-kws', 'keras-object-detection', 'keras-regression', 'keras-akida', 'keras-akida-transfer-image', 'keras-akida-object-detection', 'keras-visual-anomaly'];
