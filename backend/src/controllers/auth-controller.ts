import user from '../models/lib/user.ts';

import type { IUser } from '../interfaces/user-interface.ts';

export default {
  async registerUser(userInfo: { password: string; email: string }) {
    const tokens = await user.registerUser(userInfo);
    return {
      ...tokens,
    };
  },
  async sendNewAccessTokenToUser(userInfo: { userId: string; hash: string }) {
    const databaseResponse = await user.sendNewAccessTokenToUser(userInfo);
    return databaseResponse;
  },
  async authenticateUser(userInfo: Pick<IUser, 'username' | 'email' | 'password'>) {
    const tokens = await user.authenticateUser(userInfo);
    return tokens;
  },
};
