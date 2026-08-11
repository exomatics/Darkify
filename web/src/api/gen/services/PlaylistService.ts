/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlaylistInfo } from '../models/PlaylistInfo';
import type { PlaylistTrackInfo } from '../models/PlaylistTrackInfo';
import type { ReorderRequestBody } from '../models/ReorderRequestBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PlaylistService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param playlistId
     * @returns PlaylistInfo Playlist information
     * @throws ApiError
     */
    public getPlaylists(
        playlistId: string,
    ): CancelablePromise<PlaylistInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/playlists/{playlistId}',
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
     * @param playlistId
     * @param requestBody
     * @returns PlaylistInfo Playlist information
     * @throws ApiError
     */
    public putPlaylists(
        playlistId: string,
        requestBody?: {
            name?: string;
            description?: string | null;
        },
    ): CancelablePromise<PlaylistInfo> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/playlists/{playlistId}',
            path: {
                'playlistId': playlistId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param playlistId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public deletePlaylists(
        playlistId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/playlists/{playlistId}',
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
     * @param playlistId
     * @param limit
     * @param offset
     * @param sort
     * @param order
     * @returns PlaylistTrackInfo array of playlist tracks information
     * @throws ApiError
     */
    public getPlaylistsTracks(
        playlistId: string,
        limit: number = 5,
        offset?: number,
        sort: 'name' | 'date_added' | 'album' | 'duration' | 'artist' | 'order' = 'order',
        order: 'ASC' | 'DESC' = 'DESC',
    ): CancelablePromise<PlaylistTrackInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/playlists/{playlistId}/tracks',
            path: {
                'playlistId': playlistId,
            },
            query: {
                'limit': limit,
                'offset': offset,
                'sort': sort,
                'order': order,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param playlistId
     * @returns PlaylistInfo Playlist information
     * @throws ApiError
     */
    public getPlaylistsCover(
        playlistId: string,
    ): CancelablePromise<PlaylistInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/playlists/{playlistId}/cover',
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
     * @param playlistId
     * @param formData
     * @returns PlaylistInfo Playlist information
     * @throws ApiError
     */
    public putPlaylistsCover(
        playlistId: string,
        formData?: any,
    ): CancelablePromise<PlaylistInfo> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/playlists/{playlistId}/cover',
            path: {
                'playlistId': playlistId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param search name of the playlist
     * @param limit
     * @param offset
     * @returns any Data of all playlists with playlistName. ILIKE
     * @throws ApiError
     */
    public getPlaylists1(
        search?: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        items?: Array<{
            owner?: string;
            name?: string;
            description?: string | null;
            cover_url?: string | null;
            ownerName?: string;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/playlists',
            query: {
                'search': search,
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
     * @param formData
     * @returns any Playlist information
     * @throws ApiError
     */
    public postPlaylists(
        formData?: {
            name?: string | null;
            cover?: Blob | null;
            description?: string | null;
            /**
             * default restriction is private
             */
            restrictions?: 'private' | 'unlisted' | 'public';
        },
    ): CancelablePromise<(PlaylistInfo & {
        id?: string;
    })> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/playlists',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any playlistTrackId to remove track
     * @throws ApiError
     */
    public postPlaylistsAddTrack(
        requestBody?: {
            trackId?: string;
            playlistId?: string;
        },
    ): CancelablePromise<{
        playlistTrackId?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/playlists/add-track',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postPlaylistsRemoveTrack(
        requestBody: {
            playlistId: string;
            playlistTrackId: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/playlists/remove-track',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param playlistId
     * @param requestBody
     * @returns PlaylistInfo Playlist information
     * @throws ApiError
     */
    public putPlaylistsRestrictions(
        playlistId: string,
        requestBody?: {
            restrictions?: 'private' | 'unlisted' | 'public';
        },
    ): CancelablePromise<PlaylistInfo> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/playlists/{playlistId}/restrictions',
            path: {
                'playlistId': playlistId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Reorder playlist`s custom order. Indexes must be exactly indexes, in other words start from 0. To reorder to 0 index, need to send toIndex 0. To reorder to the last index, need to send toIndex -1 or the last existing index.
     * @param playlistId
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putPlaylistsReorder(
        playlistId: string,
        requestBody: ReorderRequestBody,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/playlists/{playlistId}/reorder',
            path: {
                'playlistId': playlistId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
}
