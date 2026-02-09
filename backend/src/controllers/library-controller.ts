import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { LibrarySortBy } from '../interfaces/library-interface.ts';
import { OrderBy, Type } from '../interfaces/playlist-interface.ts';
import PlaylistManager from '../models/services/playlist.ts';
import TrackManager from '../models/services/track.ts';
import UserManager from '../models/services/user.ts';

import type { IReorder } from '../interfaces/playlist-interface.ts';

const playlist = new PlaylistManager();
const track = new TrackManager();
const user = new UserManager();
export default {
  async getLibrary(userId: string) {
    const userRecord = await user.getUserById(userId);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    const libraryArtists = await user.getUserFollowedArtists(userId);
    const libraryPlaylists = await playlist.getLibrary({
      userId,
      type: Type.General,
      sort: { order: OrderBy.Desc, sortBy: LibrarySortBy.AddDate },
    });
    const libraryAlbums = await playlist.getLibrary({
      userId,
      type: Type.Album,
      sort: { order: OrderBy.Desc, sortBy: LibrarySortBy.AddDate },
    });
    const librarySingles = await track.getLibrary({
      userId,
      sort: { order: OrderBy.Desc, sortBy: LibrarySortBy.AddDate },
    });
    return {
      playlists: libraryPlaylists.data.items,
      artists: libraryArtists.data.items,
      albums: [...libraryAlbums.data.items, ...librarySingles.data.items],
    };
  },
  async getLibraryPlaylists(
    libraryInfo: {
      userId: string;
      sort: { sortBy: LibrarySortBy; order: OrderBy };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const modelResponse = await playlist.getLibrary(
      {
        userId: libraryInfo.userId,
        type: Type.General,
        sort: libraryInfo.sort,
      },
      limit,
      offset,
    );
    const { items, total } = modelResponse.data;
    return {
      next: offset + items.length + 1 <= total ? offset + items.length : null,
      offset,
      ...modelResponse.data,
    };
  },
  async reorderLibraryPlaylist(libraryInfo: IReorder) {
    const modelResponse = await playlist.reorderLibrary(libraryInfo);

    if (!modelResponse.success) {
      throw new ValidationError(modelResponse.reason);
    }

    return modelResponse.data;
  },
};
