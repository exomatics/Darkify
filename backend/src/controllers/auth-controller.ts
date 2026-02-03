import database from '../config/database.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { Restrictions, Type } from '../interfaces/playlist-interface.ts';
import PlaylistManager from '../models/services/playlist.ts';
import UserManager from '../models/services/user.ts';

import type { errorMessages } from '../errors/error-messages.ts';
import type { IUser } from '../interfaces/user-interface.ts';
import type { Result } from '../types/result-type.ts';

const user = new UserManager();
const playlist = new PlaylistManager();
export default {
  async registerUser(userInfo: { password: string; email: string }) {
    let userResponse:
      | undefined
      | Result<
          {
            accessToken: { token: string; expires: string };
            refreshToken: { token: string; expires: string };
          },
          typeof errorMessages.user.EmailAlreadyExists
        >;
    const user_id = crypto.randomUUID();
    await database.sequelize.transaction(async (transaction) => {
      userResponse = await user.registerUser({ ...userInfo, transaction, user_id });
      if (!userResponse.success) {
        throw new ValidationError(userResponse.reason);
      }
      await playlist.createPlaylist({
        restrictions: Restrictions.Private,
        playlistId: user_id,
        owner: user_id,
        type: Type.Liked,
        transaction,
      });
    });
    if (!userResponse?.success) {
      throw new ValidationError(userResponse?.reason);
    }
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
