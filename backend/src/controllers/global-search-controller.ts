import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../config/config.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ArtistManager from '../models/services/artist.ts';
import PlaylistManager from '../models/services/playlist.ts';
import TrackManager from '../models/services/track.ts';
import UserManager from '../models/services/user.ts';

const user = new UserManager();
const track = new TrackManager();
const artist = new ArtistManager();
const playlist = new PlaylistManager();
export default {
  async searchGlobally(searchInfo: { userId: string; searchString: string }) {
    const isUserExists = await user.getUserById(searchInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const tracksResult = await track.searchForTracks(searchInfo.searchString);
    const artistsResult = await artist.searchForArtists(searchInfo.searchString);
    const albumsResult = await playlist.searchForAlbums(searchInfo);
    const playlistsResult = await playlist.getPlaylistsByName(
      { name: searchInfo.searchString, userId: searchInfo.userId },
      9,
      0,
    );
    const usersResult = await user.searchForUsers(searchInfo.searchString);
    return {
      tracks: tracksResult,
      artists: artistsResult,
      albums: albumsResult,
      playlists: playlistsResult,
      users: usersResult,
    };
  },
  async searchForTracks(
    searchInfo: { userId: string; searchString: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const isUserExists = await user.getUserById(searchInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const tracksResult = await track.searchForTracks(searchInfo.searchString, offset, limit);
    return tracksResult;
  },
  async searchForArtists(
    searchInfo: { userId: string; searchString: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const isUserExists = await user.getUserById(searchInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const artistsResult = await artist.searchForArtists(searchInfo.searchString, offset, limit);
    return artistsResult;
  },
  async searchForAlbums(
    searchInfo: { userId: string; searchString: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const isUserExists = await user.getUserById(searchInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const albumsResult = await playlist.searchForAlbums(searchInfo, limit, offset);
    return albumsResult;
  },
  async searchForPlaylists(
    searchInfo: { userId: string; searchString: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const isUserExists = await user.getUserById(searchInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const playlistsResult = await playlist.getPlaylistsByName(
      {
        name: searchInfo.searchString,
        userId: searchInfo.userId,
      },
      limit,
      offset,
    );
    return playlistsResult;
  },
  async searchForUsers(
    searchInfo: { userId: string; searchString: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const isUserExists = await user.getUserById(searchInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const usersResult = await user.searchForUsers(searchInfo.searchString, limit, offset);
    return usersResult;
  },
};
