export enum Restrictions {
  Public = 'public',
  Private = 'private',
  Unlisted = 'unlisted',
}
export interface IPlaylist {
  playlistId: string;
  name: string;
  description?: string | null;
  coverId: string | null;
  owner: string;
  restrictions: Restrictions;
  type: Type;
}
export type ICreatePlaylist = Omit<
  IPlaylist,
  'playlistId' | 'name' | 'type' | 'coverId' | 'restrictions'
> & {
  name: string | null;
  restrictions?: Restrictions;
  file: Express.Multer.File | null;
};
export interface IReorder {
  playlistId: string;
  userId: string;
  fromIndex: number;
  toIndex: number;
}
export interface IUpdatePlaylist {
  playlistId: string;
  name?: string | null;
  description?: string | null;
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
  Artist = 'artist',
  Custom = 'order',
}
export enum Order {
  Asc = 'ASC',
  Desc = 'DESC',
}
