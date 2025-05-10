/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessToken } from '../models/AccessToken';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { Token } from '../models/Token';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Register new user
     * @param requestBody
     * @returns Token Successful response with both access and refresh tokens
     * @throws ApiError
     */
    public postUsersRegister(
        requestBody: RegisterRequest,
    ): CancelablePromise<Token> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
            },
        });
    }
    /**
     * Login user
     * @param requestBody
     * @returns Token Successful response with both access and refresh tokens
     * @throws ApiError
     */
    public postUsersLogin(
        requestBody: LoginRequest,
    ): CancelablePromise<Token> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
            },
        });
    }
    /**
     * Issue new access token using refresh token
     * @returns AccessToken Access token returned
     * @throws ApiError
     */
    public postUsersRefreshToken(): CancelablePromise<AccessToken> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/refresh-token',
            errors: {
                400: `Validation failed`,
            },
        });
    }
}
