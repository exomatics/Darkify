import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import UserManager from '../models/services/user.ts';

import type { IUser } from '../interfaces/user-interface.ts';
const user = new UserManager();
export default {
  async registerUser(userInfo: { password: string; email: string }) {
    const databaseResponse = await user.registerUser(userInfo);
    if (!databaseResponse.success) {
      throw new ValidationError(databaseResponse.reason);
    }
    return {
      ...databaseResponse.data,
    };
  },
  async sendNewAccessTokenToUser(userInfo: { userId: string; hash: string }) {
    const databaseResponse = await user.sendNewAccessTokenToUser(userInfo);
    if (!databaseResponse.success) {
      throw new NotFoundError(databaseResponse.reason);
    }
    return databaseResponse;
  },
  async authenticateUser(userInfo: Pick<IUser, 'username' | 'email' | 'password'>) {
    const databaseResponse = await user.authenticateUser(userInfo);
    if (!databaseResponse.success) {
      throw new ValidationError(databaseResponse.reason);
    }
    return databaseResponse.data;
  },
};
