/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserInfo } from '../models/UserInfo';
import type { UserPreview } from '../models/UserPreview';
import type { UserSettings } from '../models/UserSettings';
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
     * Update current user info
     * @param requestBody
     * @returns UserPreview User info
     * @throws ApiError
     */
    public putUsersMe(
        requestBody: {
            visible_username?: string;
            /**
             * Artist bio. Only applicable when the user is an artist.
             */
            description?: string;
        },
    ): CancelablePromise<UserPreview> {
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
    public deleteUsersMe(): CancelablePromise<any> {
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
     * Get current user settings
     * @returns UserSettings List of user settings
     * @throws ApiError
     */
    public getUsersMeSettings(): CancelablePromise<UserSettings> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/me/settings',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Update current user settings
     * @param requestBody
     * @returns UserSettings List of user settings
     * @throws ApiError
     */
    public putUsersMeSettings(
        requestBody: UserSettings,
    ): CancelablePromise<UserSettings> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/users/me/settings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get users followed by current user
     * @param limit
     * @param offset
     * @returns any List of following users
     * @throws ApiError
     */
    public getUsersMeFollowing(
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        offset?: number;
        next?: number | null;
        items?: Array<UserPreview>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/me/following',
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get user info by ID
     * Public endpoint. When called with a valid Bearer token, the response includes `is_following` indicating whether the caller follows this user.
     * @param userId
     * @returns UserInfo User info
     * @throws ApiError
     */
    public getUsers(
        userId: string,
    ): CancelablePromise<UserInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                400: `Validation failed`,
                404: `Resource not found`,
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
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/follow/user/{user_id}',
            path: {
                'user_id': userId,
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
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/unfollow/user/{user_id}',
            path: {
                'user_id': userId,
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
    ): CancelablePromise<any> {
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
    ): CancelablePromise<any> {
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
        avatar_url?: string;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/me/avatar',
        });
    }
    /**
     * Change avatar for current user
     * @param formData
     * @returns any Updated avatar url
     * @throws ApiError
     */
    public putUsersMeAvatar(
        formData?: any,
    ): CancelablePromise<{
        avatar_url?: string | null;
    }> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/users/me/avatar',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Change banner for current user (artists only)
     * @param formData
     * @returns any Updated banner url
     * @throws ApiError
     */
    public putUsersMeBanner(
        formData?: any,
    ): CancelablePromise<{
        banner_url?: string | null;
    }> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/users/me/banner',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Convert current user account to an artist account
     * @param formData
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersMeTurnToArtist(
        formData?: {
            description?: string;
            banner?: Blob | null;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/me/turn-to-artist',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Follow specified album
     * @param albumId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersFollowAlbum(
        albumId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/follow/album/{albumId}',
            path: {
                'albumId': albumId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Unfollow specified album
     * @param albumId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersUnfollowAlbum(
        albumId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/unfollow/album/{albumId}',
            path: {
                'albumId': albumId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Follow specified single
     * @param singleId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersFollowSingle(
        singleId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/follow/single/{singleId}',
            path: {
                'singleId': singleId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Unfollow specified single
     * @param singleId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersUnfollowSingle(
        singleId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/unfollow/single/{singleId}',
            path: {
                'singleId': singleId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Follow specified artist
     * @param artistId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersFollowArtist(
        artistId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/follow/artist/{artistId}',
            path: {
                'artistId': artistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Unfollow specified artist
     * @param artistId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postUsersUnfollowArtist(
        artistId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/users/unfollow/artist/{artistId}',
            path: {
                'artistId': artistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Record that the user played something (updates last-played date)
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putUsersMeEventsPlayed(
        requestBody: {
            event_data: ({
                section: 'playlists';
                playlist_id: string;
            } | {
                section: 'albums';
                album_id: string;
            } | {
                section: 'singles';
                track_id: string;
            });
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/users/me/events/played',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Change current user password
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putUsersMePassword(
        requestBody: {
            current_password: string;
            new_password: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/users/me/password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get users that follow the current user
     * @param limit
     * @param offset
     * @returns any List of followers
     * @throws ApiError
     */
    public getUsersMeFollowers(
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        offset?: number;
        next?: number | null;
        items?: Array<UserPreview>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/users/me/followers',
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
}
