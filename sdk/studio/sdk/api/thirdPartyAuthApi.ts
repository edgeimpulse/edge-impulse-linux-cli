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
import { CreateThirdPartyAuthRequest } from '../model/createThirdPartyAuthRequest';
import { CreateThirdPartyAuthResponse } from '../model/createThirdPartyAuthResponse';
import { CreateUserThirdPartyRequest } from '../model/createUserThirdPartyRequest';
import { CreateUserThirdPartyResponse } from '../model/createUserThirdPartyResponse';
import { GenericApiResponse } from '../model/genericApiResponse';
import { GetAllThirdPartyAuthResponse } from '../model/getAllThirdPartyAuthResponse';
import { GetThirdPartyAuthResponse } from '../model/getThirdPartyAuthResponse';
import { UpdateThirdPartyAuthRequest } from '../model/updateThirdPartyAuthRequest';

import { ObjectSerializer, Authentication, VoidAuth } from '../model/models';
import { HttpBasicAuth, ApiKeyAuth, OAuth } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = 'https://studio.edgeimpulse.com/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum ThirdPartyAuthApiApiKeys {
    ApiKeyAuthentication,
    JWTAuthentication,
    JWTHttpHeaderAuthentication,
}

export type authorizeThirdPartyFormParams = {
    nextUrl: string,
};


export type ThirdPartyAuthApiOpts = {
    extraHeaders?: {
        [name: string]: string
    },
};

export class ThirdPartyAuthApi {
    protected _basePath = defaultBasePath;
    protected defaultHeaders : any = {};
    protected _useQuerystring : boolean = false;
    protected _opts : ThirdPartyAuthApiOpts = { };

    protected authentications = {
        'default': <Authentication>new VoidAuth(),
        'ApiKeyAuthentication': new ApiKeyAuth('header', 'x-api-key'),
        'OAuth2': new OAuth(),
        'JWTAuthentication': new ApiKeyAuth('cookie', 'jwt'),
        'JWTHttpHeaderAuthentication': new ApiKeyAuth('header', 'x-jwt-token'),
    }

    constructor(basePath?: string, opts?: ThirdPartyAuthApiOpts);
    constructor(basePathOrUsername: string, opts?: ThirdPartyAuthApiOpts, password?: string, basePath?: string) {
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

    set opts(opts: ThirdPartyAuthApiOpts) {
        this._opts = opts;
    }

    get opts() {
        return this._opts;
    }

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: ThirdPartyAuthApiApiKeys, value: string | undefined) {
        (this.authentications as any)[ThirdPartyAuthApiApiKeys[key]].apiKey = value;
    }

    set accessToken(token: string) {
        this.authentications.OAuth2.accessToken = token;
    }


    /**
     * Authorize a third party to access a project
     * @summary Give access to project
     * @param projectId Project ID
     * @param authId Auth ID
     * @param nextUrl The URL to redirect to after authorization is completed.
     */
    public async authorizeThirdParty (projectId: number, authId: number, params: authorizeThirdPartyFormParams, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<any> {
        const localVarPath = this.basePath + '/api/{projectId}/third-party-auth/{authId}/authorize'
            .replace('{' + 'projectId' + '}', encodeURIComponent(String(projectId)))
            .replace('{' + 'authId' + '}', encodeURIComponent(String(authId)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({
            'User-Agent': 'edgeimpulse-api nodejs'
        }, this.defaultHeaders);
        let localVarFormParams: any = {};

        // verify required parameter 'projectId' is not null or undefined


        if (projectId === null || projectId === undefined) {
            throw new Error('Required parameter projectId was null or undefined when calling authorizeThirdParty.');
        }

        // verify required parameter 'authId' is not null or undefined


        if (authId === null || authId === undefined) {
            throw new Error('Required parameter authId was null or undefined when calling authorizeThirdParty.');
        }

        // verify required parameter 'nextUrl' is not null or undefined
        if (params.nextUrl === null || params.nextUrl === undefined) {
            throw new Error('Required parameter params.nextUrl was null or undefined when calling authorizeThirdParty.');
        }



        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        if (params.nextUrl !== undefined) {
            localVarFormParams['nextUrl'] = ObjectSerializer.serializeFormData(params.nextUrl, "string");
        }

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'POST',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            json: true,
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.OAuth2.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<any>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {

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

    /**
     * Create a new third party authentication partner
     * @summary Create third party auth
     * @param createThirdPartyAuthRequest 
     */
    public async createThirdPartyAuth (createThirdPartyAuthRequest: CreateThirdPartyAuthRequest, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<CreateThirdPartyAuthResponse> {
        const localVarPath = this.basePath + '/api/third-party-auth';
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

        // verify required parameter 'createThirdPartyAuthRequest' is not null or undefined


        if (createThirdPartyAuthRequest === null || createThirdPartyAuthRequest === undefined) {
            throw new Error('Required parameter createThirdPartyAuthRequest was null or undefined when calling createThirdPartyAuth.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'POST',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            json: true,
            body: ObjectSerializer.serialize(createThirdPartyAuthRequest, "CreateThirdPartyAuthRequest")
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.OAuth2.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<CreateThirdPartyAuthResponse>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "CreateThirdPartyAuthResponse");

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

    /**
     * Login as a user as a third-party authentication provider. If the user does not exists, it\'s automatically created. You can only log in as users that were previously created by you.
     * @summary Create or login a user
     * @param authId Auth ID
     * @param createUserThirdPartyRequest 
     */
    public async createUserThirdParty (authId: number, createUserThirdPartyRequest: CreateUserThirdPartyRequest, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<CreateUserThirdPartyResponse> {
        const localVarPath = this.basePath + '/api/third-party-auth/{authId}/login'
            .replace('{' + 'authId' + '}', encodeURIComponent(String(authId)));
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

        // verify required parameter 'authId' is not null or undefined


        if (authId === null || authId === undefined) {
            throw new Error('Required parameter authId was null or undefined when calling createUserThirdParty.');
        }

        // verify required parameter 'createUserThirdPartyRequest' is not null or undefined


        if (createUserThirdPartyRequest === null || createUserThirdPartyRequest === undefined) {
            throw new Error('Required parameter createUserThirdPartyRequest was null or undefined when calling createUserThirdParty.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'POST',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            json: true,
            body: ObjectSerializer.serialize(createUserThirdPartyRequest, "CreateUserThirdPartyRequest")
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.OAuth2.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<CreateUserThirdPartyResponse>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "CreateUserThirdPartyResponse");

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

    /**
     * Delete a third party authentication partner
     * @summary Delete third party auth
     * @param authId Auth ID
     */
    public async deleteThirdPartyAuth (authId: number, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<GenericApiResponse> {
        const localVarPath = this.basePath + '/api/third-party-auth/{authId}'
            .replace('{' + 'authId' + '}', encodeURIComponent(String(authId)));
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

        // verify required parameter 'authId' is not null or undefined


        if (authId === null || authId === undefined) {
            throw new Error('Required parameter authId was null or undefined when calling deleteThirdPartyAuth.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'DELETE',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            json: true,
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.OAuth2.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<GenericApiResponse>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "GenericApiResponse");

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

    /**
     * Get information about all third party authentication partners
     * @summary Get all third party auth
     */
    public async getAllThirdPartyAuth (options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<GetAllThirdPartyAuthResponse> {
        const localVarPath = this.basePath + '/api/third-party-auth';
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
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.OAuth2.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<GetAllThirdPartyAuthResponse>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "GetAllThirdPartyAuthResponse");

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

    /**
     * Get information about a third party authentication partner
     * @summary Get third party auth
     * @param authId Auth ID
     */
    public async getThirdPartyAuth (authId: number, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<GetThirdPartyAuthResponse> {
        const localVarPath = this.basePath + '/api/third-party-auth/{authId}'
            .replace('{' + 'authId' + '}', encodeURIComponent(String(authId)));
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

        // verify required parameter 'authId' is not null or undefined


        if (authId === null || authId === undefined) {
            throw new Error('Required parameter authId was null or undefined when calling getThirdPartyAuth.');
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
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.OAuth2.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<GetThirdPartyAuthResponse>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "GetThirdPartyAuthResponse");

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

    /**
     * Update a third party authentication partner
     * @summary Update third party auth
     * @param authId Auth ID
     * @param updateThirdPartyAuthRequest 
     */
    public async updateThirdPartyAuth (authId: number, updateThirdPartyAuthRequest: UpdateThirdPartyAuthRequest, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<GenericApiResponse> {
        const localVarPath = this.basePath + '/api/third-party-auth/{authId}'
            .replace('{' + 'authId' + '}', encodeURIComponent(String(authId)));
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

        // verify required parameter 'authId' is not null or undefined


        if (authId === null || authId === undefined) {
            throw new Error('Required parameter authId was null or undefined when calling updateThirdPartyAuth.');
        }

        // verify required parameter 'updateThirdPartyAuthRequest' is not null or undefined


        if (updateThirdPartyAuthRequest === null || updateThirdPartyAuthRequest === undefined) {
            throw new Error('Required parameter updateThirdPartyAuthRequest was null or undefined when calling updateThirdPartyAuth.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);
        (<any>Object).assign(localVarHeaderParams, this.opts.extraHeaders);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'POST',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            agentOptions: {keepAlive: false},
            json: true,
            body: ObjectSerializer.serialize(updateThirdPartyAuthRequest, "UpdateThirdPartyAuthRequest")
        };

        let authenticationPromise = Promise.resolve();
        authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.JWTHttpHeaderAuthentication.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.OAuth2.applyToRequest(localVarRequestOptions));

        authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
        return authenticationPromise.then(() => {
            if (Object.keys(localVarFormParams).length) {
                if (localVarUseFormData) {
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<GenericApiResponse>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "GenericApiResponse");

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
