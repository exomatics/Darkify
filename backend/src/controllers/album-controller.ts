import _ from 'lodash';

import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_IMAGES_PATH } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import {
  type PlaylistSortBy,
  type Order,
  type ICreatePlaylist,
  type IPlaylist,
  type IReorder,
  Type,
} from '../interfaces/playlist-interface.ts';
import { FileUploader } from '../models/services/file-management.ts';
import PlaylistManager from '../models/services/playlist.ts';
import UserManager from '../models/services/user.ts';

import type { AlbumsSortBy, IUpdateAlbum } from '../interfaces/album-interface.ts';

const playlist = new PlaylistManager();
const user = new UserManager();
const fileUploader = new FileUploader();

export default {
  async getAlbumInfo(albumInfo: { playlistId: string; userId: string }) {
    const userResponse = await user.getUserById(albumInfo.userId);
    if (!userResponse.success) {
      throw new NotFoundError(userResponse.reason);
    }
    const playlistResponse = await playlist.getAlbumInfo(albumInfo);
    if (!playlistResponse.success) {
      throw new NotFoundError(playlistResponse.reason);
    }
    let published = false;
    if (playlistResponse.data.date_released === null) {
      published = true;
    }
    return {
      ..._.omit(playlistResponse.data, ['coverId']),
      cover_url: playlistResponse.data.coverId
        ? `${STATIC_IMAGES_PATH}/${playlistResponse.data.coverId}.jpg`
        : null,
      published,
      owner: _.pick(userResponse.data, ['id', 'visible_username']),
    };
  },
  async getAlbumCover(playlistInfo: { playlistId: string; userId: string }) {
    const playlistResponse = await this.getAlbumInfo(playlistInfo);

    return { cover_url: playlistResponse.cover_url };
  },
  async deleteAlbum(playlistInfo: { playlistId: string; userId: string }) {
    const modelResponse = await playlist.deleteAlbum(playlistInfo);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getAlbumTracks(
    playlistInfo: {
      playlistId: string;
      userId: string;
      sort: { sortBy: PlaylistSortBy; order: Order };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const modelResponse = await playlist.getAllTracksFromPlaylist(
      { ...playlistInfo, type: Type.Album },
      limit,
      offset,
    );

    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    const { items, total } = modelResponse.data;
    return {
      next: offset + items.length + 1 <= total ? offset + items.length : null,
      offset,
      ...modelResponse.data,
    };
  },
  async getPlaylistsByName(
    playlistInfo: Pick<IPlaylist, 'name'> & { userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const modelResponse = await playlist.getPlaylistsByName(playlistInfo, limit, offset);
    const { items, total } = modelResponse.data;
    return {
      next: offset + items.length + 1 <= total ? offset + items.length : null,
      offset,
      ...modelResponse.data,
    };
  },
  async createAlbum(
    albumInfo: Omit<ICreatePlaylist, 'restrictions' | 'playlistId' | 'description'> &
      Pick<IPlaylist, 'restrictions'>,
  ) {
    let coverId = null;
    if (albumInfo.file) {
      coverId = await fileUploader.uploadImage(albumInfo.file);
    }
    const playlistId = crypto.randomUUID();

    const playlistResponse = await playlist.createPlaylist({
      ...albumInfo,
      playlistId,
      coverId,
    });

    await playlist.createPlaylistAlbum({
      playlistId,
      userId: albumInfo.owner,
    });
    const playlistData = await this.getAlbumInfo(playlistResponse.data);
    return { id: playlistResponse.data.playlistId, name: playlistData.name };
  },
  async addTrackToAlbum(playlistInfo: { playlistId: string; trackId: string; userId: string }) {
    const playlistTrackId = crypto.randomUUID();
    const modelResponse = await playlist.addTrackToPlaylist({ ...playlistInfo, playlistTrackId });

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return { track_album_id: modelResponse.data.playlistTrackId };
  },
  async removeTrackfromAlbum(playlistInfo: {
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
  async reorderAlbumTrack(playlistInfo: IReorder) {
    const modelResponse = await playlist.reorderPlaylistTrack(playlistInfo);

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async updateAlbumInfo(playlistInfo: IUpdateAlbum & { userId: string }) {
    const playlistResponse = await playlist.updatePlaylistInfo(playlistInfo);
    if (!playlistResponse.success) {
      throw new ValidationError(playlistResponse.reason);
    }
    await playlist.updateAlbumReleaseDate({
      albumId: playlistInfo.playlistId,
      userId: playlistInfo.userId,
      releaseDate: playlistInfo.releaseDate,
    });
    const userResponse = await user.getUserById(playlistResponse.data.owner);
    if (!userResponse.success) {
      throw new NotFoundError(userResponse.reason);
    }
    const playlistData = await this.getAlbumInfo({
      playlistId: playlistInfo.playlistId,
      userId: playlistInfo.userId,
    });
    return playlistData;
  },
  async updateCoverById(
    playlistInfo: Pick<IPlaylist, 'playlistId'> & { file: Express.Multer.File; userId: string },
  ) {
    const coverId = await fileUploader.uploadImage(playlistInfo.file);

    const playlistResponse = await playlist.updateCoverById({ ...playlistInfo, coverId });
    if (!playlistResponse.success) {
      throw new NotFoundError(playlistResponse.reason);
    }

    const userResponse = await user.getUserById(playlistResponse.data.owner);
    if (!userResponse.success) {
      throw new NotFoundError(userResponse.reason);
    }

    const playlistData = await this.getAlbumInfo({
      playlistId: playlistInfo.playlistId,
      userId: playlistInfo.userId,
    });
    return playlistData;
  },
  async getUserAlbums(
    userId: string,
    sort: { sortBy: AlbumsSortBy; order: Order },
    limit?: number,
    offset?: number,
  ) {
    const userResponse = await user.getUserById(userId);
    if (!userResponse.success) {
      throw new NotFoundError(userResponse.reason);
    }
    const modelResponse = await playlist.getAlbumsByOwner(userId, sort, limit, offset);

    return modelResponse.data;
  },
};
