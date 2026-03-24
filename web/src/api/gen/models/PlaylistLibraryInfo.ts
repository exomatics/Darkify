/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PlaylistLibraryInfo = Array<{
    date_played?: string;
    date_added?: string;
    playlists?: {
        id?: string;
        name?: string;
        owner?: {
            id?: string;
            visible_username?: string;
        };
        cover_url?: string | null;
        description?: string | null;
        /**
         * only one or 4 urls or null if no urls on tracks
         */
        placeholder_url_covers?: any[] | null;
        type?: 'general' | 'liked_songs' | 'album';
    };
}>;
