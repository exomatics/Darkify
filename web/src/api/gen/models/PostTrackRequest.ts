/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PostTrackRequest = {
    name?: string;
    cover?: Blob;
    track?: Blob;
    /**
     * JSON-encoded array of artist UUIDs (excluding the uploader, who is added automatically). Example: ["uuid1","uuid2"]
     */
    artists?: string;
    /**
     * Optional album to associate the track with at upload time.
     */
    albumId?: string;
    lyrics?: string | null;
};

