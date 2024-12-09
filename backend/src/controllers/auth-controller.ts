//postgreSQl требует null для строк с null

import crypto from 'node:crypto';

import database from '../config/database.ts';
import issueJWT from '../utils/jwt-issuance.ts';
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
      return issueJWT({ id: newUser.dataValues.id, hash: newUser.dataValues.hash });
    } catch {
      return new Error('internal Error');
    }
  },
  async authenticateUser(UserInfo: { id: string; hash: string; password: string }) {
    try {
      const user = await database.userModel.findByPk(UserInfo.id);

      if (user === null) {
        return;
      }

      const isValid = verificatePassword(UserInfo.password, UserInfo.hash, user.dataValues.salt);

      return isValid ? issueJWT({ id: user.dataValues.id, hash: user.dataValues.hash }) : false;
    } catch {
      return new Error('internal Error');
    }
  },
};
