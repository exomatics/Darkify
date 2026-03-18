import _ from 'lodash';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import { errorMessages } from '../errors/error-messages.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import {
  type PlaylistSortBy,
  type OrderBy,
  type IReorder,
  Type,
} from '../interfaces/playlist-interface.ts';
import PlaylistManager from '../models/services/playlist.ts';
import UserManager from '../models/services/user.ts';

const playlist = new PlaylistManager();

const user = new UserManager();

export default {
  async getLikedInfo(playlistInfo: { userId: string }) {
    const playlistResponse = await playlist.getPlaylistInfo({
      playlistId: playlistInfo.userId,
      userId: playlistInfo.userId,
    });
    if (!playlistResponse.success) {
      throw new NotFoundError(playlistResponse.reason);
    }

    const userResponse = await user.getUserById(playlistResponse.data.owner);
    if (!userResponse.success) {
      throw new NotFoundError(userResponse.reason);
    }

    return {
      count: playlistResponse.data.songsCount,
      // coverUrl: playlistResponse.data.coverId
    };
  },
  async getLikedTracks(
    playlistInfo: {
      userId: string;
      sort: { sortBy: PlaylistSortBy; order: OrderBy };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const playlistRecord = await playlist.getPlaylistRecordById(
      playlistInfo.userId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      throw new NotFoundError(errorMessages.liked.NotExistsById);
    }
    const likedTracks = await playlist.getAllTracksFromPlaylist(
      { ...playlistInfo, playlistId: playlistInfo.userId, type: Type.Liked },
      limit,
      offset,
    );

    const { items, total } = likedTracks.data;
    return {
      next: offset + items.length + 1 <= total ? offset + items.length : null,
      offset,
      ...likedTracks.data,
    };
  },
  async addTrackToLiked(playlistInfo: { trackId: string; userId: string }) {
    const trackResponse = await playlist.IsTrackExistsById({
      ...playlistInfo,
      playlistId: playlistInfo.userId,
    });
    if (trackResponse.success) {
      throw new ValidationError(errorMessages.liked.TrackMustBeUnique);
    }
    const playlistTrackId = crypto.randomUUID();
    const playlistResponse = await playlist.addTrackToPlaylist({
      ...playlistInfo,
      playlistTrackId,
      playlistId: playlistInfo.userId,
    });

    if (!playlistResponse.success) {
      throw new ValidationError(playlistResponse.reason);
    }

    return playlistResponse.data;
  },
  async removeTrackfromLiked(playlistInfo: { playlistTrackId: string; userId: string }) {
    const modelResponse = await playlist.removeTrackfromPlaylist({
      ...playlistInfo,
      playlistId: playlistInfo.userId,
    });

    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async reorderLiked(playlistInfo: Omit<IReorder, 'playlistId'>) {
    const modelResponse = await playlist.reorderPlaylistTrack({
      ...playlistInfo,
      playlistId: playlistInfo.userId,
    });

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async searchForLikedTrack(
    searchInfo: {
      search?: string;
      userId: string;
      sort: { sortBy: PlaylistSortBy; order: OrderBy };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    if (searchInfo.search) {
      const playlistRecord = await playlist.getPlaylistRecordById(
        searchInfo.userId,
        searchInfo.userId,
      );
      if (!playlistRecord.success) {
        throw new NotFoundError(errorMessages.liked.NotExistsById);
      }
      const searchResponse = await playlist.searchForPlaylistTrack(
        { ...searchInfo, search: searchInfo.search, playlistId: searchInfo.userId, isLiked: true },
        limit,
        offset,
      );

      return searchResponse;
    } else {
      const modelResponse = await this.getLikedTracks({
        ..._.omit(searchInfo, 'search'),
      });
      return modelResponse;
    }
  },
};
