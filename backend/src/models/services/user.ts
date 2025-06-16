import crypto from 'node:crypto';

import { Op } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_DIRECTORY_PATH } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';
import { issueAccessToken, issueBothTokens } from '../../utils/jwt-issuance.ts';
import generatePassword from '../../utils/password-generation.ts';
import verifyPassword from '../../utils/password-verification.ts';

import { FileUploader } from './file-management.ts';

import type { IUser } from '../../interfaces/user-interface.ts';
import type { Result } from '../../types/result-type.ts';
import type { PlaylistModel } from '../playlist.ts';
import type { UserFollowingModel } from '../user-following.ts';
import type { UserModel } from '../user.ts';
import type { InferAttributes, InferCreationAttributes, Model } from 'sequelize';

interface ResultUserData {
  user_id: string;
  visible_username: string;
  avatar_url: string | null;
}

class UserManager {
  async getUserById(
    user_id: string,
  ): Promise<
    Result<
      UserModel,
      typeof errorMessages.user.NotExistsById | typeof errorMessages.user.NotFollowsAnyone
    >
  > {
    const userRecord = await database.userModel.findByPk(user_id);
    if (!userRecord) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    return { success: true, data: userRecord };
  }
  async isEmailExist(email: string) {
    const userRecord = await database.userModel.findOne({
      where: {
        email,
      },
    });
    return !!userRecord;
  }
  async getUserByEmailOrUsername(
    userInfo: Pick<IUser, 'username' | 'email' | 'password'>,
  ): Promise<
    Result<
      UserModel,
      | typeof errorMessages.user.NotExistsByUsernameOrEmail
      | typeof errorMessages.user.AlreadyFollowsPlaylist
    >
  > {
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
      return { success: false, reason: errorMessages.user.NotExistsByUsernameOrEmail };
    }
    return { success: true, data: userRecord };
  }
  async getUserFollowersNumber(
    user_id: string,
  ): Promise<Result<number, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const followersCount = await database.userFollowersModel.count({
      where: { user_id },
    });
    return { success: true, data: followersCount };
  }
  async getUserFollowing(
    user_id: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<
      { rows: UserModel[]; count: number },
      typeof errorMessages.user.NotExistsById | typeof errorMessages.user.NotFollowsAnyone
    >
  > {
    const userRecord = await this.getUserById(user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const userFollowingRecords = await database.userFollowingModel.findAndCountAll({
      attributes: ['following_id'],
      where: { user_id },
      offset,
      limit,
    });
    const userFollowingData = userFollowingRecords.rows
      .map(
        (
          userFollowingRecord: Model<
            InferAttributes<UserFollowingModel>,
            InferCreationAttributes<UserFollowingModel>
          >,
        ) => {
          return userFollowingRecord.dataValues.following_id;
        },
      )
      .filter((value) => value !== null);
    const followingUsers = await database.userModel.findAll({
      attributes: ['id', 'visible_username', 'avatar_url'],
      where: { id: { [Op.in]: userFollowingData } },
    });
    if (!userFollowingData[0]) {
      return { success: false, reason: errorMessages.user.NotFollowsAnyone };
    }
    return { success: true, data: { rows: followingUsers, count: userFollowingRecords.count } };
  }
  async updateUserInfo(
    user_id: string,
    userInfo: Pick<IUser, 'visible_username'>,
  ): Promise<Result<ResultUserData, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    await userRecord.data.update({
      visible_username: userInfo.visible_username ?? userRecord.data.visible_username,
    });
    return {
      success: true,
      data: {
        user_id: userRecord.data.id,
        visible_username: userRecord.data.visible_username,
        avatar_url: userRecord.data.avatar_url
          ? `${STATIC_DIRECTORY_PATH}/${userRecord.data.avatar_url}.jpg`
          : null,
      },
    };
  }
  async updateUserSettings(
    userId: string,
    userSettings: Pick<IUser, 'bitrate'>,
  ): Promise<
    Result<{ user_id: string; bitrate: string }, typeof errorMessages.user.NotExistsById>
  > {
    const userRecord = await this.getUserById(userId);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    await userRecord.data.update({
      bitrate: userSettings.bitrate,
    });
    return {
      success: true,
      data: {
        user_id: userRecord.data.id,
        bitrate: userRecord.data.bitrate,
      },
    };
  }
  async followUser(
    user_id: string,
    follow_id: string,
  ): Promise<
    Result<
      null,
      | typeof errorMessages.user.NotExistsById
      | typeof errorMessages.user.AlreadyFollowsUser
      | typeof errorMessages.user.CanNotFollowYourself
    >
  > {
    const userRecord = await this.getUserById(user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const userFollowingRecord = await database.userFollowingModel.findOne({
      where: { user_id, following_id: follow_id },
    });
    if (userFollowingRecord) {
      return { success: false, reason: errorMessages.user.AlreadyFollowsUser };
    }
    if (user_id === follow_id) {
      return { success: false, reason: errorMessages.user.CanNotFollowYourself };
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await database.userFollowingModel.create(
          { user_id, following_id: follow_id },
          { transaction },
        );
        await database.userFollowersModel.create(
          { followers_id: user_id, user_id: follow_id },
          { transaction },
        );
      });
    } catch {
      throw new InternalError('failed to follow user');
    }
    return { success: true, data: null };
  }
  async unfollowUser(
    user_id: string,
    unfollow_id: string,
  ): Promise<Result<null, typeof errorMessages.user.NotFollowsUser>> {
    const userFollowingRecord = await database.userFollowingModel.findOne({
      where: { user_id, following_id: unfollow_id },
    });
    const userFollowersRecord = await database.userFollowersModel.findOne({
      where: { followers_id: user_id, user_id: unfollow_id },
    });

    if (!userFollowingRecord || !userFollowersRecord) {
      return { success: false, reason: errorMessages.user.NotFollowsUser };
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await userFollowingRecord.destroy({ transaction });
        await userFollowersRecord.destroy({ transaction });
      });
      return { success: true, data: null };
    } catch {
      throw new InternalError('failed to unfollow user');
    }
  }
  async isPlaylistExist(
    playlist_id: string,
  ): Promise<Result<PlaylistModel, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await database.playlistModel.findByPk(playlist_id);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    return { success: true, data: playlistRecord };
  }
  async followPlaylist(
    user_id: string,
    playlist_id: string,
  ): Promise<
    Result<
      null,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.user.AlreadyFollowsPlaylist
    >
  > {
    const platlistRecord = await this.isPlaylistExist(playlist_id);
    if (!platlistRecord.success) {
      return platlistRecord;
    }
    const playlistFollowersRecord = await database.playlistFollowersModel.findOne({
      where: { user_id, playlist_id },
    });
    if (playlistFollowersRecord) {
      return { success: false, reason: errorMessages.user.AlreadyFollowsPlaylist };
    }
    await database.playlistFollowersModel.create({ user_id, playlist_id });
    return { success: true, data: null };
  }
  async unfollowPlaylist(
    user_id: string,
    playlist_id: string,
  ): Promise<
    Result<
      null,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.user.NotFollowsPlaylist
    >
  > {
    const platlistRecord = await this.isPlaylistExist(playlist_id);
    if (!platlistRecord.success) {
      return platlistRecord;
    }
    const playlistFollowersRecord = await database.playlistFollowersModel.findOne({
      where: { user_id, playlist_id },
    });
    if (!playlistFollowersRecord) {
      return { success: false, reason: errorMessages.user.NotFollowsPlaylist };
    }
    await playlistFollowersRecord.destroy();
    return { success: true, data: null };
  }
  async deleteUser(
    user_id: string,
  ): Promise<Result<null, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    await userRecord.data.destroy();

    return { success: true, data: null };
  }
  async registerUser(userInfo: { password: string; email: string }): Promise<
    Result<
      {
        accessToken: { token: string; expires: string };
        refreshToken: { token: string; expires: string };
      },
      typeof errorMessages.user.EmailAlreadyExists
    >
  > {
    const { salt, hash } = generatePassword(userInfo.password);

    if (await this.isEmailExist(userInfo.email)) {
      return { success: false, reason: errorMessages.user.EmailAlreadyExists };
    }

    const newUser = await database.userModel.create({
      id: crypto.randomUUID(),
      is_artist: false,
      hash,
      salt,
      visible_username: crypto.randomBytes(4).toString('hex'),
      username: crypto.randomBytes(4).toString('hex'),
      email: userInfo.email,
      avatar_url: null,
      bitrate: 'high',
    });

    return {
      success: true,
      data: issueBothTokens({
        user_id: newUser.id,
        hash: newUser.hash,
      }),
    };
  }
  async sendNewAccessTokenToUser(userInfo: {
    user_id: string;
    hash: string;
  }): Promise<
    Result<
      { accessToken: { token: string; expires: string } },
      typeof errorMessages.user.NotExistsById | typeof errorMessages.user.WrongPassword
    >
  > {
    const userRecord = await this.getUserById(userInfo.user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    if (userInfo.hash !== userRecord.data.hash) {
      return {
        success: false,
        reason: errorMessages.user.WrongPassword,
      };
    }
    return {
      success: true,
      data: {
        accessToken: issueAccessToken({ user_id: userInfo.user_id, hash: userRecord.data.hash }),
      },
    };
  }
  async authenticateUser(userInfo: Pick<IUser, 'username' | 'email' | 'password'>): Promise<
    Result<
      {
        accessToken: { token: string; expires: string };
        refreshToken: { token: string; expires: string };
      },
      typeof errorMessages.user.NotExistsById | typeof errorMessages.user.WrongPassword
    >
  > {
    const userRecord = await this.getUserByEmailOrUsername(userInfo);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const isCorrectPassword = verifyPassword(
      userInfo.password,
      userRecord.data.hash,
      userRecord.data.salt,
    );
    if (!isCorrectPassword) {
      return { success: false, reason: errorMessages.user.WrongPassword };
    }
    const tokens = issueBothTokens({
      user_id: userRecord.data.id,
      hash: userRecord.data.hash,
    });
    return {
      success: true,
      data: tokens,
    };
  }
  async getUserAvatar(
    user_id: string,
  ): Promise<Result<string | null, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    return {
      success: true,
      data: userRecord.data.avatar_url
        ? `${STATIC_DIRECTORY_PATH}/${userRecord.data.avatar_url}.jpg`
        : null,
    };
  }
  async updateUserAvatar(
    user_id: string,
    fileBuffer: Express.Multer.File,
  ): Promise<Result<string | null, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(user_id);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const fileUploadData = await new FileUploader().uploadImage(fileBuffer);
    await userRecord.data.update({ avatar_url: fileUploadData.data });
    return {
      success: true,
      data: userRecord.data.avatar_url
        ? `${STATIC_DIRECTORY_PATH}/${userRecord.data.avatar_url}.jpg`
        : null,
    };
  }
}
export default UserManager;
