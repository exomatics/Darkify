/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlaylistTrackInfo } from '../models/PlaylistTrackInfo';
import type { ReorderRequestBody } from '../models/ReorderRequestBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LikedService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @returns any Data of all playlists with playlistName. ILIKE
     * @throws ApiError
     */
    public getLiked(): CancelablePromise<{
        count?: number;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liked',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param trackId
     * @returns any playlistTrackId to remove track
     * @throws ApiError
     */
    public postLikedAddTrack(
        trackId: string,
    ): CancelablePromise<{
        playlistTrackId?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liked/add-track/{trackId}',
            path: {
                'trackId': trackId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param playlistTrackId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postLikedRemoveTrack(
        playlistTrackId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/liked/remove-track/{playlistTrackId}',
            path: {
                'playlistTrackId': playlistTrackId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Reorder liked`s custom order. Indexes must be exactly indexes, in other words start from 0. To reorder to 0 index, need to send toIndex 0. To reorder to the last index, need to send toIndex -1 or the last existing index.
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putLikedReorder(
        requestBody: ReorderRequestBody,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/liked/reorder',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param search Name of the track, artist name, album name or a part from the lyrics
     * @param sort
     * @param order
     * @param limit
     * @param offset
     * @returns PlaylistTrackInfo playlist tracks
     * @throws ApiError
     */
    public getLikedTracks(
        search?: string,
        sort: 'name' | 'date_added' | 'album' | 'duration' | 'artist' | 'order' = 'order',
        order: 'ASC' | 'DESC' = 'DESC',
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<PlaylistTrackInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/liked/tracks',
            query: {
                'search': search,
                'sort': sort,
                'order': order,
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
