import {
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
import TrackManager from '../models/services/track.ts';
import UserManager from '../models/services/user.ts';
import { Bitrate } from '../types/bitrate-type.ts';

import type { Itrack, UpdateTrack } from '../interfaces/track-interface.ts';
const track = new TrackManager();
const user = new UserManager();
export default {
  async getTrackInfo(trackId: string) {
    const modelResponse = await track.getTrackById(trackId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
  async getTracksByName(trackName: string) {
    const modelResponse = await track.getTracksByName(trackName);
    if (!modelResponse.success) {
      return [];
    }
    return modelResponse.data;
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
  async createTrack(trackInfo: Omit<Itrack, 'duration' | 'play_count'>) {
    const modelResponse = await track.createTrack(trackInfo);
    if (!modelResponse.success) {
      throw new InternalError(modelResponse.reason);
    }

    return modelResponse.data;
  },
  async updateTrack(trackInfo: UpdateTrack) {
    const modelResponse = await track.updateTrack(trackInfo);
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
