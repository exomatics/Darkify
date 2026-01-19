import database from '../config/database.ts';
import { errorMessages } from '../errors/error-messages.ts';
import InternalError from '../errors/internal-error.ts';
import NotFoundError from '../errors/not-found-error.ts';
import ValidationError from '../errors/validation-error.ts';
import ArtistManagement from '../models/services/artist.ts';
import { FileUploader } from '../models/services/file-management.ts';
import UserManager from '../models/services/user.ts';

import type { ICreateArtist } from '../interfaces/artist-interface.ts';

const fileUploader = new FileUploader();
const artist = new ArtistManagement();
const user = new UserManager();
export default {
  async turnToArtist(artistInfo: ICreateArtist) {
    const userRecord = await user.getUserById(artistInfo.userId);
    if (!userRecord.success) {
      throw new NotFoundError(userRecord.reason);
    }
    if (userRecord.data.is_artist) {
      throw new ValidationError(errorMessages.artist.AlreadyAnArtist);
    }
    let bannerId = null;
    if (artistInfo.file) {
      bannerId = await fileUploader.uploadImage(artistInfo.file);
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await user.turnUserToArtist(artistInfo.userId, transaction);
        await artist.turnToArtist({ ...artistInfo, bannerId, transaction });
      });
    } catch {
      throw new InternalError(errorMessages.artist.FailedToTurnToArtist);
    }
    return null;
  },
};
