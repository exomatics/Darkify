/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type TrackInfo = {
  id?: string;
  name?: string;
  artists?: Array<{
    id?: string;
    visible_username?: string;
  }>;
  cover_url?: string;
  'lyrics?'?: string | null;
  play_count?: number;
  'deleted?'?: boolean;
  duration?: string;
};
