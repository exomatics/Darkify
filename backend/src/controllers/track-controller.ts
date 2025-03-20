import track from '../models/lib/track.ts';

export default {
  async getTrackInfo(trackId: string) {
    const databaseResponse = await track.getTrackById(trackId);
    return databaseResponse;
  },
};
