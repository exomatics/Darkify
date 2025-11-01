import _ from 'lodash';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { FileUploader } from '../models/services/file-management.ts';
import PlaylistManager from '../models/services/playlist.ts';
import UserManager from '../models/services/user.ts';

import type {
  ICreatePlaylist,
  IPlaylist,
  IReorderTrack,
} from '../interfaces/playlist-interface.ts';

const playlist = new PlaylistManager();
const user = new UserManager();
const fileUploader = new FileUploader();

export default {
  async getPlaylistInfo(playlistInfo: { playlistId: string; userId: string }) {
    const playlistResponse = await playlist.getPlaylistInfo(playlistInfo);
    if (!playlistResponse.success) {
      throw new NotFoundError(playlistResponse.reason);
    }

    const userResponse = await user.getUserById(playlistResponse.data.owner);
    if (!userResponse.success) {
      throw new NotFoundError(userResponse.reason);
    }

    return {
      ...playlistResponse.data,
      owner: _.pick(userResponse.data, ['id', 'visible_username']),
    };
  },
  async deletePlaylist(playlistId: string) {
    const modelResponse = await playlist.deletePlaylist(playlistId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getPlaylistTracks(
    playlistInfo: {
      playlistId: string;
      sort: { sortBy: string; order: string };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const modelResponse = await playlist.getAllTracksFromPlaylist(playlistInfo, limit, offset);

    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async getPlaylistsByName(
    playlistInfo: Pick<IPlaylist, 'name'> & { userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const modelResponse = await playlist.getPlaylistsByName(playlistInfo, limit, offset);
    return modelResponse.data;
  },
  async createPlaylist(playlistInfo: Omit<ICreatePlaylist, 'coverId'>) {
    const coverId = await fileUploader.uploadImage(playlistInfo.file);

    const modelResponse = await playlist.createPlaylist({ ...playlistInfo, coverId });

    return modelResponse.data;
  },
  async addTrackToPlaylist(playlistInfo: { playlistId: string; trackId: string; userId: string }) {
    const playlistTrackId = crypto.randomUUID();
    const modelResponse = await playlist.addTrackToPlaylist({ ...playlistInfo, playlistTrackId });

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async removeTrackfromPlaylist(playlistInfo: {
    playlistId: string;
    playlistTrackId: string;
    userId: string;
  }) {
    const modelResponse = await playlist.removeTrackfromPlaylist(playlistInfo);

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async reorderPlaylistTrack(playlistInfo: IReorderTrack) {
    const modelResponse = await playlist.reorderPlaylistTrack(playlistInfo);

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return modelResponse.data;
  },
};
