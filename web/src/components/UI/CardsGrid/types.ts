export enum CardGridElementType {
  Playlist,
  Artist,
  Album,
}

export enum CardGridType {
  Slider,
  Grid,
}

export type CardsGridElement = {
  title: string;
  description?: string;
  coverUrl?: string;
  type: CardGridElementType;
};
