/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlbumInfo } from '../models/AlbumInfo';
import type { AlbumTrackInfo } from '../models/AlbumTrackInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AlbumService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param albumId
     * @returns AlbumInfo Album information
     * @throws ApiError
     */
    public getAlbums(
        albumId: string,
    ): CancelablePromise<AlbumInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/albums/{albumId}',
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
     * @param albumId
     * @param requestBody
     * @returns AlbumInfo Album information
     * @throws ApiError
     */
    public putAlbums(
        albumId: string,
        requestBody?: {
            name?: string;
        },
    ): CancelablePromise<AlbumInfo> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/albums/{albumId}',
            path: {
                'albumId': albumId,
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
     * @param albumId
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public deleteAlbums(
        albumId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/albums/{albumId}',
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
     * @param albumId
     * @returns any cover_url
     * @throws ApiError
     */
    public getAlbumsCover(
        albumId: string,
    ): CancelablePromise<{
        cover_url?: string | null;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/albums/{albumId}/cover',
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
     * @param albumId
     * @param formData
     * @returns any cover_url
     * @throws ApiError
     */
    public putAlbumsCover(
        albumId: string,
        formData?: any,
    ): CancelablePromise<{
        cover_url?: string | null;
    }> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/albums/{albumId}/cover',
            path: {
                'albumId': albumId,
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
     * @param formData
     * @returns any Playlist information
     * @throws ApiError
     */
    public postAlbums(
        formData?: {
            name?: string;
            cover?: Blob | null;
        },
    ): CancelablePromise<{
        id?: string;
        name?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/albums',
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
     * @returns any album_track_id to remove track
     * @throws ApiError
     */
    public postAlbumsAddTrack(
        requestBody?: {
            albumId?: string;
        },
    ): CancelablePromise<{
        album_track_id?: string;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/albums/add-track/{trackId}',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param albumTrackId
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public postAlbumsRemoveTrack(
        albumTrackId: string,
        requestBody?: {
            albumId?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/albums/remove-track/{albumTrackId}',
            path: {
                'albumTrackId': albumTrackId,
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
     * Reorder album`s custom order. Indexes must be exactly indexes, in other words start from 0. To reorder to 0 index, need to send toIndex 0. To reored to the last index, need to send toIndex -1 or the last existing index.
     * @param albumId
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putAlbumsReorder(
        albumId: string,
        requestBody?: {
            fromIndex?: number;
            toIndex?: number;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/albums/{albumId}/reorder',
            path: {
                'albumId': albumId,
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
     * Publish or unpublish an album by setting its release date
     * @param albumId
     * @param requestBody
     * @returns any Successful response with no data
     * @throws ApiError
     */
    public putAlbumsRelease(
        albumId: string,
        requestBody?: {
            /**
             * Release datetime for the album (ISO 8601). Set to null to unpublish.
             */
            releaseDate?: string | null;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/albums/{albumId}/release',
            path: {
                'albumId': albumId,
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
     * @param albumId
     * @param limit
     * @param offset
     * @param sort
     * @param order
     * @returns AlbumTrackInfo array of tracks information in album
     * @throws ApiError
     */
    public getAlbumsTracks(
        albumId: string,
        limit: number = 5,
        offset?: number,
        sort: 'name' | 'date_added' | 'album' | 'duration' | 'artist' | 'play_count' | 'order' = 'order',
        order: 'ASC' | 'DESC' = 'DESC',
    ): CancelablePromise<AlbumTrackInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/albums/{albumId}/tracks',
            path: {
                'albumId': albumId,
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
     * @param limit
     * @param offset
     * @param sort
     * @param order
     * @returns any array of tracks information in album
     * @throws ApiError
     */
    public getMeAlbums(
        limit: number = 5,
        offset?: number,
        sort: 'date_released' | 'date_added' | 'name' | 'order' = 'order',
        order: 'ASC' | 'DESC' = 'DESC',
    ): CancelablePromise<{
        id?: string;
        name?: string;
        published?: boolean;
        date_released?: string;
        cover_url?: string;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/me/albums',
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
}
