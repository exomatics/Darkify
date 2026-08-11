/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PlaylistInfo = {
    owner?: {
        id?: string;
        visible_username?: string;
    };
    name?: string;
    description?: string | null;
    /**
     * only one or 4 urls or null if no covers on tracks
     */
    placeholder_url_covers?: any[] | null;
    album?: Array<{
        id?: string;
        name?: string;
    }>;
    cover_url?: string | null;
    totalDuration?: number;
    songsCount?: number;
    isOwner?: boolean;
    restrictions?: PlaylistInfo.restrictions;
    type?: PlaylistInfo.type;
};
export namespace PlaylistInfo {
    export enum restrictions {
        PRIVATE = 'private',
        UNLISTED = 'unlisted',
        PUBLIC = 'public',
    }
    export enum type {
        GENERAL = 'general',
        LIKED_SONGS = 'liked_songs',
        ALBUM = 'album',
    }
}

