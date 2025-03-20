import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import user from '../models/lib/user.ts';

import type { IUser } from '../interfaces/user-interface.ts';

export default {
  async getUserInfo(userId: string) {
    const userRecord = await user.getUserById(userId);
    const numberOfFollowers = await user.getUserFollowersNumber(userId);

    const requiredUserInfo = {
      visible_username: userRecord.visible_username,
      avatar_id: userRecord.avatar_id,
      followers: numberOfFollowers,
    };
    return requiredUserInfo;
  },
  async getUserFollowing(
    userId: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const { rows, count } = await user.getUserFollowing(userId, limit, offset);

    return {
      limit,
      next: offset + rows.length + 1 <= count ? offset + rows.length : null,
      offset,
      total: rows,
      items: count,
    };
  },
  async updateUserInfo(userId: string, userInfo: Pick<IUser, 'visibleUsername'>) {
    const databaseResponse = await user.updateUserInfo(userId, userInfo);
    return databaseResponse;
  },
  async followUser(userId: string, followId: string) {
    const databaseResponse = await user.followUser(userId, followId);
    return databaseResponse;
  },
  async unfollowUser(userId: string, unfollowId: string) {
    const databaseResponse = await user.unfollowUser(userId, unfollowId);
    return databaseResponse;
  },
  async followPlaylist(userId: string, playlistId: string) {
    const databaseResponse = await user.followPlaylist(userId, playlistId);
    return databaseResponse;
  },
  async unfollowPlaylist(userId: string, playlistId: string) {
    const databaseResponse = await user.unfollowPlaylist(userId, playlistId);
    return databaseResponse;
  },
  async deleteUser(userId: string) {
    const databaseResponse = user.deleteUser(userId);
    return databaseResponse;
  },
};
