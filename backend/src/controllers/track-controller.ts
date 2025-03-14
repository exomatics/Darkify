import database from '../config/database.ts';
import NotFoundError from '../errors/not-found-error.ts';

import type { Itrack } from '../interfaces/track-interface.ts';

export default {
  async getTrackInfo(trackId: string) {
    //перенести в валидацию
    const trackInfo = await database.trackModel.findByPk(trackId);
    if (trackInfo === null) {
      throw new NotFoundError('Track with this id does not exist');
    }
    /////
    const requiredTrackInfo: Itrack = { ...trackInfo.dataValues };
    return requiredTrackInfo;
  },
};
