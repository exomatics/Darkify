import { Type } from '../types/playlist-type.ts';
import { Restrictions } from '../types/restrictions-type.ts';

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
