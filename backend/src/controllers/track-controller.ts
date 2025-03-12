import database from '../config/database.ts';

import type { Itrack } from '../interfaces/track-interface.ts';

export default {
  async getTrackInfo(trackId: string) {
    const trackInfo = await database.trackModel.findByPk(trackId);
    if (trackInfo === null) {
      return new Error('Track with this id does not exist');
    }
    const requiredTrackInfo: Itrack = { ...trackInfo.dataValues };
    return requiredTrackInfo;
  },
};
