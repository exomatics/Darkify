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
    return modelResponse.data.dataValues;
  },
  async streamTrack(trackInfo: { id: string; range: string }) {
    const modelResponse = await track.streamTrack();
  },
  async createTrack(trackInfo: Omit<Itrack, 'id' | 'play_count'>) {
    const modelResponse = await track.createTrack(trackInfo);
    if (!modelResponse.success) {
      throw new InternalError();
    }
    return modelResponse.data.dataValues;
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
