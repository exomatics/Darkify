/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SystemService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Health check
     * @returns any Service is healthy
     * @throws ApiError
     */
    public getHealth(): CancelablePromise<{
        status?: 'ok' | 'error';
        db?: 'connected' | 'disconnected';
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/health',
            errors: {
                503: `Service unavailable`,
            },
        });
    }
}
