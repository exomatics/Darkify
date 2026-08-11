/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArtistAlbumInfo } from '../models/ArtistAlbumInfo';
import type { ArtistSingleInfo } from '../models/ArtistSingleInfo';
import type { PlaylistTrackInfo } from '../models/PlaylistTrackInfo';
import type { TrackInfo } from '../models/TrackInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ArtistService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param artistId
     * @returns any Artist info
     * @throws ApiError
     */
    public getArtists(
        artistId: string,
    ): CancelablePromise<{
        banner_url?: string | null;
        avatar_url?: string | null;
        followers_count?: number;
        listening_count?: number;
        is_following?: boolean;
        liked_songs_count?: number;
        name?: string;
        description?: string;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/artists/{artistId}',
            path: {
                'artistId': artistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param artistId
     * @param limit
     * @param offset
     * @returns any User's liked songs from Artist
     * @throws ApiError
     */
    public getArtistsLiked(
        artistId: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        items?: Array<PlaylistTrackInfo>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/artists/{artistId}/liked',
            path: {
                'artistId': artistId,
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
     * @param artistId
     * @param limit
     * @param offset
     * @returns any Albums of the artist
     * @throws ApiError
     */
    public getArtistsAlbums(
        artistId: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        items?: Array<ArtistAlbumInfo>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/artists/{artistId}/albums',
            path: {
                'artistId': artistId,
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
     * @param artistId
     * @param limit
     * @param offset
     * @returns any Singles of the artist
     * @throws ApiError
     */
    public getArtistsSingles(
        artistId: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        items?: ArtistSingleInfo;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/artists/{artistId}/singles',
            path: {
                'artistId': artistId,
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
     * @param artistId
     * @returns any Artist top tracks
     * @throws ApiError
     */
    public getArtistsTopTracks(
        artistId: string,
    ): CancelablePromise<{
        total?: number;
        items?: TrackInfo;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/artists/{artistId}/top-tracks',
            path: {
                'artistId': artistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param artistId
     * @returns any most popular albums and singles of the Artist.
     * @throws ApiError
     */
    public getArtistsPopular(
        artistId: string,
    ): CancelablePromise<{
        albums?: Array<ArtistAlbumInfo>;
        singles?: Array<ArtistSingleInfo>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/artists/{artistId}/popular',
            path: {
                'artistId': artistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * @param artistId
     * @returns any Albums and singles of the artist, sorted by date_released
     * @throws ApiError
     */
    public getArtistsDiscography(
        artistId: string,
    ): CancelablePromise<{
        albums?: Array<ArtistAlbumInfo>;
        singles?: Array<ArtistSingleInfo>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/artists/{artistId}/discography',
            path: {
                'artistId': artistId,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
}
