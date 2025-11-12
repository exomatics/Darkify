import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_IMAGES_PATH } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { LibrarySections } from '../interfaces/user-interface.ts';
import PlaylistManager from '../models/services/playlist.ts';
import UserManager from '../models/services/user.ts';

import type { IUser, UpdateLibraryPlayDate } from '../interfaces/user-interface.ts';

const user = new UserManager();
const playlist = new PlaylistManager();

export default {
  async getUserInfo(user_id: string) {
    const userRecord = await user.getUserById(user_id);
    const followersCount = await user.getUserFollowersNumber(user_id);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    if (!followersCount.success) {
      throw new NotFoundError(followersCount.reason);
    }
    const requiredUserInfo = {
      user_id: userRecord.data.id,
      visible_username: userRecord.data.visible_username,
      avatar_url: userRecord.data.avatar_url
        ? `${STATIC_IMAGES_PATH}/${userRecord.data.avatar_url}.jpg`
        : null,
      is_artist: userRecord.data.is_artist,
      followers: followersCount.data,
    };
    return requiredUserInfo;
  },
  async getUserSettings(userId: string) {
    const userRecord = await user.getUserById(userId);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    const userSettings = { user_id: userRecord.data.id, bitrate: userRecord.data.bitrate };
    return userSettings;
  },
  async getUserFollowing(
    user_id: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const userFollowingRecord = await user.getUserFollowing(user_id, limit, offset);
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
  async updateUserInfo(user_id: string, userInfo: Pick<IUser, 'visible_username'>) {
    const modelResponse = await user.updateUserInfo(user_id, userInfo);
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
  async unfollowUser(user_id: string, unfollow_id: string) {
    const modelResponse = await user.unfollowUser(user_id, unfollow_id);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async followPlaylist(user_id: string, playlist_id: string) {
    const modelResponse = await user.followPlaylist(user_id, playlist_id);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async unfollowPlaylist(user_id: string, playlist_id: string) {
    const modelResponse = await user.unfollowPlaylist(user_id, playlist_id);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async deleteUser(user_id: string) {
    const modelResponse = await user.deleteUser(user_id);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async updateLibraryPlayDate(user_id: string, event_data: UpdateLibraryPlayDate) {
    if (event_data.section === LibrarySections.PLAYLISTS) {
      const modelResponse = await playlist.updateLibraryPlayDate(user_id, event_data.playlist_id);
      if (!modelResponse.success) {
        throw new NotFoundError(modelResponse.reason);
      }
      return modelResponse.data;
    }
  },
  async updateUserAvatar(user_id: string, fileBuffer: Express.Multer.File) {
    const modelResponse = await user.updateUserAvatar(user_id, fileBuffer);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getUserAvatar(user_id: string) {
    const modelResponse = await user.getUserAvatar(user_id);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
};
