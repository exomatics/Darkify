/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PostTrackRequest } from '../models/PostTrackRequest';
import type { PutTrackRequest } from '../models/PutTrackRequest';
import type { TrackInfo } from '../models/TrackInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TrackService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get track info by ID
     * @param trackId
     * @returns TrackInfo trackInfo
     * @throws ApiError
     */
    public getTracks(
        trackId: string,
    ): CancelablePromise<TrackInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tracks/',
            query: {
                'trackId': trackId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Upload track
     * @param formData
     * @returns TrackInfo trackInfo
     * @throws ApiError
     */
    public postTracks(
        formData?: PostTrackRequest,
    ): CancelablePromise<TrackInfo> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tracks/',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Update trackInfo by id
     * @param trackId
     * @param formData
     * @returns TrackInfo trackInfo
     * @throws ApiError
     */
    public putTracks(
        trackId: string,
        formData: PutTrackRequest,
    ): CancelablePromise<TrackInfo> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/tracks/{trackId}',
            path: {
                'trackId': trackId,
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
     * Delete track by id
     * @param trackId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public deleteTracks(
        trackId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/tracks/{trackId}',
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
     * Get all tracks by trackName. Case insensitive
     * @param trackName
     * @param limit
     * @param offset
     * @returns any array of trackInfo
     * @throws ApiError
     */
    public getTracksSearch(
        trackName: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        offset?: number;
        next?: number | null;
        items?: Array<TrackInfo>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tracks/search/{trackName}',
            path: {
                'trackName': trackName,
            },
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
     * Get m3u8 file for streaming. Depends on user's chosen bitrate
     * @param trackId
     * @returns binary m3u8 playlist file
     * @throws ApiError
     */
    public getTracksStream(
        trackId: string,
    ): CancelablePromise<Blob> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tracks/stream/{trackId}',
            path: {
                'trackId': trackId,
            },
        });
    }
    /**
     * Get lyrics for a track
     * @param trackId
     * @returns any Track lyrics
     * @throws ApiError
     */
    public getTracksLyrics(
        trackId: string,
    ): CancelablePromise<{
        lyrics?: string | null;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tracks/{trackId}/lyrics',
            path: {
                'trackId': trackId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Get the next song based on context (playlist, album, liked, artist-top10, releases, other)
     * @param requestBody
     * @returns any Next track info
     * @throws ApiError
     */
    public postTracksNext(
        requestBody: {
            /**
             * Playback context
             */
            context: 'playlist' | 'album' | 'liked' | 'artist-top10' | 'releases' | 'other';
            /**
             * Context entity ID (playlistId, albumId, or artistId). Optional for liked context.
             */
            id?: string;
            /**
             * Optional search string to filter tracks within context
             */
            search?: string;
            /**
             * Whether to loop back to the beginning when end is reached
             */
            loop: boolean;
            /**
             * Whether to pick a random next track
             */
            shuffle: boolean;
            /**
             * The current track's ID
             */
            currentTrackId: string;
            /**
             * Current track's index in the queue
             */
            index: number;
        },
    ): CancelablePromise<{
        track_id?: string;
        /**
         * Playlist track ID or album ID depending on context
         */
        local_id?: string | null;
        new_context?: 'playlist' | 'album' | 'liked' | 'artist-top10' | 'releases' | 'other';
        /**
         * Whether playback should stop (end of queue with no loop)
         */
        stopped?: boolean;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tracks/next',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
}
