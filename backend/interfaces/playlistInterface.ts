import { Itrack } from './trackInterface';
import { IUser } from './userInterface';
export interface IPlaylist {
  id: string;
  tracks: Itrack['id'][];
  name: string;
  description: string;
  coverUrl: string;
  owner: IUser['id'];
  restrictions: IUser['id'] | null;
  // users: IUser['id'][]
}
