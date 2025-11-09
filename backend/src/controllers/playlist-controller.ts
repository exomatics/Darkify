import _ from 'lodash';

import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_IMAGES_PATH } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { FileUploader } from '../models/services/file-management.ts';
import PlaylistManager from '../models/services/playlist.ts';
import UserManager from '../models/services/user.ts';

import type {
  ICreatePlaylist,
  IPlaylist,
  IReorderTrack,
  IUpdatePlaylist,
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
      ..._.omit(playlistResponse.data, 'cover_id'),
      coverUrl: playlistResponse.data.coverId
        ? `${STATIC_IMAGES_PATH}/${playlistResponse.data.coverId}.jpg`
        : null,
      owner: _.pick(userResponse.data, ['id', 'visible_username']),
    };
  },
  async getPlaylistCover(playlistInfo: { playlistId: string; userId: string }) {
    const playlistResponse = await playlist.getPlaylistInfo(playlistInfo);
    if (!playlistResponse.success) {
      throw new NotFoundError(playlistResponse.reason);
    }
    return playlistResponse.data.coverId
      ? `${STATIC_IMAGES_PATH}/${playlistResponse.data.coverId}.jpg`
      : null;
  },
  async deletePlaylist(playlistInfo: { playlistId: string; userId: string }) {
    const modelResponse = await playlist.deletePlaylist(playlistInfo);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getPlaylistTracks(
    playlistInfo: {
      playlistId: string;
      userId: string;
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

    const playlistResponse = await playlist.createPlaylist({ ...playlistInfo, coverId });
    if (!playlistResponse.success) {
      throw new NotFoundError(playlistResponse.reason);
    }
    const userResponse = await user.getUserById(playlistResponse.data.owner);
    if (!userResponse.success) {
      throw new NotFoundError(userResponse.reason);
    }
    return {
      ..._.omit(playlistResponse.data, 'cover_id'),
      coverUrl: playlistResponse.data.coverId
        ? `${STATIC_IMAGES_PATH}/${playlistResponse.data.coverId}.jpg`
        : null,
      owner: _.pick(userResponse.data, ['id', 'visible_username']),
    };
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
  async updatePlaylistInfo(playlistInfo: IUpdatePlaylist & { userId: string }) {
    const modelResponse = await playlist.updatePlaylistInfo(playlistInfo);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }
    return {
      ..._.omit(modelResponse.data, 'cover_id'),
      coverUrl: modelResponse.data.coverId
        ? `${STATIC_IMAGES_PATH}/${modelResponse.data.coverId}.jpg`
        : null,
    };
  },
  async updateRestrictionsById(
    playlistInfo: Pick<IPlaylist, 'playlistId' | 'restrictions'> & { userId: string },
  ) {
    const modelResponse = await playlist.updateRestrictionsById(playlistInfo);
    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return {
      ..._.omit(modelResponse.data, 'cover_id'),
      coverUrl: modelResponse.data.coverId
        ? `${STATIC_IMAGES_PATH}/${modelResponse.data.coverId}.jpg`
        : null,
    };
  },
  async updateCoverById(
    playlistInfo: Pick<IPlaylist, 'playlistId'> & { file: Express.Multer.File; userId: string },
  ) {
    const coverId = await fileUploader.uploadImage(playlistInfo.file);

    const modelResponse = await playlist.updateCoverById({ ...playlistInfo, coverId });
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return {
      ..._.omit(modelResponse.data, 'cover_id'),
      coverUrl: modelResponse.data.coverId
        ? `${STATIC_IMAGES_PATH}/${modelResponse.data.coverId}.jpg`
        : null,
    };
  },
};
