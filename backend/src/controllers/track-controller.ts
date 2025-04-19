import TrackManagerModel from '../models/services/track.ts';
const track = new TrackManagerModel();

export default {
  async getTrackInfo(trackId: string) {
    const databaseResponse = await track.getTrackById(trackId);
    return databaseResponse;
  },
};
