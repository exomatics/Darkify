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
import type { PlaylistModel } from '../playlist.ts';
import type { UserFollowingModel } from '../user-following.ts';
import type { UserModel } from '../user.ts';
import type { InferAttributes, InferCreationAttributes, Model } from 'sequelize';
type Result<TOk = void, TError extends string = string> =
  | { success: true; data: TOk }
  | { success: false; reason: TError };
interface ResultUserData {
  id: string;
  visible_username: string;
  avatar_url: string | null;
}

class UserManager {
  async getUserById(
    userId: string,
  ): Promise<
    Result<
      UserModel,
      typeof errorMessages.user.NotExistsById | typeof errorMessages.user.NotFollowsAnyone
    >
  > {
    const userRecord = await database.userModel.findByPk(userId);
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
    userId: string,
  ): Promise<Result<number, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(userId);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const followersCount = await database.userFollowersModel.count({
      where: { user_id: userId },
    });
    return { success: true, data: followersCount };
  }
  async getUserFollowing(
    userId: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<
      { rows: UserModel[]; count: number },
      typeof errorMessages.user.NotExistsById | typeof errorMessages.user.NotFollowsAnyone
    >
  > {
    const userRecord = await this.getUserById(userId);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const userFollowingRecords = await database.userFollowingModel.findAndCountAll({
      attributes: ['following_id'],
      where: { user_id: userId },
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
    userId: string,
    userInfo: Pick<IUser, 'visibleUsername'>,
  ): Promise<Result<ResultUserData, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(userId);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    await userRecord.data.update({
      visible_username: userInfo.visibleUsername ?? userRecord.data.visible_username,
    });
    return {
      success: true,
      data: {
        id: userRecord.data.id,
        visible_username: userRecord.data.visible_username,
        avatar_url: userRecord.data.avatar_url
          ? `${STATIC_DIRECTORY_PATH}/${userRecord.data.avatar_url}.jpg`
          : null,
      },
    };
  }
  async followUser(
    userId: string,
    followId: string,
  ): Promise<
    Result<
      null,
      | typeof errorMessages.user.NotExistsById
      | typeof errorMessages.user.AlreadyFollowsUser
      | typeof errorMessages.user.CanNotFollowYourself
    >
  > {
    const userRecord = await this.getUserById(userId);
    if (!userRecord.success) {
      return { success: false, reason: errorMessages.user.NotExistsById };
    }
    const userFollowingRecord = await database.userFollowingModel.findOne({
      where: { user_id: userId, following_id: followId },
    });
    if (userFollowingRecord) {
      return { success: false, reason: errorMessages.user.AlreadyFollowsUser };
    }
    if (userId === followId) {
      return { success: false, reason: errorMessages.user.CanNotFollowYourself };
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await database.userFollowingModel.create(
          { user_id: userId, following_id: followId },
          { transaction },
        );
        await database.userFollowersModel.create(
          { followers_id: userId, user_id: followId },
          { transaction },
        );
      });
    } catch {
      throw new InternalError('failed to follow user');
    }
    return { success: true, data: null };
  }
  async unfollowUser(
    userId: string,
    unfollowId: string,
  ): Promise<Result<null, typeof errorMessages.user.NotFollowsUser>> {
    const userFollowingRecord = await database.userFollowingModel.findOne({
      where: { user_id: userId, following_id: unfollowId },
    });
    const userFollowersRecord = await database.userFollowersModel.findOne({
      where: { followers_id: userId, user_id: unfollowId },
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
    playlistId: string,
  ): Promise<Result<PlaylistModel, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    return { success: true, data: playlistRecord };
  }
  async followPlaylist(
    userId: string,
    playlistId: string,
  ): Promise<
    Result<
      null,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.user.AlreadyFollowsPlaylist
    >
  > {
    const platlistRecord = await this.isPlaylistExist(playlistId);
    if (!platlistRecord.success) {
      return platlistRecord;
    }
    const playlistFollowersRecord = await database.playlistFollowersModel.findOne({
      where: { user_id: userId, playlist_id: playlistId },
    });
    if (playlistFollowersRecord) {
      return { success: false, reason: errorMessages.user.AlreadyFollowsPlaylist };
    }
    await database.playlistFollowersModel.create({ user_id: userId, playlist_id: playlistId });
    return { success: true, data: null };
  }
  async unfollowPlaylist(
    userId: string,
    playlistId: string,
  ): Promise<
    Result<
      null,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.user.NotFollowsPlaylist
    >
  > {
    const platlistRecord = await this.isPlaylistExist(playlistId);
    if (!platlistRecord.success) {
      return platlistRecord;
    }
    const playlistFollowersRecord = await database.playlistFollowersModel.findOne({
      where: { user_id: userId, playlist_id: playlistId },
    });
    if (!playlistFollowersRecord) {
      return { success: false, reason: errorMessages.user.NotFollowsPlaylist };
    }
    await playlistFollowersRecord.destroy();
    return { success: true, data: null };
  }
  async deleteUser(userId: string): Promise<Result<null, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(userId);
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
    });

    return {
      success: true,
      data: issueBothTokens({
        userId: newUser.id,
        hash: newUser.hash,
      }),
    };
  }
  async sendNewAccessTokenToUser(userInfo: {
    userId: string;
    hash: string;
  }): Promise<
    Result<
      { accessToken: { token: string; expires: string } },
      typeof errorMessages.user.NotExistsById | typeof errorMessages.user.WrongPassword
    >
  > {
    const userRecord = await this.getUserById(userInfo.userId);
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
        accessToken: issueAccessToken({ userId: userInfo.userId, hash: userRecord.data.hash }),
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
      userId: userRecord.data.id,
      hash: userRecord.data.hash,
    });
    return {
      success: true,
      data: tokens,
    };
  }
  async getUserAvatar(
    userId: string,
  ): Promise<Result<string | null, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(userId);
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
    userId: string,
    fileBuffer: Express.Multer.File,
  ): Promise<Result<string | null, typeof errorMessages.user.NotExistsById>> {
    const userRecord = await this.getUserById(userId);
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
