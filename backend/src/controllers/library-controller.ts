import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import PlaylistManager from '../models/services/playlist.ts';

import type { LibrarySortBy } from '../interfaces/library-interface.ts';
import type { Order } from '../interfaces/playlist-interface.ts';

const playlist = new PlaylistManager();

export default {
  async getLibraryPlaylists(
    userId: string,
    sort: { sortBy: LibrarySortBy; order: Order },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const playlistResponse = await playlist.getLibrary(userId, sort, limit, offset);
    return playlistResponse.data;
  },
};
