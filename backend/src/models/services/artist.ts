import { type Transaction } from 'sequelize';
import sequelize from 'sequelize';

import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';

import type { IArtist } from '../../interfaces/artist-interface.ts';
import type { Result } from '../../types/result-type.ts';
import type { ArtistModel } from '../artists.ts';
import type { TrackModel } from '../track.ts';
import type { UserModel } from '../user.ts';

interface TracksWithArtists extends TrackModel {
  dataValues: TrackModel['dataValues'] & { total_listens: number };
  users: UserModel[];
}
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
  async getArtistById(
    artistId: string,
  ): Promise<Result<ArtistModel, typeof errorMessages.artist.NotExistsById>> {
    const artistRecord = await database.artistModel.findByPk(artistId);
    if (!artistRecord) {
      return { success: false, reason: errorMessages.artist.NotExistsById };
    }
    return { success: true, data: artistRecord };
  }
  async getArtistInfo(artistInfo: { artistId: string; userId: string }): Promise<
    Result<
      {
        followers_count: number;
        listening_count: number;
        is_following: boolean;
        liked_songs_count: number;
        description: string | null;
        banner_id: string | null;
      },
      typeof errorMessages.artist.NotExistsById
    >
  > {
    const artistRecord = await this.getArtistById(artistInfo.artistId);
    if (!artistRecord.success) {
      return artistRecord;
    }
    const artistFollowersCount = await database.userFollowersModel.count({
      where: { user_id: artistInfo.artistId },
    });
    const artistListens = (await database.trackModel.findAll({
      attributes: ['id', [sequelize.fn('sum', sequelize.col('play_count')), 'total_listens']],
      group: ['track.id', 'users.id'],
      include: {
        model: database.userModel,
        required: true,
        through: { attributes: [], where: { artist_id: artistInfo.artistId } },
      },
    })) as TracksWithArtists[];
    const isFollowingArtist = await database.userFollowingModel.findOne({
      where: { user_id: artistInfo.userId, following_id: artistInfo.artistId },
    });

    const artistLikedCount = await database.trackModel.count({
      distinct: true,
      include: [
        {
          model: database.userModel,
          through: { where: { artist_id: artistInfo.artistId } },
          required: true,
        },
        {
          model: database.playlistModel,
          where: { id: artistInfo.userId },
          required: true,
        },
      ],
    });
    return {
      success: true,
      data: {
        banner_id: artistRecord.data.banner_id,
        description: artistRecord.data.description,
        followers_count: artistFollowersCount,
        listening_count: Number(artistListens[0].dataValues.total_listens),
        is_following: !!isFollowingArtist,
        liked_songs_count: artistLikedCount,
      },
    };
  }
}
export default ArtistManagement;
