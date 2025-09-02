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
     * Get trackInfo by id
     * @param trackId
     * @returns TrackInfo trackInfo
     * @throws ApiError
     */
    public getTracks(
        trackId: string,
    ): CancelablePromise<TrackInfo> {
        return this.httpRequest.request({
            method: 'GET',
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
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public deleteTracks(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/tracks/{trackId}',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Get all tracks by trackName. Case insensitive
     * @param trackName
     * @returns TrackInfo array of trackInfo
     * @throws ApiError
     */
    public getTracksSearch(
        trackName: string,
    ): CancelablePromise<Array<TrackInfo>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/tracks/search/{trackName}',
            path: {
                'trackName': trackName,
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
}
