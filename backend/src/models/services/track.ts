import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import ffmpeg from 'fluent-ffmpeg';

import { BITRATE_OPTIONS, PATH_TO_AUDIO, STATIC_AUDIO_PATH } from '../../config/config.ts';
import database from '../../config/database.ts';
import { errorMessages } from '../../errors/error-messages.ts';

import type { Itrack, UpdateTrack } from '../../interfaces/track-interface.ts';
import type { Result } from '../../types/result-type.ts';
import type { TrackModel } from '../track.ts';

class TrackManager {
  async getTrackById(trackId: string): Promise<Result<TrackModel>> {
    const trackInfo = await database.trackModel.findByPk(trackId);
    if (trackInfo === null) {
      return { success: false, reason: errorMessages.track.NotExistsById };
    }
    return { success: true, data: trackInfo };
  }
  convertToHls(trackId: string) {
    const pathToTrack = path.join(PATH_TO_AUDIO, `${trackId}.mp3`);
    const pathToHls = path.join(PATH_TO_AUDIO, trackId);

    const pathTo320Hls = path.resolve(pathToHls, '320kbps');
    const pathTo160Hls = path.resolve(pathToHls, '160kbps');
    const pathTo96Hls = path.resolve(pathToHls, '96kbps');
    const pathTo24Hls = path.resolve(pathToHls, '24kbps');

    fs.mkdirSync(pathTo320Hls, { recursive: true });
    fs.mkdirSync(pathTo160Hls, { recursive: true });
    fs.mkdirSync(pathTo96Hls, { recursive: true });
    fs.mkdirSync(pathTo24Hls, { recursive: true });

    const command = ffmpeg(pathToTrack)
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

      // .on('codecData', function (data) {
      //   console.log(data.audio, data.format, data.duration);
      // })
      .on('error', () => {
        return { success: false, reason: errorMessages.track.FfmpegError };
      });
    command.run();
    this.createMasterPlaylist(trackId, pathToHls);
    // .output(
    //   path.join(
    //     PATH_TO_AUDIO,
    //     trackInfo.track_filename,
    //     `${trackInfo.track_filename}_%v`,
    //     `${trackInfo.track_filename}_320_playlist_.m3u8`,
    //   ),
    // )
    // // .outputOption('-b:a', '160k')
    // // .output(`./${trackInfo.id}_160_playlist_.m3u8`)
    // // .outputOption('-b:a', '96k')
    // // .output(`./${trackInfo.id}_96_playlist_.m3u8`)
    // // .outputOption('-b:a', '24k')
    // // .output(`./${trackInfo.id}_24_playlist_.m3u8`)
    // const newTrack = await database.trackModel.create({
    //   id: crypto.randomUUID(),
    //   artists: trackInfo.artists,
    //   name: trackInfo.name,
    //   play_count: 0,
    //   lyrics: trackInfo.lyrics ?? null,
    //   track_filename: trackInfo.track_filename,
    // });
    // .on('end', function () {
    //   console.log('Processing finished !');
    // })
    return { success: true, data: null };
  }
  createMasterPlaylist(trackId: string, pathToHls: string) {
    const masterPlaylistContent = `
    #EXTM3U
    
    #EXT-X-STREAM-INF:BANDWIDTH=320000,NAME="320kbps"
    ${STATIC_AUDIO_PATH}/${trackId}/320kbps/320kbps.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=160000,NAME="160kbps"
    ${STATIC_AUDIO_PATH}/${trackId}/160kbps/160kbps.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=96000,NAME="96kbps"
    ${STATIC_AUDIO_PATH}/${trackId}/96kbps/96kbps.m3u8
    #EXT-X-STREAM-INF:BANDWIDTH=24000,NAME="24kbps"
    ${STATIC_AUDIO_PATH}/${trackId}/24kbps/24kbps.m3u8
    `;
    fs.writeFileSync(path.join(pathToHls, 'master_playlist.m3u8'), masterPlaylistContent);
  }
  async createTrackRecord(
    trackInfo: Pick<Itrack, 'track_filename' | 'artists' | 'name' | 'lyrics'>,
  ) {
    const newTrack = await database.trackModel.create({
      id: crypto.randomUUID(),
      artists: trackInfo.artists,
      name: trackInfo.name,
      play_count: 0,
      lyrics: trackInfo.lyrics ?? null,
      track_filename: trackInfo.track_filename,
    });
    return { success: true, data: newTrack };
  }
  async createTrack(trackInfo: Pick<Itrack, 'track_filename' | 'artists' | 'name' | 'lyrics'>) {
    const convertStatus = this.convertToHls(trackInfo.track_filename);
    if (!convertStatus.success) {
      return convertStatus;
    }

    const trackRecord = await this.createTrackRecord(trackInfo);
    return trackRecord;
  }
  async updateTrack(trackInfo: UpdateTrack) {
    const trackRecord = await this.getTrackById(trackInfo.id);
    if (!trackRecord.success) {
      return trackRecord;
    }

    await trackRecord.data.update({
      artists: trackInfo.artists ?? trackRecord.data.artists,
      name: trackInfo.name ?? trackRecord.data.name,
      lyrics: trackInfo.lyrics ?? trackRecord.data.lyrics,
    });
    return { success: true, data: trackRecord };
  }
}
// const tracks = new TrackManager();
// console.log(
//   await tracks.createTrack({
//     artists: ['Orgasm'],
//     name: 'Mindfuck',
//     track_filename: '2a87a08f-79ac-4497-9da4-369d0cb40655',
//   }),
// );
//delete with deleted in db

export default TrackManager;
