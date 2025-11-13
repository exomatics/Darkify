import crypto from 'node:crypto';

import _ from 'lodash';
import sequelize, { Op } from 'sequelize';

import { DEFAULT_LIMIT, DEFAULT_OFFSET, STATIC_IMAGES_PATH } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';
import { LibrarySortBy } from '../../interfaces/library-interface.ts';
import { Type, Restrictions } from '../../interfaces/playlist-interface.ts';

import type {
  ICreatePlaylist,
  IPlaylist,
  IReorder,
  IUpdatePlaylist,
  sortBy,
  Order,
} from '../../interfaces/playlist-interface.ts';
import type { Itrack } from '../../interfaces/track-interface.ts';
import type { Result, SuccessfulResult } from '../../types/result-type.ts';
import type { LibraryPlaylistsModel } from '../library-playlists.ts';
import type { PlaylistTrackModel } from '../playlist-tracks.ts';
import type { PlaylistModel } from '../playlist.ts';
import type { Transaction } from 'sequelize';

interface PlaylistTotalCount extends PlaylistModel {
  dataValues: PlaylistModel['dataValues'] & { total_duration: string };
}

interface IGetPlaylistsByName extends PlaylistModel {
  dataValues: PlaylistModel['dataValues'] & { owner_username: string };
}

type IPlaylistInfo = Omit<IPlaylist, 'playlistId' | 'type'> & {
  totalDuration: number;
  songsCount: number;
  isOwner: boolean;
};

class PlaylistManager {
  async createPlaylist(
    playlistInfo: ICreatePlaylist & Pick<IPlaylist, 'restrictions' | 'coverId'>,
  ): Promise<Result<IPlaylistInfo & { id: string }, typeof errorMessages.playlist.NotExistsById>> {
    let playlistRecord;
    try {
      await database.sequelize.transaction(async (transaction) => {
        playlistRecord = await database.playlistModel.create(
          {
            id: crypto.randomUUID(),
            name: playlistInfo.name,
            description: playlistInfo.description ?? null,
            cover_id: playlistInfo.coverId ?? null,
            owner: playlistInfo.owner,
            restrictions: playlistInfo.restrictions,
            type: Type.General,
          },
          { transaction },
        );
        await this.createLibraryRecord(playlistRecord.owner, playlistRecord.id, transaction);
      });
    } catch {
      throw new InternalError('failed to create playlist');
    }

    const newPlaylistInfo = await this.getPlaylistInfo({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access
      playlistId: playlistRecord!.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access
      userId: playlistRecord!.owner,
    });
    if (!newPlaylistInfo.success) {
      return newPlaylistInfo;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-member-access
    return { success: true, data: { ...newPlaylistInfo.data, id: playlistRecord!.id } };
  }
  async deletePlaylist(playlistInfo: {
    playlistId: string;
    userId: string;
  }): Promise<Result<null, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    try {
      await database.sequelize.transaction(async (transaction) => {
        await playlistRecord.data.destroy({ transaction });
        await database.playlistTrackModel.destroy({
          where: { playlist_id: playlistInfo.playlistId },
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize Playlist ${playlistInfo.playlistId} order`);
    }
    return { success: true, data: null };
  }
  async getPlaylistRecordById(
    playlistId: string,
    userId: string,
  ): Promise<Result<PlaylistModel, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await database.playlistModel.findByPk(playlistId);
    if (!playlistRecord) {
      return { success: false, reason: errorMessages.playlist.NotExistsById };
    }
    if (playlistRecord.restrictions === Restrictions.Private && playlistRecord.owner !== userId) {
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
      { playlistTrackId: string },
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistTrackInfo.playlistId,
      playlistTrackInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistTrackInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
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
        await database.playlistTrackModel.create(
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
    return { success: true, data: { playlistTrackId: playlistTrackInfo.playlistTrackId } };
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
    const playlistRecord = await this.getPlaylistRecordById(
      playlistTrackInfo.playlistId,
      playlistTrackInfo.userId,
    );
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
      userId: string;
      sort: { sortBy: sortBy; order: Order };
    },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<
      {
        rows: (Pick<Itrack, 'deleted' | 'name' | 'duration'> & {
          trackId: string;
          playlistTrackId: string;
          dateAdded: string;
          artist: { id: string; visible_username: string };
        })[];
        count: number;
      },
      typeof errorMessages.playlist.NotExistsById
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    // @ts-expect-error: sequelize typing doesn't support order of this type, but it's the only way it works
    const playlistTracks = (await database.playlistModel.findAndCountAll({
      attributes: [
        // 'tracks.*',
        // 'tracks.users.*',
        // [sequelize.col('tracks.users.id'), 'artist_id'],
        // 'id',
      ],
      where: { id: playlistInfo.playlistId },
      // attributes: { include: [sequelize.col('tracks->playlist_track.order'), 'order'] },
      /////////////////////////////////////////////////just change database.trackModel, database.playlistTrackModel to tracks and
      order: [
        [
          database.trackModel,
          database.playlistTrackModel,
          [sequelize.col(playlistInfo.sort.sortBy), playlistInfo.sort.order],
        ],
      ],
      //sequeilize docs are not completly useless!!!
      // plain: true,
      raw: true,
      // nest: true,
      // duplicating: false,
      include: [
        {
          //I can bet my tooth that it doesn't fucking work
          //also through and attributes are fucking shit

          model: database.trackModel,
          attributes: ['deleted', 'name', 'duration'],
          through: { attributes: ['id', 'date_added'] },
          // distinct: false,
          // duplicating: false,
          // raw: true,
          // nest: false,
          include: {
            model: database.userModel,
            // distinct: false,
            // duplicating: false,
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
      logging: true,
    })) as {
      rows: {
        id: string;
        'tracks.deleted': boolean;
        'tracks.name': string;
        'tracks.duration': number;
        'tracks.playlist_track.order': number;
        'tracks.playlist_track.track_id': string;
        'tracks.playlist_track.playlist_id': string;
        'tracks.playlist_track.id': string;
        'tracks.playlist_track.date_added': string;
        'track.users.id': string;
        'tracks.users.visible_username': string;
        'tracks.users.track_artists.artist_id': string;
        'tracks.users.track_artists.is_admin': boolean;
        'tracks.users.track_artists.track_id': string;
      }[];
      count: number;
    };
    // console.log(3);

    // const count = await database.playlistTrackModel.count({
    //   where: { playlist_id: playlistInfo.playlistId },
    // });
    //add track to test
    const processedPlaylistRows = playlistTracks.rows.map((row) => {
      return {
        deleted: row['tracks.deleted'],
        name: row['tracks.name'],
        duration: row['tracks.duration'],
        trackId: row['tracks.playlist_track.track_id'],
        playlistTrackId: row['tracks.playlist_track.id'],
        dateAdded: row['tracks.playlist_track.date_added'],
        artist: {
          id: row['tracks.users.track_artists.artist_id'],
          visible_username: row['tracks.users.visible_username'],
        },
      };
    });
    return {
      success: true,
      data: { rows: processedPlaylistRows, count: playlistTracks.count },
    };
  }
  async getPlaylistsByName(
    playlistInfo: Pick<IPlaylist, 'name'> & { userId: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    SuccessfulResult<{
      rows: (Omit<IPlaylist, 'playlistId' | 'owner' | 'coverId'> & {
        owner: {
          id: string;
          visible_username: string;
        };
        cover_url: string | null;
      })[];
      count: number;
    }>
  > {
    const playlistsRecords = (await database.playlistModel.findAndCountAll({
      attributes: [
        'id',
        'cover_id',
        'name',
        'owner',
        // [sequelize.col('user.visible_username'), 'visible_username'],
        [sequelize.col('user.visible_username'), 'owner_username'],
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
    })) as unknown as {
      rows: IGetPlaylistsByName[];
      count: number;
    };

    const proccessedPlaylistRecords = playlistsRecords.rows.map((playlistRecord) => {
      return {
        ..._.omit(playlistRecord.dataValues, 'cover_id', 'owner_username'),
        owner: {
          id: playlistRecord.owner,
          visible_username: playlistRecord.dataValues.owner_username,
        },
        cover_url: playlistRecord.dataValues.cover_id
          ? `${STATIC_IMAGES_PATH}/${playlistRecord.dataValues.cover_id}.jpg`
          : null,
      };
    });

    return {
      success: true,
      data: { rows: proccessedPlaylistRecords, count: playlistsRecords.count },
    };
  }
  async updateLibraryPlayDate(
    userId: string,
    playlistId: string,
  ): Promise<Result<null, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await this.getPlaylistRecordById(playlistId, userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    await database.libraryPlaylists.update(
      { date_played: sequelize.fn('NOW') },
      { where: { user_id: userId, playlist_id: playlistId } },
    );
    return { success: true, data: null };
  }
  async updateRestrictionsById(
    playlistInfo: Pick<IPlaylist, 'playlistId' | 'restrictions'> & { userId: string },
  ): Promise<
    Result<
      IPlaylistInfo,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    await playlistRecord.data.update({
      restrictions: playlistInfo.restrictions,
    });

    const updatedPlaylistInfo = await this.getPlaylistInfo({
      playlistId: playlistRecord.data.id,
      userId: playlistRecord.data.owner,
    });
    if (!updatedPlaylistInfo.success) {
      return updatedPlaylistInfo;
    }

    return { success: true, data: updatedPlaylistInfo.data };
  }
  async updateCoverById(
    playlistInfo: Pick<IPlaylist, 'playlistId' | 'coverId'> & { userId: string },
  ): Promise<
    Result<
      IPlaylistInfo,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }

    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }

    await playlistRecord.data.update({
      cover_id: playlistInfo.coverId ?? playlistRecord.data.cover_id,
    });

    const updatedPlaylistInfo = await this.getPlaylistInfo({
      playlistId: playlistRecord.data.id,
      userId: playlistRecord.data.owner,
    });
    if (!updatedPlaylistInfo.success) {
      return updatedPlaylistInfo;
    }

    return { success: true, data: updatedPlaylistInfo.data };
  }
  async updatePlaylistInfo(
    playlistInfo: IUpdatePlaylist & { userId: string },
  ): Promise<
    Result<
      IPlaylistInfo,
      typeof errorMessages.playlist.NotExistsById | typeof errorMessages.playlist.IsNotAnOwner
    >
  > {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    if (playlistRecord.data.owner !== playlistInfo.userId) {
      return { success: false, reason: errorMessages.playlist.IsNotAnOwner };
    }
    await playlistRecord.data.update({
      name: playlistInfo.name ?? playlistRecord.data.name,
      description: playlistInfo.description ?? playlistRecord.data.description,
    });
    const updatedPlaylistInfo = await this.getPlaylistInfo({
      playlistId: playlistRecord.data.id,
      userId: playlistRecord.data.owner,
    });
    if (!updatedPlaylistInfo.success) {
      return updatedPlaylistInfo;
    }

    return { success: true, data: updatedPlaylistInfo.data };
  }

  async getPlaylistInfo(playlistInfo: {
    playlistId: string;
    userId: string;
  }): Promise<Result<IPlaylistInfo, typeof errorMessages.playlist.NotExistsById>> {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
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
      type: playlistRecord.data.type,
      songsCount,
      isOwner: playlistRecord.data.owner === playlistInfo.userId,
    };
    return { success: true, data: responseData };
  }
  async getLibrary(
    userId: string,
    sort: { sortBy: LibrarySortBy; order: Order },
    limit = DEFAULT_LIMIT,
    offset = DEFAULT_OFFSET,
  ) {
    const order =
      sort.sortBy === LibrarySortBy.Alphabetic
        ? [[{ model: database.playlistModel }, sort.sortBy, sort.order]]
        : [[sort.sortBy, sort.order]];

    const playlistRecords = (await database.libraryPlaylists.findAndCountAll({
      where: { user_id: userId },
      raw: true,
      nest: true,
      // @ts-expect-error: sequelize typing doesn't support order of this type, but it's the only way it works
      order,
      include: [
        {
          model: database.playlistModel,
          // associationType:
          attributes: ['id', 'cover_id', 'name', 'owner'],
          // required: true,
          right: true,
          // where: {
          //   id: { $col: 'playlists.id' },
          // },
          // through: { attributes: ['playlist_id'] },
          include: [
            {
              model: database.userModel,
              right: true,

              attributes: ['id', 'visible_username'],
            },
          ],
        },
      ],
      offset,
      logging: true,
      limit,
    })) as unknown as {
      rows: {
        playlist_id: string;
        user_id: string;
        date_played: string;
        playlists: PlaylistModel['dataValues'] & { user: { id: string; visible_username: string } };
      }[];
      count: number;
    };
    const processedPlaylistRecords = playlistRecords.rows.map((playlistLibraryRecord) => {
      return {
        ...playlistLibraryRecord,
        playlists: {
          ..._.omit(playlistLibraryRecord.playlists, ['cover_id', 'owner', 'user']),
          owner: {
            id: playlistLibraryRecord.playlists.user.id,
            visible_username: playlistLibraryRecord.playlists.user.visible_username,
          },
          cover_url: playlistLibraryRecord.playlists.cover_id
            ? `${STATIC_IMAGES_PATH}/${playlistLibraryRecord.playlists.cover_id}.jpg`
            : null,
        },
      };
    });
    return { success: true, data: processedPlaylistRecords };
  }
  async createLibraryRecord(userId: string, playlistId: string, transaction: Transaction) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const maxOrder = (await database.libraryPlaylists.max('order', {
      where: {
        user_id: userId,
        [Op.and]: [sequelize.where(sequelize.fn('MOD', sequelize.col('order'), '100'), '=', '0')],
      },
      transaction,
    })) as number | null;
    await database.libraryPlaylists.create(
      {
        playlist_id: playlistId,
        user_id: userId,
        order: maxOrder === null ? 100 : maxOrder + 100,
      },
      { transaction },
    );
  }
  async deleteLibraryRecord(userId: string, playlistId: string, transaction: Transaction) {
    const playlistRecord = await this.getPlaylistRecordById(playlistId, userId);
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    await playlistRecord.data.destroy({ transaction });
    return { success: true, data: null };
  }

  async getLibraryPlaylistByIndex(
    playlistId: string,
    index: number,
    userId: string,
  ): Promise<SuccessfulResult<LibraryPlaylistsModel | null>> {
    const LibraryPlaylistRecord = await database.libraryPlaylists.findOne({
      where: { playlist_id: playlistId, user_id: userId },
      order: [['order', 'ASC']],
      offset: index,
    });
    if (LibraryPlaylistRecord === null) {
      return { success: true, data: LibraryPlaylistRecord };
    }

    return { success: true, data: LibraryPlaylistRecord };
  }
  async reorderLibrary(libraryInfo: IReorder) {
    const playlistRecord = await this.getPlaylistRecordById(
      libraryInfo.playlistId,
      libraryInfo.userId,
    );
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    const fromIndexRecord = await this.getLibraryPlaylistByIndex(
      libraryInfo.playlistId,
      libraryInfo.fromIndex,
      libraryInfo.userId,
    );
    if (!fromIndexRecord.data) {
      return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
    }
    let toIndexPlaylistRecord;
    let afterPlaylistRecord;
    if (libraryInfo.toIndex > 0) {
      toIndexPlaylistRecord = await this.getLibraryPlaylistByIndex(
        libraryInfo.playlistId,
        libraryInfo.toIndex,
        libraryInfo.userId,
      );
      if (!toIndexPlaylistRecord.data) {
        return { success: false, reason: errorMessages.playlist.TrackNotExistsByIndex };
      }

      afterPlaylistRecord = await database.libraryPlaylists.findOne({
        where: {
          playlist_id: libraryInfo.playlistId,
          user_id: libraryInfo.userId,
          order: { [Op.gt]: fromIndexRecord.data.order },
        },
        order: [['order', 'DESC']],
        offset: libraryInfo.toIndex,
      });
    }
    let newOrder;
    if (toIndexPlaylistRecord || afterPlaylistRecord) {
      newOrder = Math.floor(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion , @typescript-eslint/no-unnecessary-type-assertion
        (toIndexPlaylistRecord!.data!.order + afterPlaylistRecord!.order) / 2,
      );
    }
    if (libraryInfo.toIndex === 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion , @typescript-eslint/no-unnecessary-type-assertion
      newOrder = Math.floor(toIndexPlaylistRecord!.data!.order / 2);
    }
    if (afterPlaylistRecord === null || libraryInfo.toIndex === -1) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const maxOrder = (await database.libraryPlaylists.max('order', {
        where: {
          [Op.and]: {
            user_id: libraryInfo.userId,
            [Op.and]: [
              sequelize.where(sequelize.fn('MOD', sequelize.col('order'), '100'), '=', '0'),
            ],
          },
        },
      })) as number | null;
      newOrder = maxOrder === null ? 0 : maxOrder + 100;
    }

    const collision = await database.libraryPlaylists.findOne({
      where: {
        playlist_id: libraryInfo.playlistId,
        user_id: libraryInfo.userId,
        order: newOrder,
      },
    });

    if (collision) {
      await this.renormalizePlaylistOrder(libraryInfo.playlistId);
      return { success: false, data: 'renormalization' };
    }
    await database.playlistTrackModel.update(
      { order: newOrder },
      { where: { order: fromIndexRecord.data.order } },
    );
    return { success: true, data: null };
  }
  async renormalizeLibraryOrder(userId: string) {
    try {
      await database.sequelize.transaction(async (transaction) => {
        const rows = await database.libraryPlaylists.findAll({
          where: { user_id: userId },
          order: [['order', 'ASC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        const updates = rows.map((row, orderMultiplier) => ({
          user_id: userId,
          playlist_id: row.playlist_id,
          order: (orderMultiplier + 1) * 100,
        }));

        await database.libraryPlaylists.bulkCreate(updates, {
          updateOnDuplicate: ['order'],
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize ${userId} Library order`);
    }
  }

  async getPlaylistTrackByIndex(
    playlistId: string,
    index: number,
  ): Promise<SuccessfulResult<PlaylistTrackModel | null>> {
    const playlistTrackRecord = await database.playlistTrackModel.findOne({
      where: { playlist_id: playlistId },
      order: [['order', 'ASC']],
      offset: index,
    });
    if (playlistTrackRecord === null) {
      return { success: true, data: playlistTrackRecord };
    }

    return { success: true, data: playlistTrackRecord };
  }
  async reorderPlaylistTrack(playlistInfo: IReorder) {
    const playlistRecord = await this.getPlaylistRecordById(
      playlistInfo.playlistId,
      playlistInfo.userId,
    );
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
          order: { [Op.gt]: fromIndexRecord.data.order },
        },
        order: [['order', 'DESC']],
        offset: playlistInfo.toIndex,
      });
    }
    let newOrder;
    if (toIndexPlaylistRecord || afterPlaylistTrackRecord) {
      newOrder = Math.floor(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion , @typescript-eslint/no-unnecessary-type-assertion
        (toIndexPlaylistRecord!.data!.order + afterPlaylistTrackRecord!.order) / 2,
      );
    }
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
      await this.renormalizePlaylistOrder(playlistInfo.playlistId);
      return { success: false, data: 'renormalization' };
    }
    await database.playlistTrackModel.update(
      { order: newOrder },
      { where: { order: fromIndexRecord.data.order } },
    );
    return { success: true, data: null };
  }
  async renormalizePlaylistOrder(playlistId: IPlaylist['playlistId']) {
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

// artist profiles. top songs, all
