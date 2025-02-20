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

// tslint:disable-next-line: variable-name, no-var-requires
const PATH = require('path');
// tslint:disable-next-line: no-unsafe-any
module.paths.push(PATH.join(process.cwd(), 'node_modules'));

import localVarRequest = require('request');
import http = require('http');

/* tslint:disable:no-unused-locals */
import { CanaryResponse } from '../model/canaryResponse';

import { ObjectSerializer, Authentication, VoidAuth } from '../model/models';
import { HttpBasicAuth, ApiKeyAuth, OAuth } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = 'https://studio.edgeimpulse.com/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum CanaryApiApiKeys {
    JWTAuthentication,
}

type shouldGoOnCanaryQueryParams = {
    requestedUrl: string,
};


export type CanaryApiOpts = {
    extraHeaders?: {
        [name: string]: string
    },
};

export class CanaryApi {
    protected _basePath = defaultBasePath;
    protected defaultHeaders : any = {};
    protected _useQuerystring : boolean = false;
    protected _opts : CanaryApiOpts = { };

    protected authentications = {
        'default': <Authentication>new VoidAuth(),
        'JWTAuthentication': new ApiKeyAuth('cookie', 'jwt'),
    }

    constructor(basePath?: string, opts?: CanaryApiOpts);
    constructor(basePathOrUsername: string, opts?: CanaryApiOpts, password?: string, basePath?: string) {
        if (password) {
            if (basePath) {
                this.basePath = basePath;
            }
        } else {
            if (basePathOrUsername) {
                this.basePath = basePathOrUsername
            }
        }

        this.opts = opts ?? { };
    }

    set useQuerystring(value: boolean) {
        this._useQuerystring = value;
    }

    set basePath(basePath: string) {
        this._basePath = basePath;
    }

    get basePath() {
        return this._basePath;
    }

    set opts(opts: CanaryApiOpts) {
        this._opts = opts;
    }

    get opts() {
        return this._opts;
    }

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: CanaryApiApiKeys, value: string | undefined) {
        (this.authentications as any)[CanaryApiApiKeys[key]].apiKey = value;
    }


    /**
     * Get the decision to whether the requested URL goes on canary deployment or not
     * @summary Get the decision to whether the requested URL goes on canary deployment or not
     * @param requestedUrl Full url (host included) that is requested
     */
    public async shouldGoOnCanary (queryParams: shouldGoOnCanaryQueryParams, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<CanaryResponse> {
        const localVarPath = this.basePath + '/api/canary';
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({
            'User-Agent': 'edgeimpulse-api nodejs'
        }, this.defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'requestedUrl' is not null or undefined

        if (queryParams.requestedUrl === null || queryParams.requestedUrl === undefined) {
            throw new Error('Required parameter queryParams.requestedUrl was null or undefined when calling shouldGoOnCanary.');
        }


        if (queryParams?.requestedUrl !== undefined) {
            localVarQueryParameters['requestedUrl'] = ObjectSerializer.serialize(queryParams.requestedUrl, "string");
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'GET',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            json: true,
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<CanaryResponse>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "CanaryResponse");

                        if (typeof body.success === 'boolean' && !body.success) {
                            const errString = `Failed to call "${localVarPath}", returned ${response.statusCode}: ` + response.body;
                            reject(new Error(body.error || errString));
                        }
                        else if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve(body);
                        }
                        else {
                            const errString = `Failed to call "${localVarPath}", returned ${response.statusCode}: ` + response.body;
                            reject(errString);
                        }
                    }
                });
            });
        });
    }
}
