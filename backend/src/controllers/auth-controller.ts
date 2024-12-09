//postgreSQl требует null для строк с null

import crypto from 'node:crypto';

import database from '../config/database.ts';
import { issueAccessToken, issueRefreshToken } from '../utils/jwt-issuance.ts';
import generatePassword from '../utils/password-generation.ts';
import verificatePassword from '../utils/password-verification.ts';

import type { IUser } from '../interfaces/user-interface.ts';

export default {
  async registerUser(userInfo: IUser) {
    try {
      const saltHash = generatePassword(userInfo.password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;
      const newUser = await database.userModel.create({
        id: crypto.randomUUID(),
        is_artist: false,

        hash,

        salt,

        username: userInfo.username,

        email: userInfo.email,

        avatar_id: crypto.randomUUID(),
        //postgreSQl требует null для строк с null
        // eslint-disable-next-line unicorn/no-null
        followers_id: null,
        // eslint-disable-next-line unicorn/no-null
        following_id: null,
        //maybe liked songs

        // eslint-disable-next-line unicorn/no-null
        playlist: null,
      });
      const accessToken = issueAccessToken({
        id: newUser.dataValues.id,
        hash: newUser.dataValues.hash,
      });
      const refreshToken = issueRefreshToken({
        id: newUser.dataValues.id,
        hash: newUser.dataValues.hash,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch {
      return new Error('internal error');
    }
  },
  async sendNewAccessTokenToUser(userInfo: { id: string; hash: string }) {
    const user = await database.userModel.findByPk(userInfo.id);
    if (user === null) {
      return;
    }
    if (userInfo.hash === user.dataValues.hash) {
      return { accesToken: issueAccessToken({ id: userInfo.id, hash: user.dataValues.hash }) };
    }
  },
  async authenticateUser(userInfo: { id: string; hash: string; password: string }) {
    try {
      const user = await database.userModel.findByPk(userInfo.id);

      if (user === null) {
        return;
      }

      const isValid = verificatePassword(
        userInfo.password,
        user.dataValues.hash,
        user.dataValues.salt,
      );
      if (!isValid) {
        return false;
      }
      const accessToken = issueAccessToken({ id: user.dataValues.id, hash: user.dataValues.hash });
      const refreshToken = issueRefreshToken({
        id: user.dataValues.id,
        hash: user.dataValues.hash,
      });
      return {
        accessToken,
        refreshToken,
      };
    } catch {
      return new Error('internal Error');
    }
  },
};
