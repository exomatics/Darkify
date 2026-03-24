/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LibraryInfo } from '../models/LibraryInfo';
import type { PlaylistLibraryInfo } from '../models/PlaylistLibraryInfo';
import type { ReorderRequestBody } from '../models/ReorderRequestBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LibraryService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * get user library
     * @returns LibraryInfo user library
     * @throws ApiError
     */
    public getMeLibrary(): CancelablePromise<LibraryInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/me/library',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * get all playlist from user library
     * @param limit
     * @param offset
     * @param sort
     * @param order
     * @returns any array of library playlists
     * @throws ApiError
     */
    public getMeLibraryPlaylists(
        limit: number = 5,
        offset?: number,
        sort: 'date_added' | 'date_played' | 'name' | 'order' = 'order',
        order: 'ASC' | 'DESC' = 'DESC',
    ): CancelablePromise<{
        items?: PlaylistLibraryInfo;
        total?: number;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/me/library/playlists',
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
     * Get all followed artists from user library
     * @returns any Library artists
     * @throws ApiError
     */
    public getMeLibraryArtists(): CancelablePromise<{
        total?: number;
        items?: Array<{
            id?: string;
            name?: string;
            avatar_url?: string | null;
            banner_url?: string | null;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/me/library/artists',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get all saved albums and singles from user library
     * @param limit
     * @param offset
     * @param sort
     * @param order
     * @returns any Library releases (albums and singles)
     * @throws ApiError
     */
    public getMeLibraryReleases(
        limit: number = 5,
        offset?: number,
        sort: 'date_added' | 'date_played' | 'name' | 'order' = 'order',
        order: 'ASC' | 'DESC' = 'DESC',
    ): CancelablePromise<{
        total?: number;
        next?: number | null;
        offset?: number;
        items?: Array<Record<string, any>>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/me/library/releases',
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
     * Reorder a release in the user library
     * @param releaseId
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putMeLibraryReleasesReorder(
        releaseId: string,
        requestBody: {
            /**
             * Whether the release is an album or a single
             */
            releaseType: 'albums' | 'singles';
            fromIndex: number;
            toIndex: number;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/me/library/releases/{releaseId}/reorder',
            path: {
                'releaseId': releaseId,
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
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putMeLibraryPlaylistsReorder(
        playlistId: string,
        requestBody?: ReorderRequestBody,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/me/library/playlists/{playlistId}/reorder',
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
