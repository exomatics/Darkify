import crypto from 'node:crypto';

import database from '../config/database.ts';
import logger from '../config/logger.ts';
import { issueAccessToken, issueBothTokens } from '../utils/jwt-issuance.ts';
import generatePassword from '../utils/password-generation.ts';
import verificatePassword from '../utils/password-verification.ts';

export default {
  async registerUser(userInfo: { password: string; email: string }) {
    try {
      const { salt, hash } = generatePassword(userInfo.password);
      const isEmailExist = await database.userModel.findOne({
        where: {
          email: userInfo.email,
        },
      });
      if (isEmailExist !== null) {
        return new Error('user with this email already exists');
      }
      const newUser = await database.userModel.create({
        id: crypto.randomUUID(),

        is_artist: false,

        hash,

        salt,

        visible_username: crypto.randomBytes(4).toString('hex'),

        username: crypto.randomBytes(4).toString('hex'),

        email: userInfo.email,

        avatar_id: crypto.randomUUID(),

        followers_id: null,

        following_id: null,
        //maybe liked songs
        playlist: null,
      });
      const tokens = issueBothTokens({
        id: newUser.id,
        hash: newUser.hash,
      });
      return {
        ...tokens,
      };
    } catch {
      logger.error('registerUser internal error');
      return new Error('internal error');
    }
  },
  async sendNewAccessTokenToUser(userInfo: { id: string; hash: string }) {
    const user = await database.userModel.findByPk(userInfo.id);
    if (user === null) {
      return;
    }
    if (userInfo.hash === user.hash) {
      return { accesToken: issueAccessToken({ id: userInfo.id, hash: user.hash }) };
    }
  },
  async authenticateUser(userInfo: { username: string; email: string; password: string }) {
    try {
      let user;
      if (userInfo.username) {
        user = await database.userModel.findOne({
          where: { username: userInfo.username },
        });
      } else if (userInfo.email && !userInfo.username) {
        user = await database.userModel.findOne({
          where: { email: userInfo.email },
        });
      }
      if (user == null) {
        return;
      }

      const isValid = verificatePassword(userInfo.password, user.hash, user.salt);
      if (!isValid) {
        return false;
      }
      const tokens = issueBothTokens({
        id: user.id,
        hash: user.hash,
      });
      return {
        ...tokens,
      };
    } catch {
      logger.error('authenticateUser internal error');
      throw new Error('internal Error');
    }
  },
};
