/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArtistAlbumInfo } from '../models/ArtistAlbumInfo';
import type { PlaylistInfo } from '../models/PlaylistInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DashboardService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get dashboard data for the current user
     * @returns any Dashboard data
     * @throws ApiError
     */
    public getDashboard(): CancelablePromise<{
        /**
         * Recently released singles and albums
         */
        recently_released?: Array<{
            id?: string;
            name?: string;
            type?: 'single' | 'album';
            cover_url?: string | null;
            is_followed?: boolean;
            date_released?: string | null;
        }>;
        random_albums?: Array<ArtistAlbumInfo>;
        random_artists?: Array<{
            id?: string;
            name?: string;
            avatar_url?: string | null;
            banner_url?: string | null;
        }>;
        random_playlists?: Array<PlaylistInfo>;
        recently_played?: Array<{
            id?: string;
            name?: string;
            type?: 'single' | 'album';
            cover_url?: string | null;
            is_followed?: boolean;
            date_released?: string | null;
            date_played?: string;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/dashboard',
            errors: {
                400: `Validation failed`,
                401: `Unauthorized or invalid token`,
            },
        });
    }
}
