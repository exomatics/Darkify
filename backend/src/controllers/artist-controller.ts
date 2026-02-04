import _ from 'lodash';

import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_IMAGES_PATH } from '../config/config.ts';
import database from '../config/database.ts';
import { errorMessages } from '../errors/error-messages.ts';
import InternalError from '../errors/internal-error.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import {
  ArtistAlbumsSortBy,
  ArtistSinglesSortBy,
  type ICreateArtist,
} from '../interfaces/artist-interface.ts';
import { OrderBy } from '../interfaces/playlist-interface.ts';
import ArtistManager from '../models/services/artist.ts';
import { FileUploader } from '../models/services/file-management.ts';
import UserManager from '../models/services/user.ts';

const fileUploader = new FileUploader();
const artist = new ArtistManager();
const user = new UserManager();
export default {
  async turnToArtist(artistInfo: ICreateArtist) {
    const userRecord = await user.getUserById(artistInfo.userId);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    if (userRecord.data.is_artist) {
      throw new ValidationError(errorMessages.artist.AlreadyAnArtist);
    }
    let bannerId = null;
    if (artistInfo.file) {
      bannerId = await fileUploader.uploadImage(artistInfo.file);
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await user.turnUserToArtist(artistInfo.userId, transaction);
        await artist.turnToArtist({ ...artistInfo, bannerId, transaction });
      });
    } catch {
      throw new InternalError(errorMessages.artist.FailedToTurnToArtist);
    }
    return null;
  },
  async getArtistInfo(artistInfo: { artistId: string; userId: string }) {
    const userRecord = await user.getUserById(artistInfo.userId);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    const artistData = await artist.getArtistInfo(artistInfo);
    if (!artistData.success) {
      throw new NotFoundError(artistData.reason);
    }
    return _.omit(
      {
        ...artistData.data,
        name: userRecord.data.visible_username,
        banner_url: artistData.data.banner_id
          ? `${STATIC_IMAGES_PATH}/${artistData.data.banner_id}.jpg`
          : null,
        avatar_url: userRecord.data.avatar_url
          ? `${STATIC_IMAGES_PATH}/${userRecord.data.avatar_url}.jpg`
          : null,
      },
      ['banner_id'],
    );
  },
  async getLikedFromArtist(
    artistInfo: { artistId: string; userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const artistLikedTracks = await artist.getLikedFromArtist(artistInfo, limit, offset);
    if (!artistLikedTracks.success) {
      throw new NotFoundError(artistLikedTracks.reason);
    }
    return artistLikedTracks.data;
  },
  async getAlbums(
    artistInfo: { artistId: string; userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const isUserExists = await user.getUserById(artistInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const artistAlbums = await artist.getArtistAlbums(
      { artistId: artistInfo.artistId, userId: artistInfo.userId },
      { sortBy: ArtistAlbumsSortBy.ReleaseDate, order: OrderBy.Desc },
      limit,
      offset,
    );
    if (!artistAlbums.success) {
      throw new NotFoundError(artistAlbums.reason);
    }
    return artistAlbums.data;
  },
  async getSingles(
    artistInfo: { artistId: string; userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const isUserExists = await user.getUserById(artistInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const artistSingles = await artist.getArtistSingles(
      { artistId: artistInfo.artistId, userId: artistInfo.userId },
      { sortBy: ArtistSinglesSortBy.CreationDate, order: OrderBy.Desc },
      limit,
      offset,
    );
    if (!artistSingles.success) {
      throw new NotFoundError(artistSingles.reason);
    }
    return artistSingles.data;
  },
  async getArtistPopular(artistInfo: { artistId: string; userId: string }) {
    const isUserExists = await user.getUserById(artistInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const artistAlbums = await artist.getArtistAlbums(
      { artistId: artistInfo.artistId, userId: artistInfo.userId },
      { sortBy: ArtistAlbumsSortBy.Popularity, order: OrderBy.Desc },
      9,
      0,
    );
    if (!artistAlbums.success) {
      throw new NotFoundError(artistAlbums.reason);
    }
    const artistSingles = await artist.getArtistSingles(
      { artistId: artistInfo.artistId, userId: artistInfo.userId },
      { sortBy: ArtistSinglesSortBy.Popularity, order: OrderBy.Desc },
      9,
      0,
    );
    if (!artistSingles.success) {
      throw new NotFoundError(artistSingles.reason);
    }
    return { albums: artistAlbums.data.items, singles: artistSingles.data.items };
  },
  async getArtistTop(artistInfo: { artistId: string; userId: string }) {
    const isUserExists = await user.getUserById(artistInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const artistTopTracks = await artist.getArtistTop(artistInfo, 10, 0);
    if (!artistTopTracks.success) {
      throw new NotFoundError(artistTopTracks.reason);
    }
    return artistTopTracks.data;
  },
  async getArtistDiscography(artistInfo: { artistId: string; userId: string }) {
    const isUserExists = await user.getUserById(artistInfo.userId);
    if (!isUserExists.success) {
      throw new NotFoundError(isUserExists.reason);
    }
    const artistAlbums = await artist.getArtistAlbums(
      { artistId: artistInfo.artistId, userId: artistInfo.userId },
      { sortBy: ArtistAlbumsSortBy.ReleaseDate, order: OrderBy.Desc },
    );
    if (!artistAlbums.success) {
      throw new NotFoundError(artistAlbums.reason);
    }
    const artistSingles = await artist.getArtistSingles(
      { artistId: artistInfo.artistId, userId: artistInfo.userId },
      { sortBy: ArtistSinglesSortBy.CreationDate, order: OrderBy.Desc },
    );
    if (!artistSingles.success) {
      throw new NotFoundError(artistSingles.reason);
    }
    return { albums: artistAlbums.data.items, singles: artistSingles.data.items };
  },
};
