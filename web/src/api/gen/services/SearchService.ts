/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArtistAlbumInfo } from '../models/ArtistAlbumInfo';
import type { PlaylistInfo } from '../models/PlaylistInfo';
import type { PlaylistTrackInfo } from '../models/PlaylistTrackInfo';
import type { TrackInfo } from '../models/TrackInfo';
import type { UserPreview } from '../models/UserPreview';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SearchService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Global search across tracks, artists, albums, playlists and users
     * @param search Search string
     * @returns any Search results across all categories (up to 9 results per category)
     * @throws ApiError
     */
    public getSearchGlobal(
        search: string,
    ): CancelablePromise<{
        tracks?: Array<TrackInfo>;
        artists?: Array<Record<string, any>>;
        albums?: Array<ArtistAlbumInfo>;
        playlists?: Array<PlaylistInfo>;
        users?: Array<UserPreview>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/search/global',
            query: {
                'search': search,
            },
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
    /**
     * Search for tracks with pagination
     * @param search
     * @param limit
     * @param offset
     * @returns any Paginated track search results
     * @throws ApiError
     */
    public getSearchTracks(
        search: string,
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
            url: '/search/tracks',
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
     * Search for artists with pagination
     * @param search
     * @param limit
     * @param offset
     * @returns any Paginated artist search results
     * @throws ApiError
     */
    public getSearchArtists(
        search: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        offset?: number;
        next?: number | null;
        items?: Array<Record<string, any>>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/search/artists',
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
     * Search for playlists with pagination
     * @param search
     * @param limit
     * @param offset
     * @returns any Paginated playlist search results
     * @throws ApiError
     */
    public getSearchPlaylists(
        search: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        offset?: number;
        next?: number | null;
        items?: Array<PlaylistInfo>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/search/playlists',
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
     * Search for albums with pagination
     * @param search
     * @param limit
     * @param offset
     * @returns any Paginated album search results
     * @throws ApiError
     */
    public getSearchAlbums(
        search: string,
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<{
        total?: number;
        offset?: number;
        next?: number | null;
        items?: Array<ArtistAlbumInfo>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/search/albums',
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
     * Search for users with pagination
     * @param search
     * @param limit
     * @param offset
     * @returns any Paginated user search results
     * @throws ApiError
     */
    public getSearchUsers(
        search: string,
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
            url: '/search/users',
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
     * @param playlistId
     * @param search Name of the track, artist name, album name or a part from the lyrics
     * @param sort
     * @param order
     * @param limit
     * @param offset
     * @returns PlaylistTrackInfo playlist tracks
     * @throws ApiError
     */
    public getSearchPlaylistsTracks(
        playlistId: string,
        search: string,
        sort: 'name' | 'date_added' | 'album' | 'duration' | 'artist' | 'order' = 'order',
        order: 'ASC' | 'DESC' = 'DESC',
        limit: number = 5,
        offset?: number,
    ): CancelablePromise<PlaylistTrackInfo> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/search/playlists/{playlistId}/tracks',
            path: {
                'playlistId': playlistId,
            },
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
