import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import ffmpeg from 'fluent-ffmpeg';
import { Op } from 'sequelize';

import { BITRATE_OPTIONS, PATH_TO_AUDIO, STATIC_AUDIO_PATH } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import InternalError from '../../errors/internal-error.ts';

import type { Itrack, UpdateTrack } from '../../interfaces/track-interface.ts';
import type { Result } from '../../types/result-type.ts';
import type { TrackModel } from '../track.ts';
import type { UserModel } from '../user.ts';

interface TrackModelWithUsers extends TrackModel {
  dataValues: TrackModel['dataValues'] & { users: UserModel[] };
}

class TrackManager {
  async getTrackById(
    trackId: string,
  ): Promise<
    Result<
      Omit<Itrack, 'artists'> & { users: { id: string; visible_username: string }[] },
      typeof errorMessages.track.NotExistsById
    >
  > {
    const trackInfo = (await database.trackModel.findOne({
      attributes: { exclude: ['track_foldername'] },
      where: { id: trackId },
      include: [
        {
          model: database.userModel,
          through: { attributes: [] },
          attributes: ['id', 'visible_username'],
        },
      ],
    })) as TrackModelWithUsers | null;
    if (!trackInfo) {
      return { success: false, reason: errorMessages.track.NotExistsById };
    }
    const trackWithArtists = {
      ...trackInfo.dataValues,
      play_count: trackInfo.play_count++,
      users: trackInfo.dataValues.users.map((trackArtists) => {
        return { id: trackArtists.id, visible_username: trackArtists.visible_username };
      }),
    };
    return { success: true, data: trackWithArtists };
  }
  async getTracksByName(trackName: string) {
    const trackRecords = (await database.trackModel.findAll({
      attributes: { exclude: ['track_foldername'] },
      where: { name: { [Op.iLike]: `%${trackName}%` } },
      include: [
        {
          model: database.userModel,
          through: { attributes: [] },
          attributes: ['id', 'visible_username'],
        },
      ],
    })) as TrackModelWithUsers[] | [];
    if (trackRecords.length === 0) {
      return { success: false, reason: errorMessages.track.NotExistsById };
    }
    const tracksWithArtists = trackRecords.map((trackRecord) => {
      return {
        ...trackRecord.dataValues,
        users: trackRecord.dataValues.users.map((trackArtists) => {
          return { id: trackArtists.id, visible_username: trackArtists.visible_username };
        }),
      };
    });
    return { success: true, data: tracksWithArtists };
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
  ): Promise<Result<string, typeof errorMessages.track.FfmpegError>> {
    const pathToTrack = path.join(PATH_TO_AUDIO, `${trackFilename}.mp3`);
    const pathToHls = path.join(PATH_TO_AUDIO, trackFilename);

    const pathTo320Hls = path.resolve(pathToHls, '320kbps');
    const pathTo160Hls = path.resolve(pathToHls, '160kbps');
    const pathTo96Hls = path.resolve(pathToHls, '96kbps');
    const pathTo24Hls = path.resolve(pathToHls, '24kbps');

    fs.mkdirSync(pathTo320Hls, { recursive: true });
    fs.mkdirSync(pathTo160Hls, { recursive: true });
    fs.mkdirSync(pathTo96Hls, { recursive: true });
    fs.mkdirSync(pathTo24Hls, { recursive: true });

    let trackDuration = '';

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
          trackDuration = data.duration;
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

    return { success: true, data: trackDuration };
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
    trackInfo: Pick<Itrack, 'track_foldername' | 'artists' | 'name' | 'lyrics' | 'duration'>,
  ): Promise<
    Result<
      Omit<Itrack, 'artists'> & { users: { id: string; visible_username: string }[] },
      typeof errorMessages.track.NotExistsById
    >
  > {
    try {
      const trackId = crypto.randomUUID();
      const trackArtists = trackInfo.artists.map((value) => {
        return { track_id: trackId, artist_id: value };
      });
      await database.sequelize.transaction(async (transaction) => {
        await database.trackModel.create(
          {
            id: trackId,
            name: trackInfo.name,
            play_count: 0,
            lyrics: trackInfo.lyrics ?? null,
            track_foldername: trackInfo.track_foldername,
            duration: trackInfo.duration,
          },
          { transaction },
        );
        await database.trackArtistsModel.bulkCreate(trackArtists, { transaction });
      });
      const trackArtistsRecord = await this.getTrackById(trackId);
      if (!trackArtistsRecord.success) {
        return trackArtistsRecord;
      }
      return { success: true, data: trackArtistsRecord.data };
    } catch {
      throw new InternalError('failed to create track');
    }
  }
  async createTrack(
    trackInfo: Pick<Itrack, 'track_foldername' | 'artists' | 'name' | 'lyrics'>,
  ): Promise<
    Result<
      Omit<Itrack, 'artists'> & { users: { id: string; visible_username: string }[] },
      typeof errorMessages.track.FfmpegError | typeof errorMessages.track.NotExistsById
    >
  > {
    const fileData = await this.convertToHls(trackInfo.track_foldername);
    if (!fileData.success) {
      return fileData;
    }

    const trackRecord = await this.createTrackRecord({ ...trackInfo, duration: fileData.data });
    if (!trackRecord.success) {
      return trackRecord;
    }
    return { success: true, data: trackRecord.data };
  }
  async updateTrack(
    trackInfo: UpdateTrack,
  ): Promise<
    Result<
      Omit<Itrack, 'artists'> & { users: { id: string; visible_username: string }[] },
      typeof errorMessages.track.NotExistsById
    >
  > {
    const trackRecord = await this.getTrackRecordById(trackInfo.id);
    if (!trackRecord.success) {
      return trackRecord;
    }
    try {
      if (trackInfo.artists) {
        const trackArtists = trackInfo.artists.map((value) => {
          return { track_id: trackInfo.id, artist_id: value };
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
            },
            { transaction },
          );
        });
      } else {
        await trackRecord.data.update({
          name: trackInfo.name ?? trackRecord.data.name,
          lyrics: trackInfo.lyrics ?? trackRecord.data.lyrics,
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
