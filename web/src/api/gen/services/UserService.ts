/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserInfo } from '../models/UserInfo';
import type { UserPreview } from '../models/UserPreview';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UserService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get current user info
     * @returns any User info
     * @throws ApiError
     */
    public getUsersMe(): CancelablePromise<{
        success?: boolean;
        data?: UserInfo;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/me',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Update current user info
     * @param requestBody
     * @returns any User info
     * @throws ApiError
     */
    public putUsersMe(
        requestBody: {
            visibleUsername?: string;
        },
    ): CancelablePromise<{
        success?: boolean;
        data?: UserPreview;
    }> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Delete current user
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public deleteUsersMe(): CancelablePromise<{
        success?: boolean;
        data?: null;
    }> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/users/me',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get users followed by current user
     * @returns any List of following users
     * @throws ApiError
     */
    public getUsersMeFollowing(): CancelablePromise<{
        success?: boolean;
        data?: {
            total?: number;
            offset?: number;
            next?: number | null;
            items?: Array<UserPreview>;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/me/following',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get user info by ID
     * @param userId
     * @returns any User info
     * @throws ApiError
     */
    public getUsers(
        userId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: UserInfo;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Follow specified user
     * @param userId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersFollowUser(
        userId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: null;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/follow/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Unfollow specified user
     * @param userId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersUnfollowUser(
        userId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: null;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/unfollow/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Follow specified playlist
     * @param playlistId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersFollowPlaylist(
        playlistId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: null;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/follow/playlist/{playlistId}',
            path: {
                'playlistId': playlistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Unfollow specified playlist
     * @param playlistId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersUnfollowPlaylist(
        playlistId: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: null;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/unfollow/playlist/{playlistId}',
            path: {
                'playlistId': playlistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get avatar url
     * @returns any avatar url
     * @throws ApiError
     */
    public getUsersMeAvatar(): CancelablePromise<{
        success?: boolean;
        data?: string;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/me/avatar',
        });
    }
    /**
     * Change avatar for current user
     * @param formData
     * @throws ApiError
     */
    public putUsersMeAvatar(
        formData?: any,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/users/me/avatar',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
