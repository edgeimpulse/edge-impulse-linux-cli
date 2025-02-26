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

import { StorageProvider } from './storageProvider';

export class VerifyOrganizationBucketRequest {
    'storageProvider'?: StorageProvider;
    /**
    * Access key for the storage service: - For S3 and GCS: Use the access key. - For Azure: Use the Storage Account Name. 
    */
    'accessKey': string;
    /**
    * Secret key for the storage service: - For S3 and GCS: Use the secret key. - For Azure: Use the Storage Account Access Key. Note: You should either pass a `secretKey` value or a `bucketId` value. 
    */
    'secretKey'?: string;
    /**
    * ID of an existing bucket. If provided, the credentials from this bucket will be used unless overridden by the `secretKey` property. 
    */
    'bucketId'?: number;
    /**
    * Name of the storage bucket or container.
    */
    'bucket': string;
    /**
    * Endpoint URL for the storage service. For S3-compatible services, Azure, or custom endpoints. 
    */
    'endpoint': string;
    /**
    * Optional region of the storage service (if applicable).
    */
    'region'?: string;
    /**
    * Optional prefix within the bucket. Set this if you don\'t have access to the full bucket or want to limit the scope. 
    */
    'prefix'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "storageProvider",
            "baseName": "storageProvider",
            "type": "StorageProvider"
        },
        {
            "name": "accessKey",
            "baseName": "accessKey",
            "type": "string"
        },
        {
            "name": "secretKey",
            "baseName": "secretKey",
            "type": "string"
        },
        {
            "name": "bucketId",
            "baseName": "bucketId",
            "type": "number"
        },
        {
            "name": "bucket",
            "baseName": "bucket",
            "type": "string"
        },
        {
            "name": "endpoint",
            "baseName": "endpoint",
            "type": "string"
        },
        {
            "name": "region",
            "baseName": "region",
            "type": "string"
        },
        {
            "name": "prefix",
            "baseName": "prefix",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return VerifyOrganizationBucketRequest.attributeTypeMap;
    }
}

