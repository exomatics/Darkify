import crypto from 'node:crypto';

import sequelize, { Op } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';
import { Type, Restrictions } from '../../interfaces/playlist-interface.ts';

import type {
  ICreatePlaylist,
  IPlaylist,
  IReorderTrack,
  IUpdateTrack,
} from '../../interfaces/playlist-interface.ts';
import type { Result, SuccessfulResult } from '../../types/result-type.ts';
import type { PlaylistTrackModel } from '../playlist-tracks.ts';
import type { PlaylistModel } from '../playlist.ts';

interface PlaylistTotalCount extends PlaylistModel {
  dataValues: PlaylistModel['dataValues'] & { total_duration: string };
}

class PlaylistManager {
  async createPlaylist(playlistInfo: ICreatePlaylist): Promise<SuccessfulResult<PlaylistModel>> {
    const playlistRecord = await database.playlistModel.create({
      id: crypto.randomUUID(),
      name: playlistInfo.name,
      description: playlistInfo.description ?? null,
      cover_id: playlistInfo.coverId ?? null,
      owner: playlistInfo.owner,
      restrictions: playlistInfo.restrictions,
      type: Type.General,
    });

    return { success: true, data: playlistRecord };
  }
  async deletePlaylist(
    playlistId: string,
  ): Promise<Result<null, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await this.getPlaylistRecordById(playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await playlistRecord.data.destroy({ transaction });
        await database.playlistTrackModel.destroy({
          where: { playlist_id: playlistId },
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize Playlist ${playlistId} order`);
    }
    return { success: true, data: null };
  }
  async getPlaylistRecordById(
    playlistId: string,
  ): Promise<Result<PlaylistModel, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    return { success: true, data: playlistRecord };
  }

  async addTrackToPlaylist(playlistTrackInfo: {
    playlistId: string;
    trackId: string;
    playlistTrackId: string;
    userId: string;
  }): Promise<
    Result<
      PlaylistTrackModel,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(playlistTrackInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistTrackInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    let newPlaylistTrackRecord: PlaylistTrackModel;
    try {
      await database.sequelize.transaction(async (transaction) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const maxOrder = (await database.playlistTrackModel.max('order', {
          where: {
            playlist_id: playlistTrackInfo.playlistId,
            [Op.and]: [
              sequelize.where(sequelize.fn('MOD', sequelize.col('order'), '100'), '=', '0'),
            ],
          },
        })) as number | null;
        newPlaylistTrackRecord = await database.playlistTrackModel.create(
          {
            playlist_id: playlistTrackInfo.playlistId,
            id: playlistTrackInfo.playlistTrackId,
            track_id: playlistTrackInfo.trackId,
            order: maxOrder === null ? 100 : maxOrder + 100,
          },
          { transaction },
        );
        await database.playlistModel.update(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          { tracks_count: playlistRecord.data.tracks_count! + 1 },
          { where: { id: playlistRecord.data.id }, transaction },
        );
      });
    } catch {
      throw new InternalError('failed to add track');
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { success: true, data: newPlaylistTrackRecord! };
  }
  async removeTrackfromPlaylist(playlistTrackInfo: {
    playlistId: string;
    playlistTrackId: string;
    userId: string;
  }): Promise<
    Result<
      null,
      | typeof errorMessages.playlist.IsNotAnOwner
      | typeof errorMessages.playlist.TrackNotExistsByIndex
      | typeof errorMessages.playlist.NotExistsById
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(playlistTrackInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistTrackInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: {
        playlist_id: playlistTrackInfo.playlistId,
        id: playlistTrackInfo.playlistTrackId,
      },
    });
    if (!playlistTrackRecord) {
      return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
    }

    try {
      await database.sequelize.transaction(async (transaction) => {
        await playlistTrackRecord.destroy({ transaction });

        await database.playlistModel.update(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          { tracks_count: playlistRecord.data.tracks_count! - 1 },
          { where: { id: playlistRecord.data.id }, transaction },
        );
      });
    } catch {
      throw new InternalError('failed to remove track');
    }

    return { success: true, data: null };
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //make sortby and order in enum
  async getAllTracksFromPlaylist(
    playlistInfo: {
      playlistId: string;
      sort: { sortBy: string; order: string };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<{ rows: PlaylistModel[]; count: number }, typeof errorMessages.playlist.NotExistsById>
  > {
    const playlistRecord = await this.getPlaylistRecordById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    // @ts-expect-error: sequelize typing doesn't support order of this type, but it's the only way it works
    const playlistTracks = await database.playlistModel.findAndCountAll({
      attributes: [
        // 'tracks.*',
        // 'tracks->users.*',
        // [sequelize.col('tracks.users.visible_username'), 'tracks.artist_username'],
      ],
      where: { id: playlistInfo.playlistId },
      // attributes: { include: [sequelize.col('tracks->playlist_track.order'), 'order'] },
      /////////////////////////////////////////////////just change database.trackModel, database.playlistTrackModel to tracks and
      order: [[database.trackModel, database.playlistTrackModel, [sequelize.col('order'), 'ASC']]],
      //sequeilize docs are not completly useless!!!
      raw: true,
      nest: true,
      include: [
        {
          //I can bet my tooth that it doesn't fucking work
          //also through and attributes are fucking shit
          model: database.trackModel,
          attributes: ['deleted', 'name', 'duration'],
          through: ['id'],
          duplicating: true,
          include: {
            model: database.userModel,
            duplicating: true,
            attributes: ['visible_username'],
          },
        },
        //trackArtists and user probably will need to go to other query
        // {
        //   model: database.trackArtistsModel,
        //   attributes: ['artist_id'],
        // },
        // {
        //   model: database.userModel,
        //   attributes: ['visible_username'],
        //   through: { attributes: ['artist_id'] },
        // },
      ],
      offset,
      limit,
    });
    // const count = await database.playlistTrackModel.count({
    //   where: { playlist_id: playlistInfo.playlistId },
    // });
    //add track to test
    return { success: true, data: { rows: playlistTracks.rows, count: playlistTracks.count } };
  }
  async getPlaylistsByName(
    playlistInfo: Pick<IPlaylist, 'name'> & { userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<SuccessfulResult<{ rows: PlaylistModel[]; count: number }>> {
    const playlistsRecords = await database.playlistModel.findAndCountAll({
      attributes: [
        'id',
        'cover_id',
        'name',
        'owner',
        [sequelize.col('user.visible_username'), 'visible_username'],
        [sequelize.col('user.visible_username'), 'owner_id'],
      ],
      where: {
        name: { [Op.iLike]: `%${playlistInfo.name}%` },
        [Op.or]: { restrictions: Restrictions.Public, owner: playlistInfo.userId },
      },
      order: [[sequelize.literal(`owner = '${playlistInfo.userId}'`), 'DESC']],
      include: [
        {
          model: database.userModel,
          attributes: [],
        },
      ],
      offset,
      limit,
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //check how order works
    return { success: true, data: playlistsRecords };
  }

  async updateRestrictionsById(
    playlistInfo: Pick<IPlaylist, 'playlistId' | 'restrictions'> & { userId: string },
  ): Promise<
    Result<
      PlaylistModel,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    const updatedPlaylistRecord = await playlistRecord.data.update({
      restrictions: playlistInfo.restrictions,
    });

    return { success: true, data: updatedPlaylistRecord };
  }
  async updatePlaylistInfo(
    playlistInfo: IUpdateTrack & { userId: string },
  ): Promise<
    Result<
      PlaylistModel,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    const updatedPlaylistRecord = await playlistRecord.data.update({
      name: playlistInfo.name ?? playlistRecord.data.name,
      description: playlistInfo.description ?? playlistRecord.data.description,
    });

    return { success: true, data: updatedPlaylistRecord };
  }

  async getPlaylistInfo(playlistInfo: { playlistId: string; userId: string }): Promise<
    Result<
      Omit<IPlaylist, 'playlistId' | 'type'> & {
        totalDuration: number;
        songsCount: number;
        isOwner: boolean;
      },
      typeof errorMessages.playlist.NotExistsById
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const totalDurationRecord = (await database.playlistModel.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.col('tracks.duration')), 'total_duration']],
      subQuery: false,
      group: [sequelize.col('playlist.id')],
      where: { id: playlistInfo.playlistId },
      include: [
        {
          model: database.trackModel,
          attributes: [],
          through: { attributes: [] },
          // required: true,
          // duplicating: false,
        },
      ],
    })) as PlaylistTotalCount[];
    const totalDuration = totalDurationRecord[0].dataValues.total_duration;

    const songsCount = await database.playlistTrackModel.count({
      where: { playlist_id: playlistInfo.playlistId },
    });
    // console.log(playlistAndTrackRecord);
    // playlistAndTrackRecord.forEach((track) => {
    //   totalDuration += Number(track.duration);
    // });

    const responseData = {
      name: playlistRecord.data.name,
      description: playlistRecord.data.description,
      totalDuration: Number(totalDuration) || 0,
      coverId: playlistRecord.data.cover_id,
      owner: playlistRecord.data.owner,
      restrictions: playlistRecord.data.restrictions,
      songsCount,
      isOwner: playlistRecord.data.owner === playlistInfo.userId,
    };
    return { success: true, data: responseData };
  }
  async getPlaylistTrackByIndex(
    playlistId: string,
    index: number,
  ): Promise<SuccessfulResult<PlaylistTrackModel | null>> {
    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      // attributes: [[sequelize.literal('row_number() OVER'), 'row_number'], 'order'],
      where: { playlist_id: playlistId },
      order: [['order', 'ASC']],
      offset: index,
    });
    if (playlistTrackRecord === null) {
      return { success: true, data: playlistTrackRecord };
    }

    return { success: true, data: playlistTrackRecord };
  }
  async reorderPlaylistTrack(playlistInfo: IReorderTrack) {
    const playlistRecord = await this.getPlaylistRecordById(playlistInfo.playlistId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const fromIndexRecord = await this.getPlaylistTrackByIndex(
      playlistInfo.playlistId,
      playlistInfo.fromIndex,
    );
    if (!fromIndexRecord.data) {
      return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
    }
    let toIndexPlaylistRecord;
    let afterPlaylistTrackRecord;
    if (playlistInfo.toIndex > 0) {
      toIndexPlaylistRecord = await this.getPlaylistTrackByIndex(
        playlistInfo.playlistId,
        playlistInfo.toIndex,
      );
      if (!toIndexPlaylistRecord.data) {
        return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
      }

      afterPlaylistTrackRecord = await database.playlistTrackModel.findOne({
        where: {
          playlist_id: playlistInfo.playlistId,
          // order: { [Op.ne]: fromIndexRecord.data.order },
          order: { [Op.gt]: fromIndexRecord.data.order },
        },
        // order: [['order', 'ASC']],
        order: [['order', 'DESC']],
        offset: playlistInfo.toIndex,
      });
    }
    // const afterPlaylistTrackRecord = await this.getPlaylistTrackByIndex(
    //   playlistInfo.playlistId,
    //   playlistInfo.toIndex + 1,
    // // );
    // const afterPlaylistTrackRecord = await database.playlistTrackModel.findOne({
    //   where: {
    //     playlist_id: playlistInfo.playlistId,
    //     // order: { [Op.ne]: fromIndexRecord.data.order },
    //     order: { [Op.gt]: fromIndexRecord.data.order },
    //   },
    //   // order: [['order', 'ASC']],
    //   order: [['order', 'DESC']],
    //   offset: playlistInfo.toIndex,
    // });
    // if (afterPlaylistTrackRecord === null) {
    //   return { success: true, data: { order: null } };
    // }

    // const beforePlaylistTrackRecord = await this.getPlaylistTrackByIndex(
    //   playlistInfo.playlistId,
    //   playlistInfo.toIndex - 1,
    // );

    // const biggestNumber = await database.playlistTrackModel.findOne({
    //   where: {
    //     playlist_id: playlistInfo.playlistId,
    //     order: { [Op.lte]: toIndexPlaylistRecord.data.order },
    //   },
    //   order: [['order', 'DESC']],
    // });
    // console.log('biggestNumber', biggestNumber);
    // // aftertrackId is after what track is to insert a track
    // if (biggestNumber.order % 100 === 9 && !(biggestNumber.order === 9)) {
    //   // pass order to get renormalized order or maybe i can do it by quantity(of order rows) istead of order
    //   //for quantity use row_number()
    //   this.renormalizeOrder(playlistInfo.playlistId);
    // }
    // toIndexPlaylistRecord.data.order
    let newOrder;
    if (toIndexPlaylistRecord || afterPlaylistTrackRecord) {
      newOrder = Math.floor(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion , @typescript-eslint/no-unnecessary-type-assertion
        (toIndexPlaylistRecord!.data!.order + afterPlaylistTrackRecord!.order) / 2,
      );
    }
    // console.log('toindex', toIndexPlaylistRecord.data.order);
    if (playlistInfo.toIndex === 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion , @typescript-eslint/no-unnecessary-type-assertion
      newOrder = Math.floor(toIndexPlaylistRecord!.data!.order / 2);
    }
    if (afterPlaylistTrackRecord === null || playlistInfo.toIndex === -1) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const maxOrder = (await database.playlistTrackModel.max('order', {
        where: {
          [Op.and]: {
            playlist_id: playlistInfo.playlistId,
            [Op.and]: [
              sequelize.where(sequelize.fn('MOD', sequelize.col('order'), '100'), '=', '0'),
            ],
            // [Op.and]: [sequelize.literal(`("playlist_track"."order" % 100) = 0`)],
          },
        },
      })) as number | null;
      newOrder = maxOrder === null ? 0 : maxOrder + 100;
    }

    const collision = await database.playlistTrackModel.findOne({
      where: {
        playlist_id: playlistInfo.playlistId,
        order: newOrder,
      },
    });

    if (collision) {
      await this.renormalizeOrder(playlistInfo.playlistId);
      return { success: true, data: null };
    }
    await database.playlistTrackModel.update(
      { order: newOrder },
      { where: { order: fromIndexRecord.data.order } },
    );
    return { success: true, data: null };
  }
  async renormalizeOrder(playlistId: IPlaylist['playlistId']) {
    try {
      await database.sequelize.transaction(async (transaction) => {
        const rows = await database.playlistTrackModel.findAll({
          where: { playlist_id: playlistId },
          order: [['order', 'ASC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        const updates = rows.map((row, orderMultiplier) => ({
          playlist_id: playlistId,
          track_id: row.track_id,
          order: (orderMultiplier + 1) * 100,
          id: row.id,
        }));

        await database.playlistTrackModel.bulkCreate(updates, {
          updateOnDuplicate: ['order', 'id'],
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize Playlist ${playlistId} order`);
    }
  }
}
// -getAllTracksFromPlaylist-, -getPlaylistsByName-, -removeTrackFromPlaylist-, -updateRestrictions-, updatecover, -updatePlaylistInfo-, -reorderPlaylistTrack, getMeLibrary(getMeplaylists and followed playlists. sort by smth)-,
//-getPlaylistInfo(sum duration, IsOwner(to see if able to follow playlist or not))-
// createLikedSongs, likeTrack, getAllLikedSongs(pagination, sort), reorder, removeFromLikedSongs
// depend getPlaylistRecordById from auth(restrictions unlisted), getPlaylistsByName only public or owner of which is user,
// updatePlaylistInfo and updateRestrictions only if user is an owner, removeTrackFromPlaylist and addTrackToPlaylist only if user is an owner
// getnextTrack(playlist,search,likedSongs,Likedsongs from artist. )
//playlist type. Liked; general
export default PlaylistManager;
