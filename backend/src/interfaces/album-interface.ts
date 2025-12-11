export enum AlbumsSortBy {
  Released = 'date_released',
  AddDate = 'date_added',
  Alphabetic = 'name',
  Custom = 'order',
}

export interface IUpdateAlbum {
  playlistId: string;
  name?: string | null;
  releaseDate?: Date;
}
