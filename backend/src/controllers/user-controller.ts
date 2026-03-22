import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_IMAGES_PATH } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { LibrarySections } from '../interfaces/user-interface.ts';
import ArtistManager from '../models/services/artist.ts';
import PlaylistManager from '../models/services/playlist.ts';
import TrackManager from '../models/services/track.ts';
import UserManager from '../models/services/user.ts';

import type { IUser, UpdateLibraryPlayDate } from '../interfaces/user-interface.ts';

const user = new UserManager();
const playlist = new PlaylistManager();
const track = new TrackManager();
const artist = new ArtistManager();

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
    if (userRecord.data.is_artist) {
      const artistData = await artist.getArtistById(user_id);
      if (!artistData.success) {
        throw new NotFoundError(artistData.reason);
      }
      return {
        ...requiredUserInfo,
        banner_url: artistData.data.banner_id
          ? `${STATIC_IMAGES_PATH}/${artistData.data.banner_id}.jpg`
          : null,
        description: artistData.data.description,
      };
    }
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
  async updateUserInfo(
    user_id: string,
    user_info: Pick<IUser, 'visible_username'> & { description?: string },
  ) {
    const userData = await this.getUserInfo(user_id);

    if (!userData.is_artist && user_info.description) {
      throw new ValidationError('Cant update description. User is not an artist');
    }
    const updateUserInfo = await user.updateUserInfo(user_id, {
      visible_username: user_info.visible_username,
    });
    if (!updateUserInfo.success) {
      throw new NotFoundError(updateUserInfo.reason);
    }
    if (userData.is_artist) {
      await user.updateArtistInfo({ user_id, description: user_info.description });
      const artistData = await artist.getArtistById(user_id);
      if (!artistData.success) {
        throw new NotFoundError(artistData.reason);
      }
      return { ...updateUserInfo.data, description: artistData.data.description };
    }
    return updateUserInfo.data;
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
  async followAlbum(user_id: string, playlist_id: string) {
    const modelResponse = await playlist.followAlbum(user_id, playlist_id);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async unfollowAlbum(user_id: string, playlist_id: string) {
    const modelResponse = await playlist.unfollowAlbum(user_id, playlist_id);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async followSingle(user_id: string, single_id: string) {
    const modelResponse = await track.followSingle(user_id, single_id);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async unfollowSingle(user_id: string, single_id: string) {
    const modelResponse = await track.unfollowSingle(user_id, single_id);
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
    switch (event_data.section) {
      case LibrarySections.PLAYLISTS: {
        const modelResponse = await playlist.updatePlaylistPlayDate(
          user_id,
          event_data.playlist_id,
        );
        if (!modelResponse.success) {
          throw new NotFoundError(modelResponse.reason);
        }
        return modelResponse.data;
      }
      case LibrarySections.ALBUMS: {
        const modelResponse = await playlist.updateAlbumPlayDate(user_id, event_data.album_id);
        if (!modelResponse.success) {
          throw new NotFoundError(modelResponse.reason);
        }
        return modelResponse.data;
      }
      case LibrarySections.SINGLES: {
        const modelResponse = await track.updateLibraryPlayDate(user_id, event_data.track_id);
        if (!modelResponse.success) {
          throw new NotFoundError(modelResponse.reason);
        }
        return modelResponse.data;
      }
    }
  },
  async updateUserAvatar(user_id: string, fileBuffer: Express.Multer.File) {
    const modelResponse = await user.updateUserAvatar(user_id, fileBuffer);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async updateUserBanner(user_id: string, fileBuffer: Express.Multer.File) {
    const modelResponse = await user.updateArtistBanner(user_id, fileBuffer);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    const artistData = await artist.getArtistById(user_id);
    if (!artistData.success) {
      throw new NotFoundError(artistData.reason);
    }
    return {
      banner_url: artistData.data.banner_id
        ? `${STATIC_IMAGES_PATH}/${artistData.data.banner_id}.jpg`
        : null,
    };
  },
  async getUserAvatar(user_id: string) {
    const modelResponse = await user.getUserAvatar(user_id);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
};
