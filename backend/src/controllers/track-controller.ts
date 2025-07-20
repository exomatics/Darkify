import {
  STATIC_PATH_TO_160m3u8,
  STATIC_PATH_TO_24m3u8,
  STATIC_PATH_TO_320m3u8,
  STATIC_PATH_TO_96m3u8,
  STATIC_PATH_TO_AUTO_BITRATE,
} from '../config/config.ts';
import InternalError from '../errors/internal-error.ts';
import NotFoundError from '../errors/not-found-error.ts';
import TrackManager from '../models/services/track.ts';

import type { Itrack, UpdateTrack } from '../interfaces/track-interface.ts';

const track = new TrackManager();

export default {
  async getTrackInfo(trackId: string) {
    const modelResponse = await track.getTrackById(trackId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return {
      ...modelResponse.data.dataValues,
      '320kbps': `${modelResponse.data.track_filename}/${STATIC_PATH_TO_320m3u8}`,
      '160kbps': `${modelResponse.data.track_filename}/${STATIC_PATH_TO_160m3u8}`,
      '96kbps': `${modelResponse.data.track_filename}/${STATIC_PATH_TO_96m3u8}`,
      '24kbps': `${modelResponse.data.track_filename}/${STATIC_PATH_TO_24m3u8}`,
      auto: `${modelResponse.data.track_filename}/${STATIC_PATH_TO_AUTO_BITRATE}`,
    };
  },
  async createTrack(trackInfo: Omit<Itrack, 'id' | 'play_count'>) {
    const modelResponse = await track.createTrack(trackInfo);
    if (!modelResponse.success) {
      throw new InternalError(modelResponse.reason);
    }
    return modelResponse.data.dataValues;
  },
  async updateTrack(trackInfo: UpdateTrack) {
    const modelResponse = await track.updateTrack(trackInfo);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data.dataValues;
  },
  async deleteTrack(trackId: string) {
    const modelResponse = await track.deleteTrack(trackId);
    if (!modelResponse.success) {
      throw new NotFoundError(modelResponse.reason);
    }
    return modelResponse.data;
  },
};
