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
    coverUrl?: string;
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

