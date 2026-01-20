import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { Restrictions, Type } from '../interfaces/playlist-interface.ts';
import PlaylistManager from '../models/services/playlist.ts';
import UserManager from '../models/services/user.ts';

import type { IUser } from '../interfaces/user-interface.ts';

const user = new UserManager();
const playlist = new PlaylistManager();
export default {
  async registerUser(userInfo: { password: string; email: string }) {
    const user_id = crypto.randomUUID();
    const userResponse = await user.registerUser({ ...userInfo, user_id });
    if (!userResponse.success) {
      throw new ValidationError(userResponse.reason);
    }
    await playlist.createPlaylist({
      restrictions: Restrictions.Private,
      playlistId: user_id,
      owner: user_id,
      type: Type.Liked,
    });
    return {
      ...userResponse.data,
    };
  },
  async sendNewAccessTokenToUser(userInfo: { user_id: string; hash: string }) {
    const databaseResponse = await user.sendNewAccessTokenToUser(userInfo);
    if (!databaseResponse.success) {
      throw new NotFoundError(databaseResponse.reason);
    }
    return databaseResponse.data;
  },
  async authenticateUser(userInfo: Pick<IUser, 'username' | 'email' | 'password'>) {
    const databaseResponse = await user.authenticateUser(userInfo);
    if (!databaseResponse.success) {
      throw new ValidationError(databaseResponse.reason);
    }
    return databaseResponse.data;
  },
};
