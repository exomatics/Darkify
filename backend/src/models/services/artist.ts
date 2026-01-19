import { type Transaction } from 'sequelize';

import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';

import type { IArtist } from '../../interfaces/artist-interface.ts';
import type { Result } from '../../types/result-type.ts';

class ArtistManagement {
  async turnToArtist(
    artistInfo: IArtist & {
      transaction: Transaction;
    },
  ): Promise<Result<null, typeof errorMessages.artist.AlreadyExistsById>> {
    const isArtistExists = await database.artistModel.findByPk(artistInfo.userId);
    if (isArtistExists) {
      return { success: false, reason: errorMessages.artist.AlreadyExistsById };
    }
    await database.artistModel.create(
      {
        user_id: artistInfo.userId,
        banner_id: artistInfo.bannerId ?? null,
        description: artistInfo.description ?? null,
      },
      { transaction: artistInfo.transaction },
    );
    return { success: true, data: null };
  }
  async getArtistById(artistId: string) {
    const artistRecord = await database.artistModel.findByPk(artistId);
    if (!artistRecord) {
      return { success: false, reason: errorMessages.artist.NotExistsById };
    }
    return artistRecord;
  }
  async getArtistInfo(artistInfo: { artistId: string; userId: string }) {
    const artistRecord = this.getArtistById(artistInfo.artistId);
    if (!artistRecord.success) {
      return artistRecord;
    }
    const artistFollowersCount = database.userFollowersModel.count({
      where: { user_id: artistInfo.artistId },
    });
    const artistListens = database.trackModel.count({
      include: {
        model: database.userModel,
        required: true,
        through: { where: { artist_id: artistInfo.artistId } },
      },
    });
    const isFollowingArtist = database.userFollowingModel.findOne({
      where: { user_id: artistInfo.userId, following_id: artistInfo.artistId },
    });
    const artistLikedCount = database.playlistTrackModel.count({
      distinct: true,
      include: [
        {
          model: database.trackModel,
          through: { where: { id: artistInfo.userId } },
          include: [
            {
              model: database.userModel,
              attributes: ['id'],
              through: { attributes: [] },
              where: { id: artistInfo.artistId },
              required: true,
            },
          ],
        },
      ],
    });
    const artistData = {
      followers_count: artistFollowersCount,
      listening_count: artistListens,
      is_following: isFollowingArtist,
      liked_songs_count: artistLikedCount,
    };
    return { success: true, data: artistData };
  }
  async;
}
export default ArtistManagement;
