export interface IArtist {
  userId: string;
  description?: string | null;
  bannerId: string | null;
}
export type ICreateArtist = Omit<IArtist, 'bannerId'> & { file?: Express.Multer.File | null };

export enum ArtistSinglesSortBy {
  Popularity = 'play_count',
  CreationDate = 'creation_date',
}
export enum ArtistAlbumsSortBy {
  Popularity = 'play_count',
  ReleaseDate = 'date_released',
}
