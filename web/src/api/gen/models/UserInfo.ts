/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserInfo = {
    user_id?: string;
    visible_username?: string;
    is_artist?: boolean;
    avatar_url?: string | null;
    followers?: number;
    /**
     * Only present when is_artist is true
     */
    banner_url?: string | null;
    /**
     * Artist bio. Only present when is_artist is true
     */
    description?: string | null;
    /**
     * Whether the authenticated caller follows this user. Only present when request is authenticated and caller is not the profile owner.
     */
    is_following?: boolean;
};

