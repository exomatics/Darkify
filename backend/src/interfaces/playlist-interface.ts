import type { Itrack } from './track-interface';
import type { IUser } from './user-interface';
export interface IPlaylist {
  id: string;
  tracks: Array<Itrack['id']>;
  name: string;
  description: string;
  coverUrl: string;
  owner: IUser['id'];
  restrictions: IUser['id'] | null;
  // users: IUser['id'][]
}
