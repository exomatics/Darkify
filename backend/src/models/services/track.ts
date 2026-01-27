import fs from 'node:fs';
import path from 'node:path';

import ffmpeg from 'fluent-ffmpeg';
import _ from 'lodash';
import { Op } from 'sequelize';

import {
  BITRATE_OPTIONS,
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  PATH_TO_AUDIO,
  STATIC_AUDIO_PATH,
  STATIC_IMAGES_PATH,
} from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';

import type { Itrack, TrackResult, UpdateTrack } from '../../interfaces/track-interface.ts';
import type { Result } from '../../types/result-type.ts';
import type { PlaylistModel } from '../playlist.ts';
import type { TrackModel } from '../track.ts';
import type { UserModel } from '../user.ts';
import type { Transaction } from 'sequelize';

interface TrackModelWithUsers extends TrackModel {
  dataValues: TrackModel['dataValues'] & { users: UserModel[]; album?: PlaylistModel };
}

class TrackManager {
  async getTrackById(
    trackId: string,
  ): Promise<Result<TrackResult, typeof errorMessages.track.NotExistsById>> {
    const trackRecord = (await database.trackModel.findOne({
      where: { id: trackId, deleted: false },
      include: [
        {
          model: database.userModel,
          through: { attributes: [] },
          attributes: ['id', 'visible_username'],
        },
        { association: 'album', required: false, attributes: ['id', 'name'] },
      ],
      logging: true,
    })) as TrackModelWithUsers | null;

    if (!trackRecord) {
      return { success: false, reason: errorMessages.track.NotExistsById };
    }
    const trackWithArtists = {
      ..._.omit(trackRecord.dataValues, 'cover_id', 'users', 'admin_id'),
      artists: trackRecord.dataValues.users.map((trackArtists) => {
        return { id: trackArtists.id, visible_username: trackArtists.visible_username };
      }),
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
  async getTracksByName(
    trackName: string,
    limit: number = DEFAULT_LIMIT,
    offset: number = DEFAULT_OFFSET,
  ): Promise<
    Result<{ rows: TrackResult[]; count: number }, typeof errorMessages.track.NotExistsByName>
  > {
    const trackRecords = (await database.trackModel.findAll({
      where: { name: { [Op.iLike]: `%${trackName}%` }, deleted: false },
      include: [
        {
          model: database.userModel,
          through: { attributes: [] },
          attributes: ['id', 'visible_username'],
        },
        { association: 'album', attributes: ['id', 'name'] },
      ],
      offset,
      limit,
    })) as TrackModelWithUsers[] | [];
    const totalRecordsNumber = await database.trackModel.count({
      where: { name: { [Op.iLike]: `%${trackName}%` }, deleted: false },
    });
    if (trackRecords.length === 0) {
      return { success: false, reason: errorMessages.track.NotExistsByName };
    }
    const tracksWithArtists = trackRecords.map((trackRecord) => {
      return {
        ..._.omit(trackRecord.dataValues, 'cover_id', 'users', 'admin_id'),
        artists: trackRecord.dataValues.users.map((trackArtists) => {
          return { id: trackArtists.id, visible_username: trackArtists.visible_username };
        }),
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

    function postProccessPlaylist(pathToPlaylist: string, bitrate: string) {
      fs.writeFileSync(
        pathToPlaylist,
        fs
          .readFileSync(pathToPlaylist, 'utf8')
          .replaceAll('data', `${STATIC_AUDIO_PATH}/${trackFilename}/${bitrate}/data`),
      );
    }
    postProccessPlaylist(path.join(pathTo320Hls, '320kbps.m3u8'), '320kbps');
    postProccessPlaylist(path.join(pathTo160Hls, '160kbps.m3u8'), '160kbps');
    postProccessPlaylist(path.join(pathTo96Hls, '96kbps.m3u8'), '96kbps');
    postProccessPlaylist(path.join(pathTo24Hls, '24kbps.m3u8'), '24kbps');

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
      Itrack,
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
    const trackArtistsRecord = await this.getTrackById(trackInfo.id);
    if (!trackArtistsRecord.success) {
      return trackArtistsRecord;
    }
    return { success: true, data: trackArtistsRecord.data };
  }
  async createTrack(
    trackInfo: Pick<
      Itrack,
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
    const trackWithArtists = await this.getTrackById(trackInfo.id);
    if (!trackWithArtists.success) {
      return trackWithArtists;
    }
    return { success: true, data: trackWithArtists.data };
  }
  async deleteTrack(
    trackId: string,
  ): Promise<Result<null, typeof errorMessages.track.NotExistsById>> {
    const trackRecord = await this.getTrackRecordById(trackId);
    if (!trackRecord.success) {
      return trackRecord;
    }

    await trackRecord.data.update({ deleted: true });
    return { success: true, data: null };
  }
}

export default TrackManager;
