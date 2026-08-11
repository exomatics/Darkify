/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ArtistSingleInfo = {
    id?: string;
    name?: string;
    artists?: Array<{
        id?: string;
        visible_username?: string;
    }>;
    cover_url?: string;
    lyrics?: string | null;
    play_count?: number;
    album_id?: string;
    is_liked?: boolean;
    date_released?: string;
    deleted?: boolean;
    /**
     * Duration of a song in seconds
     */
    duration?: number;
};

