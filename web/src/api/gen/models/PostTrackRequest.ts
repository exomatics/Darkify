/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PostTrackRequest = {
    name?: string;
    cover?: Blob;
    track?: Blob;
    artists?: Array<{
        id?: string;
        visible_username?: string;
    }>;
    lyrics?: string | null;
};

