import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import ValidationError from '../errors/validation-error.ts';
import PlaylistManager from '../models/services/playlist.ts';

import type { LibrarySortBy } from '../interfaces/library-interface.ts';
import type { IReorder, Order } from '../interfaces/playlist-interface.ts';

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
  async reorderLibraryPlaylist(libraryInfo: IReorder) {
    const modelResponse = await playlist.reorderLibrary(libraryInfo);

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return modelResponse.data;
  },
};
