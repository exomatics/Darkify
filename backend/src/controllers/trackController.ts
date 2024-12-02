import db from '../config/db.ts';

export default {
  async getTrack(trackId: string) {
    const trackInfo = await db.trackModel.findByPk(trackId);
    if (trackInfo === null) {
      return { Error: 'Track with this id does not exist', Code: 404 };
    }
    return trackInfo.dataValues;
  },
};
