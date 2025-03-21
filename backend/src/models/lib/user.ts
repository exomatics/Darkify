import crypto from 'node:crypto';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import NotFoundError from '../../errors/not-found-error.ts';
import ValidationError from '../../errors/validation-error.ts';
import { issueAccessToken, issueBothTokens } from '../../utils/jwt-issuance.ts';
import generatePassword from '../../utils/password-generation.ts';
import verifyPassword from '../../utils/password-verification.ts';

import type { IUser } from '../../interfaces/user-interface.ts';
import type { UserFollowingModel } from '../user-following.ts';
import type { InferAttributes, InferCreationAttributes, Model } from 'sequelize';

const user = {
  async getUserById(userId: string) {
    const userRecord = await database.userModel.findByPk(userId);
    if (!userRecord) {
      throw new NotFoundError(errorMessages.user.NotExistsById);
    }
    return userRecord;
  },
  async isEmailExist(email: string) {
    const userRecord = await database.userModel.findOne({
      where: {
        email,
      },
    });
    return !!userRecord;
  },
  async getUserByEmailOrUsername(userInfo: Pick<IUser, 'username' | 'email' | 'password'>) {
    let userRecord;
    if (userInfo.username) {
      userRecord = await database.userModel.findOne({
        where: { username: userInfo.username },
      });
    } else if (userInfo.email && !userInfo.username) {
      userRecord = await database.userModel.findOne({
        where: { email: userInfo.email },
      });
    }
    if (!userRecord) {
      throw new ValidationError(errorMessages.user.NotExistsByUsernameOrEmail);
    }
    return userRecord;
  },
  async getUserFollowersNumber(userId: string) {
    await this.getUserById(userId);
    const numberOfFollowers = await database.userFollowersModel.count({
      where: { user_id: userId },
    });
    return numberOfFollowers;
  },
  async getUserFollowing(
    userId: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    await this.getUserById(userId);

    const userFollowingRecords = await database.userFollowingModel.findAndCountAll({
      where: { user_id: userId },
      offset,
      limit,
    });
    const userFollowingData = userFollowingRecords.rows.map(
      (
        userFollowingRecord: Model<
          InferAttributes<UserFollowingModel>,
          InferCreationAttributes<UserFollowingModel>
        >,
      ) => {
        return userFollowingRecord.dataValues.following_id;
      },
    );
    if (!userFollowingData[0]) {
      throw new NotFoundError(errorMessages.user.NotFollowsAnyone);
    }

    return { rows: userFollowingData, count: userFollowingRecords.count };
  },
  async updateUserInfo(userId: string, userInfo: Pick<IUser, 'visibleUsername'>) {
    const userRecord = await this.getUserById(userId);
    await userRecord.update({
      visible_username: userInfo.visibleUsername ?? userRecord.visible_username,
    });
    return userRecord;
  },
  async followUser(userId: string, followId: string) {
    await this.getUserById(userId);

    const userFollowingRecord = await database.userFollowingModel.findOne({
      where: { user_id: userId, following_id: followId },
    });
    if (userFollowingRecord) {
      throw new ValidationError(errorMessages.user.AlreadyFollowsUser);
    }

    await database.userFollowingModel.create({ user_id: userId, following_id: followId });
    await database.userFollowersModel.create({ followers_id: userId, user_id: followId });

    return true;
  },
  async unfollowUser(userId: string, unfollowId: string) {
    const userFollowingRecord = await database.userFollowingModel.findOne({
      where: { user_id: userId, following_id: unfollowId },
    });
    const userFollowersRecord = await database.userFollowersModel.findOne({
      where: { followers_id: userId, user_id: unfollowId },
    });

    if (!userFollowingRecord || !userFollowersRecord) {
      throw new NotFoundError(errorMessages.user.NotFollowsUser);
    }

    await userFollowingRecord.destroy();
    await userFollowersRecord.destroy();

    return true;
  },
  async isPlaylistExist(playlistId: string) {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    return !!playlistRecord;
  },
  async followPlaylist(userId: string, playlistId: string) {
    const isPlaylistExist = await this.isPlaylistExist(playlistId);
    if (!isPlaylistExist) {
      throw new NotFoundError(errorMessages.playlist.NotExistsById);
    }
    const playlistFollowersRecord = await database.playlistFollowersModel.findOne({
      where: { user_id: userId, playlist_id: playlistId },
    });
    if (playlistFollowersRecord) {
      throw new ValidationError(errorMessages.user.AlreadyFollowsPlaylist);
    }
    await database.playlistFollowersModel.create({ user_id: userId, playlist_id: playlistId });
    return true;
  },
  async unfollowPlaylist(userId: string, playlistId: string) {
    const isPlaylistExist = await this.isPlaylistExist(playlistId);
    if (!isPlaylistExist) {
      throw new NotFoundError(errorMessages.playlist.NotExistsById);
    }
    const playlistFollowersRecord = await database.playlistFollowersModel.findOne({
      where: { user_id: userId, playlist_id: playlistId },
    });
    if (!playlistFollowersRecord) {
      throw new NotFoundError(errorMessages.user.NotFollowsPlaylist);
    }
    await playlistFollowersRecord.destroy();
    return true;
  },
  async deleteUser(userId: string) {
    const userRecord = await this.getUserById(userId);
    await userRecord.destroy();

    return true;
  },
  async registerUser(userInfo: { password: string; email: string }) {
    const { salt, hash } = generatePassword(userInfo.password);

    if (await this.isEmailExist(userInfo.email)) {
      throw new ValidationError(errorMessages.user.EmailAlreadyExists);
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
    });

    const tokens = issueBothTokens({
      userId: newUser.id,
      hash: newUser.hash,
    });

    return {
      ...tokens,
    };
  },
  async sendNewAccessTokenToUser(userInfo: { userId: string; hash: string }) {
    const userRecord = await this.getUserById(userInfo.userId);
    if (userInfo.hash === userRecord.hash) {
      return { accessToken: issueAccessToken({ userId: userInfo.userId, hash: userRecord.hash }) };
    }
  },
  async authenticateUser(userInfo: Pick<IUser, 'username' | 'email' | 'password'>) {
    const userRecord = await this.getUserByEmailOrUsername(userInfo);

    const isCorrectPassword = verifyPassword(userInfo.password, userRecord.hash, userRecord.salt);
    if (!isCorrectPassword) {
      throw new ValidationError(errorMessages.user.WrongPassword);
    }
    const tokens = issueBothTokens({
      userId: userRecord.id,
      hash: userRecord.hash,
    });
    return {
      ...tokens,
    };
  },
};
export default user;
