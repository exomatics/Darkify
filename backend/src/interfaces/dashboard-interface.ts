export enum ReleaseType {
  Single = 'single',
  Album = 'album',
}

export interface RecentRelease {
  id: string;
  name: string;
  type: ReleaseType;
  cover_url: string | null;
  is_followed: boolean;
  date_released: Date | null;
}

export interface RecentlyPlayed {
  id: string;
  name: string;
  type: ReleaseType;
  cover_url: string | null;
  is_followed: boolean;
  date_released: Date | null;
  date_played: Date;
}

export interface RandomAlbum {
  id: string;
  name: string;
  count: number;
  date_released: Date | null;
  is_followed: boolean;
  cover_url: string | null;
}

export interface RandomArtist {
  id: string;
  name: string;
  avatar_url: string | null;
  banner_url: string | null;
}

export interface RandomPlaylist {
  id: string;
  name: string;
  owner: { id: string; visible_username: string };
  cover_url: string | null;
}
