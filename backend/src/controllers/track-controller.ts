import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  PATH_TO_160m3u8,
  PATH_TO_24m3u8,
  PATH_TO_320m3u8,
  PATH_TO_96m3u8,
  PATH_TO_AUDIO,
  PATH_TO_AUTO_BITRATE,
} from '../config/config.ts';
import database from '../config/database.ts';
import { errorMessages } from '../errors/error-messages.ts';
import InternalError from '../errors/internal-error.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import { FileUploader } from '../models/services/file-management.ts';
import PlaylistManager from '../models/services/playlist.ts';
import TrackManager from '../models/services/track.ts';
import UserManager from '../models/services/user.ts';
import { Bitrate } from '../types/bitrate-type.ts';

import type { ITrack, UpdateTrack } from '../interfaces/track-interface.ts';
import type { SuccessfulResult } from '../types/result-type.ts';

const track = new TrackManager();
const user = new UserManager();
const playlist = new PlaylistManager();

const fileUploader = new FileUploader();

export default {
  async getTrackInfo(trackInfo: { trackId: string; userId: string }) {
    const modelResponse = await track.getTrackById(trackInfo);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getTrackLyrics(trackId: string) {
    const modelResponse = await track.getTrackRecordById(trackId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return { lyrics: modelResponse.data.lyrics ?? null };
  },
  async getTracksByName(
    searchInfo: { userId: string; trackName: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const modelResponse = await track.getTracksByName(searchInfo, limit, offset);
    if (!modelResponse.success) {
      return {
        next: 0,
        offset: 0,
        total: 0,
        items: [],
      };
    }
    const { rows, count } = modelResponse.data;
    return {
      next: offset + rows.length + 1 <= count ? offset + rows.length : null,
      offset,
      total: count,
      items: rows,
    };
  },
  async streamTrack(streamInfo: { trackId: string; userId: string }) {
    const modelResponse = await track.getTrackById(streamInfo);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    const userRecord = await user.getUserById(streamInfo.userId);
    if (!userRecord.success) {
      throw new NotFoundError(errorMessages.user.NotExistsById);
    }
    await track.increasePlayCount(streamInfo.trackId);
    let pathToFile;
    switch (userRecord.data.bitrate) {
      case Bitrate.VeryHigh: {
        pathToFile = `${PATH_TO_AUDIO}/${modelResponse.data.id}/${PATH_TO_320m3u8}`;
        break;
      }
      case Bitrate.High: {
        pathToFile = `${PATH_TO_AUDIO}/${modelResponse.data.id}/${PATH_TO_160m3u8}`;
        break;
      }
      case Bitrate.Normal: {
        pathToFile = `${PATH_TO_AUDIO}/${modelResponse.data.id}/${PATH_TO_96m3u8}`;
        break;
      }
      case Bitrate.Low: {
        pathToFile = `${PATH_TO_AUDIO}/${modelResponse.data.id}/${PATH_TO_24m3u8}`;
        break;
      }
      case Bitrate.Auto: {
        pathToFile = `${PATH_TO_AUDIO}/${modelResponse.data.id}/${PATH_TO_AUTO_BITRATE}`;
        break;
      }
      default: {
        throw new InternalError('failed to stream');
      }
    }
    return pathToFile;
  },
  async createTrack(
    trackInfo: Omit<ITrack, 'cover_id' | 'duration' | 'play_count'> & {
      cover: Express.Multer.File[] | null;
      track: Express.Multer.File[] | null;
    },
  ) {
    if (!trackInfo.track) {
      throw new ValidationError(errorMessages.validation.NoTrackSpecified);
    }
    const userRecord = await user.getUserById(trackInfo.admin_id);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    if (!userRecord.data.is_artist) {
      throw new ValidationError(errorMessages.artist.NotAnArtist);
    }
    if (trackInfo.album_id) {
      const albumRecord = await playlist.getUserAlbumRecordById(
        trackInfo.album_id,
        trackInfo.admin_id,
      );
      if (!albumRecord.success) {
        throw new NotFoundError(errorMessages.album.NotExistsById);
      }
    }
    let coverId = null;
    if (trackInfo.cover) {
      coverId = await fileUploader.uploadImage(trackInfo.cover[0]);
    }
    let result: SuccessfulResult<unknown> = { success: true, data: {} };
    await database.sequelize.transaction(async (transaction) => {
      const trackResponse = await track.createTrack({
        ...trackInfo,
        cover_id: coverId,
      });
      if (!trackResponse.success) {
        throw new InternalError(trackResponse.reason);
      }
      result = trackResponse;
      if (trackInfo.album_id) {
        const playlistTrackId = crypto.randomUUID();
        await playlist.addTrackToPlaylist({
          trackId: trackInfo.id,
          playlistId: trackInfo.album_id,
          userId: trackInfo.admin_id,
          playlistTrackId,
          transaction,
        });
      }
    });
    return result.data;
  },
  async updateTrack(trackInfo: UpdateTrack) {
    let coverId;
    if (trackInfo.file) {
      coverId = await fileUploader.uploadImage(trackInfo.file);
    }
    const modelResponse = await track.updateTrack({ ...trackInfo, cover_id: coverId ?? null });

    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async deleteTrack(trackId: string) {
    const modelResponse = await track.deleteTrack(trackId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
};
