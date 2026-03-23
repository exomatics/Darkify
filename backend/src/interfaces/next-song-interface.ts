// export interface GetNextSong {
//   context: SongContext;
//   id: string;
//   search: string;
//   loop: boolean;
//   shuffle: boolean;
//   currentTrackId: string;
//   index: number;
// }
export type GetNextSong =
  | {
      context: Exclude<SongContext, SongContext.Liked>;
      id: string;
      search?: string;
      loop: boolean;
      shuffle: boolean;
      currentTrackId: string;
      index: number;
    }
  | {
      context: SongContext.Liked;
      id?: string;
      search?: string;
      loop: boolean;
      shuffle: boolean;
      currentTrackId: string;
      index: number;
    };
export enum SongContext {
  Playlist = 'playlist',
  Album = 'album',
  Releases = 'releases',
  Liked = 'liked',
  ArtistTop10 = 'artist-top10',
  Other = 'other',
}
