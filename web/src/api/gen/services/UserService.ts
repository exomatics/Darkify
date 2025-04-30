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
     * @returns UserInfo User info
     * @throws ApiError
     */
    public getUsersMe(): CancelablePromise<UserInfo> {
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
     * Get users followed by current user
     * @returns any List of following users
     * @throws ApiError
     */
    public getUsersMeFollowing(): CancelablePromise<{
        total?: number;
        offset?: number;
        next?: number | null;
        items?: Array<UserPreview>;
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
     * @returns UserInfo User info
     * @throws ApiError
     */
    public getUsers(
        userId: string,
    ): CancelablePromise<UserInfo> {
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
}
