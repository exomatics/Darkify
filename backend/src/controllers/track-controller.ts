import database from '../config/database.ts';

export default {
  async getTrack(trackId: string) {
    const trackInfo = await database.trackModel.findByPk(trackId);
    if (trackInfo === null) {
      return { Error: 'Track with this id does not exist', Code: 404 };
    }
    return trackInfo.dataValues;
  },
};
