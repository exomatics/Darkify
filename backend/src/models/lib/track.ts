import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import NotFoundError from '../../errors/not-found-error.ts';

class Track {
  async getTrackById(trackId: string) {
    const trackInfo = await database.trackModel.findByPk(trackId);
    if (trackInfo === null) {
      throw new NotFoundError(errorMessages.track.NotExistById);
    }
    return trackInfo.dataValues;
  }
}

export default Track;
