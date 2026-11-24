import http from 'node:http';
import { InferenceRunnerRegistration } from '../../shared/device-protocol/application-contract';

/** Decoded request body exposed to a mock application API handler. */
export type MockAgentRequest = {
    body: unknown;
};

/** HTTP response or open command stream returned by a mock application API route. */
export type MockAgentResponse = {
    statusCode?: number;
    headers?: http.OutgoingHttpHeaders;
    body?: object | string;
    keepOpen?: boolean;
};

/** Application API method and path paired with a fixed response or request handler. */
export type MockAgentRoute = {
    method: 'GET' | 'POST';
    path: string;
    response: MockAgentResponse | ((request: MockAgentRequest) => MockAgentResponse | Promise<MockAgentResponse>);
};

/**
 * Starts a mock device agent on a Unix socket. Routes declare the response data directly or provide
 * a callback when a test needs to inspect a request, delay a response or record that a stream opened.
 * Unregistered method/path combinations return HTTP 404.
 *
 * @param socketPath Unix socket on which the mock agent should listen.
 * @param routes Application API routes and the responses they should return.
 */
export async function mockAgentServer(socketPath: string, routes: MockAgentRoute[]): Promise<http.Server> {
    const server = http.createServer(async (request, response) => {
        const route = routes.find(candidate =>
            candidate.method === request.method && candidate.path === request.url);
        if (!route) {
            response.writeHead(404).end();
            return;
        }

        try {
            let requestBody = '';
            request.setEncoding('utf-8');
            for await (const chunk of request) {
                requestBody += chunk;
            }
            const mockRequest: MockAgentRequest = {
                body: requestBody ? JSON.parse(requestBody) : undefined,
            };
            const mockResponse = typeof route.response === 'function' ?
                await route.response(mockRequest) : route.response;
            const statusCode = mockResponse.statusCode ?? 200;
            const headers = { ...mockResponse.headers };
            const body = typeof mockResponse.body === 'string' ?
                mockResponse.body : mockResponse.body === undefined ? undefined : JSON.stringify(mockResponse.body);
            if (typeof mockResponse.body === 'object' && !headers['content-type']) {
                headers['content-type'] = 'application/json';
            }
            response.writeHead(statusCode, headers);
            if (body !== undefined) {
                response.write(body);
            }
            if (!mockResponse.keepOpen) {
                response.end();
            }
        }
        catch (error) {
            response.writeHead(500).end(error instanceof Error ? error.message : String(error));
        }
    });
    await new Promise<void>(resolve => server.listen(socketPath, resolve));
    return server;
}

/**
 * Returns the smallest valid inference-runner registration used to exercise the client transport
 * independently of model loading.
 */
export function testRegistration(): InferenceRunnerRegistration {
    return {
        kind: 'inference_runner',
        version: '1.0.0',
        contractVersion: 1,
        artifact: {
            kind: 'containerImage',
            reference: 'inference-container:test',
        },
        models: [],
    };
}

/**
 * Waits for an asynchronous server observation so the tests can verify command-stream setup without
 * coupling themselves to the exact ordering of Node.js HTTP callbacks.
 *
 * @param predicate Returns true once the expected server-side observation has occurred.
 */
export async function waitFor(predicate: () => boolean) {
    const deadline = Date.now() + 1000;
    while (!predicate()) {
        if (Date.now() >= deadline) {
            throw new Error('Timed out waiting for condition');
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}
