import fs from 'node:fs';
import path from 'node:path';

import ffmpeg from 'fluent-ffmpeg';
import _ from 'lodash';
import sequelize, { Op } from 'sequelize';

import {
  BITRATE_OPTIONS,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  ORDER_NUMBER,
  PATH_TO_AUDIO,
  STATIC_AUDIO_PATH,
  STATIC_IMAGES_PATH,
} from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';
import { LibrarySortBy, LibraryType } from '../../interfaces/library-interface.ts';
import { Type, type OrderBy, type IPlaylist } from '../../interfaces/playlist-interface.ts';

import PlaylistManager from './playlist.ts';

import type { IReleasesReorder } from '../../interfaces/library-interface.ts';
import type { ITrack, TrackResult, UpdateTrack } from '../../interfaces/track-interface.ts';
import type { Result, SuccessfulResult } from '../../types/result-type.ts';
import type { LibraryReleasesModel } from '../library-releases.ts';
import type { PlaylistModel } from '../playlist.ts';
import type { TrackModel } from '../track.ts';
import type { UserModel } from '../user.ts';
import type { Transaction } from 'sequelize';

interface TrackModelWithUsers extends TrackModel {
  dataValues: TrackModel['dataValues'] & {
    users: UserModel[];
    album?: PlaylistModel;
    playlists?: PlaylistModel[];
  };
}
interface LibrarySinglesWithRelations extends LibraryReleasesModel {
  track: TrackModel & { users: UserModel[] };
  playlist: undefined;
}
interface LibraryAlbumsWithRelations extends LibraryReleasesModel {
  playlist: PlaylistModel & { users: UserModel[] };
  track: undefined;
}
const playlist = new PlaylistManager();

class TrackManager {
  async getTrackById(trackInfo: {
    trackId: string;
    userId: string;
  }): Promise<Result<TrackResult, typeof errorMessages.track.NotExistsById>> {
    const trackRecord = (await database.trackModel.findOne({
      where: { id: trackInfo.trackId, deleted: false },
      include: [
        {
          model: database.userModel,
          through: { attributes: [] },
          attributes: ['id', 'visible_username'],
        },
        {
          model: database.playlistModel,
          where: { id: trackInfo.userId },
          through: { attributes: ['id', 'date_added'] },
          required: false,
        },
        { association: 'album', required: false, attributes: ['id', 'name'] },
      ],
    })) as TrackModelWithUsers | null;

    if (!trackRecord) {
      return { success: false, reason: errorMessages.track.NotExistsById };
    }
    const trackWithArtists = {
      ..._.omit(trackRecord.dataValues, 'cover_id', 'users', 'admin_id', 'playlists'),
      artists: trackRecord.dataValues.users.map((trackArtists) => {
        return { id: trackArtists.id, visible_username: trackArtists.visible_username };
      }),
      is_liked: Boolean(trackRecord.dataValues.playlists?.length),
      album: trackRecord.dataValues.album ?? {
        id: trackRecord.dataValues.id,
        name: trackRecord.dataValues.name,
      },
      cover_url: trackRecord.dataValues.cover_id
        ? `${STATIC_IMAGES_PATH}/${trackRecord.dataValues.cover_id}.jpg`
        : null,
    };
    return { success: true, data: trackWithArtists };
  }
  async increasePlayCount(trackId: string) {
    const trackRecord = await this.getTrackRecordById(trackId);
    if (!trackRecord.success) {
      return { success: false, reason: errorMessages.track.NotExistsById };
    }
    await trackRecord.data.update({ play_count: ++trackRecord.data.play_count });
  }
  async updateLibraryPlayDate(
    userId: string,
    trackId: string,
  ): Promise<Result<null, typeof errorMessages.track.NotExistsById>> {
    const playlistRecord = await this.getTrackById({ trackId, userId });
    if (!playlistRecord.success) {
      return playlistRecord;
    }
    await database.libraryReleasesModel.update(
      { date_played: sequelize.fn('NOW') },
      { where: { user_id: userId, track_id: trackId } },
    );
    return { success: true, data: null };
  }
  async getTracksByName(
    searchInfo: { userId: string; trackName: string },
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<{ rows: TrackResult[]; count: number }, typeof errorMessages.track.NotExistsByName>
  > {
    const trackRecords = (await database.trackModel.findAll({
      where: { name: { [Op.iLike]: `%${searchInfo.trackName}%` }, deleted: false },
      include: [
        {
          model: database.userModel,
          through: { attributes: [] },
          attributes: ['id', 'visible_username'],
        },
        { association: 'album', attributes: ['id', 'name'] },
        {
          model: database.playlistModel,
          where: { id: searchInfo.userId },
          through: { attributes: ['id', 'date_added'] },
          required: false,
        },
      ],
      offset,
      limit,
    })) as TrackModelWithUsers[] | [];
    const totalRecordsNumber = await database.trackModel.count({
      where: { name: { [Op.iLike]: `%${searchInfo.trackName}%` }, deleted: false },
    });
    if (trackRecords.length === 0) {
      return { success: false, reason: errorMessages.track.NotExistsByName };
    }
    const tracksWithArtists = trackRecords.map((trackRecord) => {
      return {
        ..._.omit(trackRecord.dataValues, 'cover_id', 'album_id', 'users', 'admin_id', 'playlists'),
        artists: trackRecord.dataValues.users.map((trackArtists) => {
          return { id: trackArtists.id, visible_username: trackArtists.visible_username };
        }),
        is_liked: Boolean(trackRecord.dataValues.playlists?.length),
        album: trackRecord.dataValues.album ?? {
          id: trackRecord.dataValues.id,
          name: trackRecord.dataValues.name,
        },
        cover_url: trackRecord.dataValues.cover_id
          ? `${STATIC_IMAGES_PATH}/${trackRecord.dataValues.cover_id}.jpg`
          : null,
      };
    });
    return { success: true, data: { rows: tracksWithArtists, count: totalRecordsNumber } };
  }
  async searchForTracks(searchString: string, offset = 0, limit = 9, userId?: string) {
    const searchPattern = `%${searchString}%`;
    const trackRecords = (await database.trackModel.findAll({
      subQuery: false,
      where: {
        deleted: false,
        [Op.or]: [
          { name: { [Op.iLike]: searchPattern } },
          { lyrics: { [Op.iLike]: searchPattern } },
          sequelize.literal(`
            EXISTS (
              SELECT 1
              FROM "track_artists" ta
              JOIN "users" u ON u.id = ta.artist_id
              WHERE ta.track_id = "track"."id"
                AND u.visible_username ILIKE ${database.sequelize.escape(searchPattern)}
            )
          `),
        ],
        [Op.and]: [
          {
            [Op.or]: [
              { album_id: null },
              { '$album.playlist_album.date_released$': { [Op.ne]: null } },
            ],
          },
        ],
      },

      include: [
        {
          model: database.userModel,
          through: { attributes: [] },
          attributes: ['id', 'visible_username'],
        },
        {
          association: 'album',
          attributes: ['id', 'name'],
          required: false,
          include: [
            {
              model: database.playlistAlbumsModel,
              required: false,
              attributes: ['playlist_id', 'date_released'],
            },
          ],
        },
        ...(userId
          ? [
              {
                model: database.playlistModel,
                where: { id: userId },
                through: { attributes: ['id', 'date_added'] },
                required: false,
              },
            ]
          : []),
      ],
      offset,
      limit,
    })) as TrackModelWithUsers[] | [];
    const processedTracks = trackRecords.map((trackRecord) => {
      return {
        ..._.omit(trackRecord.dataValues, 'cover_id', 'album_id', 'users', 'admin_id', 'playlists'),
        artists: trackRecord.dataValues.users.map((trackArtists) => {
          return { id: trackArtists.id, visible_username: trackArtists.visible_username };
        }),
        is_liked: Boolean(trackRecord.dataValues.playlists?.length),
        album: trackRecord.dataValues.album ?? {
          id: trackRecord.dataValues.id,
          name: trackRecord.dataValues.name,
        },
        cover_url: trackRecord.dataValues.cover_id
          ? `${STATIC_IMAGES_PATH}/${trackRecord.dataValues.cover_id}.jpg`
          : null,
      };
    });
    return { success: true, data: processedTracks };
  }
  async getLibrary(
    libraryInfo: {
      userId: string;
      sort: { sortBy: LibrarySortBy; order: OrderBy };
    },
    limit?: number,
    offset?: number,
  ): Promise<
    SuccessfulResult<{
      total: number;
      items: (
        | {
            library_type?: string;
            id: string;
            name: string;
            owner: {
              id: string;
              visible_username: string;
            };
            cover_url: string | null;
          }
        | (Pick<IPlaylist, 'name'> & {
            id: string;
            owner?: {
              id: string;
              visible_username: string;
            };
            cover_url: string | null;
            library_type: LibraryType.Albums;
          })
      )[];
    }>
  > {
    const order = (
      libraryInfo.sort.sortBy === LibrarySortBy.Alphabetic
        ? [[{ model: database.trackModel }, libraryInfo.sort.sortBy, libraryInfo.sort.order]]
        : [[libraryInfo.sort.sortBy, libraryInfo.sort.order]]
    ) as sequelize.Order;
    const singlesWithAlbums = (await database.libraryReleasesModel.findAndCountAll({
      where: { user_id: libraryInfo.userId },
      attributes: ['date_played', 'date_added', 'order'],
      order,
      include: [
        {
          model: database.trackModel,
          attributes: ['id', 'cover_id', 'name'],
          include: [
            {
              model: database.userModel,
              required: false,
              // right: true,
              attributes: ['id', 'visible_username'],
            },
          ],
        },
        {
          model: database.playlistModel,
          // associationType:
          attributes: ['id', 'cover_id', 'name', 'owner'],
          where: { type: Type.Album },
          required: false,
          // right: true,
          // through: { attributes: ['playlist_id'] },
          include: [
            {
              model: database.userModel,
              // required: true,
              // right: true,
              attributes: ['id', 'visible_username'],
            },
          ],
        },
      ],
      offset,
      limit,
    })) as { count: number; rows: (LibrarySinglesWithRelations | LibraryAlbumsWithRelations)[] };
    const processedSingles = singlesWithAlbums.rows.map((row) => {
      if (row.track) {
        const processedSingleRecord = {
          library_type: 'single',
          id: row.track.id,
          name: row.track.name,
          cover_url: row.track.cover_id ? `${STATIC_IMAGES_PATH}/${row.track.cover_id}.jpg` : null,
          owner: {
            id: row.track.users[0].id,
            visible_username: row.track.users[0].visible_username,
          },
        };
        return processedSingleRecord;
      } else {
        const processedAlbumRecord = {
          ..._.pick(row.playlist, ['name', 'id']),
          cover_url: row.playlist.cover_id
            ? `${STATIC_IMAGES_PATH}/${row.playlist.cover_id}.jpg`
            : null,
          library_type: LibraryType.Albums as LibraryType.Albums,
          owner: {
            id: row.playlist.users[0].id,
            visible_username: row.playlist.users[0].visible_username,
          },
        };
        return processedAlbumRecord;
      }
    });
    return { success: true, data: { total: singlesWithAlbums.count, items: processedSingles } };
  }
  async getLibraryByIndex(
    userId: string,
    index: number,
  ): Promise<SuccessfulResult<LibraryReleasesModel | null>> {
    const librarySinglesAlbumsRecord = await database.libraryReleasesModel.findOne({
      where: { user_id: userId },
      order: [['order', 'ASC']],
      offset: index,
    });

    if (librarySinglesAlbumsRecord === null) {
      return { success: true, data: librarySinglesAlbumsRecord };
    }
    return { success: true, data: librarySinglesAlbumsRecord };
  }
  async reorderLibrary(libraryInfo: IReleasesReorder) {
    const itemRecord = await (libraryInfo.releaseType === LibraryType.Singles
      ? this.getTrackRecordById(libraryInfo.releaseId)
      : playlist.getAlbumRecordById(libraryInfo.releaseId, libraryInfo.userId));
    if (!itemRecord.success) {
      return itemRecord;
    }
    if (libraryInfo.fromIndex === libraryInfo.toIndex) {
      return { success: true, data: null };
    }
    const fromIndexRecord = await this.getLibraryByIndex(libraryInfo.userId, libraryInfo.fromIndex);
    if (!fromIndexRecord.data) {
      return { success: false, reason: errorMessages.track.LibraryNotExistsByIndex };
    }
    let toIndexPlaylistRecord;
    let afterPlaylistRecord;
    if (libraryInfo.toIndex > 0) {
      toIndexPlaylistRecord = await this.getLibraryByIndex(libraryInfo.userId, libraryInfo.toIndex);
      if (!toIndexPlaylistRecord.data) {
        return { success: false, reason: errorMessages.track.LibraryNotExistsByIndex };
      }
      afterPlaylistRecord = await database.libraryReleasesModel.findOne({
        where: {
          user_id: libraryInfo.userId,
          order: { [Op.gt]: toIndexPlaylistRecord.data.order },
        },
        order: [['order', 'ASC']],
      });
    }
    let newOrder;
    if (toIndexPlaylistRecord || afterPlaylistRecord) {
      newOrder = Math.floor(
        ((toIndexPlaylistRecord?.data?.order ?? 0) + (afterPlaylistRecord?.order ?? 0)) / 2,
      );
    }
    if (libraryInfo.toIndex === 0) {
      newOrder = Math.floor((toIndexPlaylistRecord?.data?.order ?? 0) / 2);
    }
    if (afterPlaylistRecord === null || libraryInfo.toIndex === -1) {
      const maxOrder = await database.libraryReleasesModel.max('order', {
        where: {
          [Op.and]: {
            user_id: libraryInfo.userId,
            [Op.and]: [
              sequelize.where(
                sequelize.fn('MOD', sequelize.col('order'), String(ORDER_NUMBER)),
                '=',
                '0',
              ),
            ],
          },
        },
      });
      newOrder = typeof maxOrder === 'number' ? maxOrder + ORDER_NUMBER : 0;
    }
    const collision = await database.libraryReleasesModel.findOne({
      where: {
        user_id: libraryInfo.userId,
        order: newOrder,
      },
    });
    if (collision) {
      await this.renormalizeLibraryOrder(libraryInfo.userId);
      await this.reorderLibrary(libraryInfo);
      return { success: true, data: null };
    }
    await database.libraryReleasesModel.update(
      { order: newOrder },
      {
        where: { user_id: libraryInfo.userId, order: fromIndexRecord.data.order },
        validate: false,
      },
    );
    return { success: true, data: null };
  }
  async renormalizeLibraryOrder(userId: string) {
    try {
      await database.sequelize.transaction(async (transaction) => {
        const rows = await database.libraryReleasesModel.findAll({
          where: { user_id: userId },
          order: [['order', 'ASC']],
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        const updates = rows.map((row, orderMultiplier) => ({
          id: row.id,
          user_id: userId,
          album_id: row.album_id ?? null,
          track_id: row.track_id ?? null,
          order: (orderMultiplier + 1) * ORDER_NUMBER,
        }));

        await database.libraryReleasesModel.bulkCreate(updates, {
          updateOnDuplicate: ['order'],
          transaction,
        });
      });
    } catch {
      throw new InternalError(`failed to renormalize ${userId} Library order`);
    }
  }
  async getTrackRecordById(
    trackId: string,
  ): Promise<Result<TrackModel, typeof errorMessages.track.NotExistsById>> {
    const trackInfo = await database.trackModel.findByPk(trackId);
    if (!trackInfo) {
      return { success: false, reason: errorMessages.track.NotExistsById };
    }
    return { success: true, data: trackInfo };
  }
  async convertToHls(
    trackFilename: string,
  ): Promise<Result<number, typeof errorMessages.track.FfmpegError>> {
    const pathToTrack = path.join(PATH_TO_AUDIO, `${trackFilename}.mp3`);

    const pathToHls = path.join(PATH_TO_AUDIO, trackFilename);

    const pathTo320Hls = path.resolve(pathToHls, '320kbps');
    const pathTo160Hls = path.resolve(pathToHls, '160kbps');
    const pathTo96Hls = path.resolve(pathToHls, '96kbps');
    const pathTo24Hls = path.resolve(pathToHls, '24kbps');

    fs.mkdirSync(pathToHls, { recursive: true });
    fs.mkdirSync(pathTo320Hls, { recursive: true });
    fs.mkdirSync(pathTo160Hls, { recursive: true });
    fs.mkdirSync(pathTo96Hls, { recursive: true });
    fs.mkdirSync(pathTo24Hls, { recursive: true });

    let trackDurationInSeconds = 0;

    const command = new Promise((resolve, reject) => {
      ffmpeg(pathToTrack)
        .audioCodec('aac')
        .audioChannels(2)
        .output(path.join(pathTo320Hls, '320kbps.m3u8'))
        .toFormat('hls')
        .outputOption('-map', 'a:0')
        .audioBitrate(BITRATE_OPTIONS.veryHigh)
        .outputOption('-hls_segment_filename', path.resolve(pathTo320Hls, 'data%03d.ts'))
        .outputOptions([
          '-hls_time 5',
          '-hls_playlist_type vod',
          '-hls_flags independent_segments',
          '-hls_segment_type mpegts',
          '-hls_list_size 0',
        ])

        .output(path.resolve(pathTo160Hls, '160kbps.m3u8'))
        .toFormat('hls')
        .outputOption('-map', 'a:0')
        .audioBitrate(BITRATE_OPTIONS.high)
        .outputOption('-hls_segment_filename', path.resolve(pathTo160Hls, 'data%03d.ts'))
        .outputOptions([
          '-hls_time 5',
          '-hls_playlist_type vod',
          '-hls_flags independent_segments',
          '-hls_segment_type mpegts',
          '-hls_list_size 0',
        ])

        .output(path.resolve(pathTo96Hls, '96kbps.m3u8'))
        .toFormat('hls')
        .outputOption('-map', 'a:0')
        .audioBitrate(BITRATE_OPTIONS.normal)
        .outputOption('-hls_segment_filename', path.resolve(pathTo96Hls, 'data%03d.ts'))
        .outputOptions([
          '-hls_time 5',
          '-hls_playlist_type vod',
          '-hls_flags independent_segments',
          '-hls_segment_type mpegts',
          '-hls_list_size 0',
        ])

        .output(path.join(pathTo24Hls, '24kbps.m3u8'))
        .toFormat('hls')
        .outputOption('-map', 'a:0')
        .audioBitrate(BITRATE_OPTIONS.low)
        .outputOption('-hls_segment_filename', path.resolve(pathTo24Hls, 'data%03d.ts'))
        .outputOptions([
          '-hls_time 5',
          '-hls_playlist_type vod',
          '-hls_flags independent_segments',
          '-hls_segment_type mpegts',
          '-hls_list_size 0',
        ])

        .on('codecData', function (data) {
          const trackDuration = data.duration.split(':');
          const hours = Number(trackDuration[0]) * 60 * 60;
          const minutes = Number(trackDuration[1]) * 60;
          const seconds = Number(trackDuration[2]);
          trackDurationInSeconds = Math.trunc(hours + minutes + seconds);
        })
        .on('error', (error) => {
          reject(error);
          return { success: false, reason: errorMessages.track.FfmpegError };
        })
        .on('end', () => {
          resolve('resolved');
        })
        .run();
    });

    this.createMasterPlaylist(trackFilename, pathToHls);
    await command;

    function postProcessPlaylist(pathToPlaylist: string, bitrate: string) {
      fs.writeFileSync(
        pathToPlaylist,
        fs
          .readFileSync(pathToPlaylist, 'utf8')
          .replaceAll('data', `${STATIC_AUDIO_PATH}/${trackFilename}/${bitrate}/data`),
      );
    }
    postProcessPlaylist(path.join(pathTo320Hls, '320kbps.m3u8'), '320kbps');
    postProcessPlaylist(path.join(pathTo160Hls, '160kbps.m3u8'), '160kbps');
    postProcessPlaylist(path.join(pathTo96Hls, '96kbps.m3u8'), '96kbps');
    postProcessPlaylist(path.join(pathTo24Hls, '24kbps.m3u8'), '24kbps');

    return { success: true, data: trackDurationInSeconds };
  }
  createMasterPlaylist(trackFilename: string, pathToHls: string) {
    const masterPlaylistContent = `
    #EXTM3U

    #EXT-X-STREAM-INF:BANDWIDTH=320000,NAME="320kbps"
    ${STATIC_AUDIO_PATH}/${trackFilename}/320kbps/320kbps.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=160000,NAME="160kbps"
    ${STATIC_AUDIO_PATH}/${trackFilename}/160kbps/160kbps.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=96000,NAME="96kbps"
    ${STATIC_AUDIO_PATH}/${trackFilename}/96kbps/96kbps.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=24000,NAME="24kbps"
    ${STATIC_AUDIO_PATH}/${trackFilename}/24kbps/24kbps.m3u8
    `;
    fs.writeFileSync(path.join(pathToHls, 'master_playlist.m3u8'), masterPlaylistContent);
  }
  async createTrackRecord(
    trackInfo: Pick<
      ITrack,
      'cover_id' | 'id' | 'admin_id' | 'artists' | 'album_id' | 'name' | 'lyrics' | 'duration'
    >,
  ): Promise<Result<TrackResult, typeof errorMessages.track.NotExistsById>> {
    try {
      const trackArtists = trackInfo.artists.map((value) => {
        return { track_id: trackInfo.id, is_admin: false, artist_id: value };
      });
      await database.sequelize.transaction(async (transaction) => {
        await database.trackModel.create(
          {
            id: trackInfo.id,
            admin_id: trackInfo.admin_id,
            name: trackInfo.name,
            play_count: 0,
            deleted: false,
            album_id: trackInfo.album_id ?? null,
            lyrics: trackInfo.lyrics ?? null,
            duration: trackInfo.duration,
            cover_id: trackInfo.cover_id,
            creation_date: database.sequelize.fn('NOW') as unknown as Date,
          },
          { transaction },
        );
        await database.trackArtistsModel.bulkCreate(
          [
            { track_id: trackInfo.id, is_admin: true, artist_id: trackInfo.admin_id },
            ...trackArtists,
          ],
          { transaction },
        );
      });
    } catch {
      throw new InternalError(errorMessages.track.FailedToCreate);
    }
    const trackArtistsRecord = await this.getTrackById({
      userId: trackInfo.admin_id,
      trackId: trackInfo.id,
    });
    if (!trackArtistsRecord.success) {
      return trackArtistsRecord;
    }
    return { success: true, data: trackArtistsRecord.data };
  }
  async createTrack(
    trackInfo: Pick<
      ITrack,
      'cover_id' | 'id' | 'admin_id' | 'artists' | 'album_id' | 'name' | 'lyrics'
    >,
  ): Promise<
    Result<
      TrackResult,
      typeof errorMessages.track.FfmpegError | typeof errorMessages.track.NotExistsById
    >
  > {
    const fileData = await this.convertToHls(trackInfo.id);
    if (!fileData.success) {
      return fileData;
    }
    const trackRecord = await this.createTrackRecord({
      duration: fileData.data,
      ...trackInfo,
    });
    if (!trackRecord.success) {
      return trackRecord;
    }

    return { success: true, data: trackRecord.data };
  }
  async createLibraryRecord(userId: string, single_id: string) {
    const maxOrder = await database.libraryReleasesModel.max('order', {
      where: {
        user_id: userId,
        [Op.and]: [
          sequelize.where(
            sequelize.fn('MOD', sequelize.col('order'), String(ORDER_NUMBER)),
            '=',
            '0',
          ),
        ],
      },
    });
    await database.libraryReleasesModel.create({
      id: crypto.randomUUID(),
      track_id: single_id,
      user_id: userId,
      album_id: null,
      order: typeof maxOrder === 'number' ? maxOrder + ORDER_NUMBER : ORDER_NUMBER,
    });
  }
  async deleteLibraryRecord(userId: string, singleId: string, transaction: Transaction) {
    const trackRecord = await this.getTrackById({ trackId: singleId, userId });
    if (!trackRecord.success) {
      return trackRecord;
    }
    await database.libraryReleasesModel.destroy({
      where: { user_id: userId, track_id: singleId },
      transaction,
    });
    return { success: true, data: null };
  }
  async followSingle(
    userId: string,
    singleId: string,
  ): Promise<
    Result<
      null,
      | typeof errorMessages.track.NotExistsById
      | typeof errorMessages.track.TrackIsNotASingle
      | typeof errorMessages.user.AlreadyFollowsSingle
    >
  > {
    const trackRecord = await this.getTrackById({ trackId: singleId, userId });
    if (!trackRecord.success) {
      return trackRecord;
    }
    if (trackRecord.data.album.id !== trackRecord.data.id) {
      return { success: false, reason: errorMessages.track.TrackIsNotASingle };
    }
    const librarySingleRecord = await database.libraryReleasesModel.findOne({
      where: { user_id: userId, track_id: singleId },
    });
    if (librarySingleRecord) {
      return { success: false, reason: errorMessages.user.AlreadyFollowsSingle };
    }
    await this.createLibraryRecord(userId, singleId);
    return { success: true, data: null };
  }
  async unfollowSingle(
    userId: string,
    singleId: string,
  ): Promise<
    Result<
      null,
      typeof errorMessages.track.NotExistsById | typeof errorMessages.user.NotFollowsPlaylist
    >
  > {
    const trackRecord = await this.getTrackById({ trackId: singleId, userId });
    if (!trackRecord.success) {
      return trackRecord;
    }
    const librarySingleRecord = await database.libraryReleasesModel.findOne({
      where: { user_id: userId, track_id: singleId },
    });
    if (!librarySingleRecord) {
      return { success: false, reason: errorMessages.user.NotFollowsPlaylist };
    }

    await librarySingleRecord.destroy();

    return { success: true, data: null };
  }
  async updateTrackAlbum(trackInfo: {
    trackId: string;
    albumId: string | null;
    adminId: string;
    transaction: Transaction;
  }): Promise<
    Result<
      null,
      | typeof errorMessages.track.NotExistsById
      | typeof errorMessages.track.TrackAlreadyBelongsToAlbum
      | typeof errorMessages.track.NotTheAdmin
    >
  > {
    const trackRecord = await this.getTrackRecordById(trackInfo.trackId);
    if (!trackRecord.success) {
      return trackRecord;
    }
    if (trackRecord.data.album_id === trackInfo.albumId) {
      return { success: false, reason: errorMessages.track.TrackAlreadyBelongsToAlbum };
    }
    if (trackRecord.data.admin_id !== trackInfo.adminId) {
      return { success: false, reason: errorMessages.track.NotTheAdmin };
    }
    await trackRecord.data.update(
      { album_id: trackInfo.albumId },
      { transaction: trackInfo.transaction },
    );

    return { success: true, data: null };
  }
  async updateTrack(
    trackInfo: UpdateTrack,
  ): Promise<Result<TrackResult, typeof errorMessages.track.NotExistsById>> {
    const trackRecord = await this.getTrackRecordById(trackInfo.id);
    if (!trackRecord.success) {
      return trackRecord;
    }
    try {
      if (trackInfo.artists) {
        const trackArtists = trackInfo.artists.map((value) => {
          return { track_id: trackInfo.id, is_admin: false, artist_id: value };
        });

        await database.sequelize.transaction(async (transaction) => {
          await database.trackArtistsModel.bulkCreate(trackArtists, {
            updateOnDuplicate: ['artist_id'],
            transaction,
          });
          await trackRecord.data.update(
            {
              name: trackInfo.name ?? trackRecord.data.name,
              lyrics: trackInfo.lyrics ?? trackRecord.data.lyrics,
              cover_id: trackInfo.cover_id ?? trackRecord.data.cover_id,
            },
            { transaction },
          );
        });
      } else {
        await trackRecord.data.update({
          name: trackInfo.name ?? trackRecord.data.name,
          lyrics: trackInfo.lyrics ?? trackRecord.data.lyrics,
          cover_id: trackInfo.cover_id ?? trackRecord.data.cover_id,
        });
      }
    } catch {
      throw new InternalError('failed to update track');
    }
    const trackWithArtists = await this.getTrackById({
      userId: trackInfo.userId,
      trackId: trackInfo.id,
    });
    if (!trackWithArtists.success) {
      return trackWithArtists;
    }
    return { success: true, data: trackWithArtists.data };
  }
  async deleteTrack(
    trackId: string,
  ): Promise<
    Result<
      null,
      typeof errorMessages.track.NotExistsById | typeof errorMessages.track.TrackAlreadyDeleted
    >
  > {
    const trackRecord = await this.getTrackRecordById(trackId);
    if (!trackRecord.success) {
      return trackRecord;
    }
    if (trackRecord.data.deleted) {
      return { success: false, reason: errorMessages.track.TrackAlreadyDeleted };
    }

    await trackRecord.data.update({ deleted: true });
    return { success: true, data: null };
  }
}

export default TrackManager;
