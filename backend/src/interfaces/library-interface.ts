export enum LibrarySortBy {
  AddDate = 'date_added',
  PlayDate = 'date_played',
  Alphabetic = 'name',
  Custom = 'order',
}
export enum LibraryType {
  Albums = 'albums',
  Singles = 'singles',
}
export interface IReleasesReorder {
  releaseId: string;
  userId: string;
  releaseType: LibraryType;
  fromIndex: number;
  toIndex: number;
}
