import PlaylistManager from '../models/services/playlist.ts';

import type { ICreatePlaylist, IPlaylist } from '../interfaces/playlist-interface.ts';
import NotFoundError from '../errors/not-found-error.ts';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import { FileUploader } from '../models/services/file-management.ts';

const playlist = new PlaylistManager();
const fileUploader = new FileUploader();

export default {
  async getPlaylistInfo(playlistInfo: { playlistId: string; userId: string }) {
    const modelResponse = await playlist.getPlaylistInfo(playlistInfo);
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

    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async createPlaylist(playlistInfo: Omit<ICreatePlaylist, 'cover_id'>) {
    const coverId = await fileUploader.uploadImage(playlistInfo.file);

    const modelResponse = await playlist.createPlaylist({ ...playlistInfo, cover_id: coverId });
    return modelResponse.data;
  },
};
