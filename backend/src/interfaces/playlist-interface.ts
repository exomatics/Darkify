export enum Restrictions {
  Public = 'public',
  Private = 'private',
  Unlisted = 'unlisted',
}
export interface IPlaylist {
  playlistId: string;
  name: string;
  description: string;
  cover_id: string;
  owner: string;
  restrictions: Restrictions;
  type: Type;
}
export interface IUpdateTrack {
  playlistId: string;
  name?: string;
  description?: string;
}
export enum Type {
  General = 'general',
  Album = 'album',
}
export enum sortBy {
  Title = 'name',
  Date = 'date_added',
  Album = 'album',
  Duration = 'duration',
  Custom = 'order',
}
export enum Order {
  Asc = 'ASC',
  Desc = 'DESC',
}
