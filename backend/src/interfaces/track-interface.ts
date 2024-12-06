import type { IUser } from './user-interface';
export interface Itrack {
  id: string;
  name: string;
  artist: Array<IUser['id']>;
  lyrics: string;
  numberOfPlay: number;
}
