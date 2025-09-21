export enum Restrictions {
  Public = 'public',
  Private = 'private',
  Unlisted = 'unlisted',
}
export interface IPlaylist {
  playlistId: string;
  name: string;
  description: string | null;
  cover_id: string | null;
  owner: string;
  restrictions: Restrictions;
  type: Type;
}
export type ICreatePlaylist = Omit<IPlaylist, 'playlistId' | 'type'> & {
  file: Express.Multer.File;
};
export interface IUpdateTrack {
  playlistId: string;
  name?: string;
  description?: string;
}
export enum Type {
  General = 'general',
  Liked = 'liked_songs',
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
