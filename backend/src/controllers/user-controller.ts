import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_DIRECTORY_PATH } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import UserManager from '../models/services/user.ts';

import type { IUser } from '../interfaces/user-interface.ts';

const user = new UserManager();

export default {
  async getUserInfo(userId: string) {
    const userRecord = await user.getUserById(userId);
    const followersCount = await user.getUserFollowersNumber(userId);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    if (!followersCount.success) {
      throw new NotFoundError(followersCount.reason);
    }
    const requiredUserInfo = {
      userId: userRecord.data.id,
      visible_username: userRecord.data.visible_username,
      avatar_url: userRecord.data.avatar_url
        ? `${STATIC_DIRECTORY_PATH}/${userRecord.data.avatar_url}.jpg`
        : null,
      followers: followersCount.data,
    };
    return requiredUserInfo;
  },
  async getUserSettings(userId: string) {
    const userRecord = await user.getUserById(userId);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    const userSettings = { userId: userRecord.data.id, bitrate: userRecord.data.bitrate };
    return userSettings;
  },
  async getUserFollowing(
    userId: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const userFollowingRecord = await user.getUserFollowing(userId, limit, offset);
    if (!userFollowingRecord.success) {
      throw new NotFoundError(userFollowingRecord.reason);
    }
    const { rows, count } = userFollowingRecord.data;
    return {
      next: offset + rows.length + 1 <= count ? offset + rows.length : null,
      offset,
      total: count,
      items: rows,
    };
  },
  async updateUserInfo(userId: string, userInfo: Pick<IUser, 'visibleUsername'>) {
    const modelResponse = await user.updateUserInfo(userId, userInfo);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async updateUserSettings(userId: string, userSettings: Pick<IUser, 'bitrate'>) {
    const modelResponse = await user.updateUserSettings(userId, userSettings);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async followUser(userId: string, followId: string) {
    const modelResponse = await user.followUser(userId, followId);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async unfollowUser(userId: string, unfollowId: string) {
    const modelResponse = await user.unfollowUser(userId, unfollowId);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async followPlaylist(userId: string, playlistId: string) {
    const modelResponse = await user.followPlaylist(userId, playlistId);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async unfollowPlaylist(userId: string, playlistId: string) {
    const modelResponse = await user.unfollowPlaylist(userId, playlistId);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async deleteUser(userId: string) {
    const modelResponse = await user.deleteUser(userId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async updateUserAvatar(userId: string, fileBuffer: Express.Multer.File) {
    const modelResponse = await user.updateUserAvatar(userId, fileBuffer);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getUserAvatar(userId: string) {
    const modelResponse = await user.getUserAvatar(userId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
};
