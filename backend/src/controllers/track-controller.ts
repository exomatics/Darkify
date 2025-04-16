import Track from '../models/lib/track.ts';
const track = new Track();

export default {
  async getTrackInfo(trackId: string) {
    const databaseResponse = await track.getTrackById(trackId);
    return databaseResponse;
  },
};
