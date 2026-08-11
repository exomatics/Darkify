/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AlbumTrackInfo = {
    total?: number;
    items?: Array<{
        name?: string;
        deleted?: boolean;
        /**
         * Duration of a song in seconds
         */
        duration?: number;
        cover_url?: string | null;
        lyrics?: string | null;
        trackId?: string;
        is_liked?: boolean;
        album_track_id?: string;
        dateAdded?: string;
        play_count?: number;
        artists?: Array<{
            id?: string;
            visible_username?: string;
        }>;
    }>;
};

