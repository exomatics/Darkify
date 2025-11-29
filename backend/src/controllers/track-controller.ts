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
import { errorMessages } from '../errors/error-messages.ts';
import InternalError from '../errors/internal-error.ts';
import NotFoundError from '../errors/not-found-error.ts';
import { FileUploader } from '../models/services/file-management.ts';
import TrackManager from '../models/services/track.ts';
import UserManager from '../models/services/user.ts';
import { Bitrate } from '../types/bitrate-type.ts';

import type { Itrack, UpdateTrack } from '../interfaces/track-interface.ts';
const track = new TrackManager();
const user = new UserManager();
const fileUploader = new FileUploader();

export default {
  async getTrackInfo(trackId: string) {
    const modelResponse = await track.getTrackById(trackId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getTracksByName(
    trackName: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ) {
    const modelResponse = await track.getTracksByName(trackName, limit, offset);
    if (!modelResponse.success) {
      return [];
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
    const modelResponse = await track.getTrackById(streamInfo.trackId);
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
    trackInfo: Omit<Itrack, 'cover_id' | 'duration' | 'play_count'> & {
      file: Express.Multer.File[] | null;
    },
  ) {
    // if(!trackInfo.file){
    //   // throw new
    // }
    let coverId;
    if (trackInfo.file) {
      coverId = await fileUploader.uploadImage(trackInfo.file[0]);
    }
    const modelResponse = await track.createTrack({ ...trackInfo, cover_id: coverId ?? null });
    if (!modelResponse.success) {
      throw new InternalError(modelResponse.reason);
    }

    return modelResponse.data;
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
