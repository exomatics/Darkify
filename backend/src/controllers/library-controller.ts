import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import PlaylistManager from '../models/services/playlist.ts';

const playlist = new PlaylistManager();

export default {
  async getLibraryPlaylists(
    userId: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const playlistResponse = await playlist.getLibrary(userId, limit, offset);

    return playlistResponse.data;
  },
};
