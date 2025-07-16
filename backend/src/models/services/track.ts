import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import ffmpeg from 'fluent-ffmpeg';

import { BITRATE_OPTIONS, PATH_TO_AUDIO } from '../../config/config.ts';
import database from '../../config/database.ts';
import type { Itrack } from '../../interfaces/track-interface.ts';
import type { Result } from '../../types/result-type.ts';
import type { TrackModel } from '../track.ts';
import { Bitrate } from '../../types/bitrate-type.ts';
// import database from '../../config/database.ts';
// import { errorMessages } from '../../errors/error-messages.ts';

// import type { Itrack, UpdateTrack } from '../../interfaces/track-interface.ts';
// import type { Result } from '../../types/result-type.ts';
// import type { TrackModel } from '../track.ts';

class TrackManager {
  // async getTrackById(trackId: string): Promise<Result<TrackModel>> {
  //   const trackInfo = await database.trackModel.findByPk(trackId);
  //   if (trackInfo === null) {
  //     return { success: false, reason: errorMessages.track.NotExistsById };
  //   }
  //   return { success: true, data: trackInfo };
  // }
  async createTrack(trackInfo: Pick<Itrack, 'track_filename'>) {
    const pathToTrack = path.join(PATH_TO_AUDIO, `${trackInfo.track_filename}.mp3`);
    // const mPlName = path.join(PATH_TO_AUDIO, trackInfo.track_filename);
    // const hlsSegmentFilename = path.join(
    //   PATH_TO_AUDIO,
    //   trackInfo.track_filename,
    //   `${trackInfo.track_filename}_%v`,
    //   'data%03d.ts',
    // );
    const pathToHls = path.join(PATH_TO_AUDIO, `${trackInfo.track_filename}_HLS`);

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

      .on('codecData', function (data) {
        console.log(data.audio, data.format, data.duration);
      })
      .on('error', function (error) {
        console.log('An error occurred: ' + error.message);
      })
      .on('end', function (stdout, stderr) {
        console.log(stdout, stderr);
      });
    command.run();
    const masterPlaylistContent = `
      #EXTM3U
      
      #EXT-X-STREAM-INF:BANDWIDTH=320000,NAME="320kbps"
      ${path.join(pathTo320Hls, '320kbps.m3u8')}
      #EXT-X-STREAM-INF:BANDWIDTH=160000,NAME="160kbps"
      ${path.join(pathTo320Hls, '160kbps.m3u8')}
      #EXT-X-STREAM-INF:BANDWIDTH=96000,NAME="96kbps"
      ${path.join(pathTo320Hls, '96kbps.m3u8')}
      #EXT-X-STREAM-INF:BANDWIDTH=24000,NAME="24kbps"
      ${path.join(pathTo320Hls, '24kbps.m3u8')}
      `;
    fs.writeFileSync(path.join(pathToHls, 'master_playlist.m3u8'), masterPlaylistContent);
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

    // .on('end', function () {
    //   console.log('Processing finished !');
    // })
    // console.log(command);
    // const newTrack = await database.trackModel.create({
    //   id: crypto.randomUUID(),
    //   artists: trackInfo.artists,
    //   name: trackInfo.name,
    //   play_count: 0,
    //   lyrics: trackInfo.lyrics ?? null,
    //   track_filename: `${trackInfo.track_filename}.mp3`,
    // });
    // return { success: true, data: newTrack };
  }
  // async updateTrack(trackInfo: UpdateTrack) {
  //   const trackRecord = await this.getTrackById(trackInfo.id);
  //   if (!trackRecord.success) {
  //     return { success: false, reason: errorMessages.track.NotExistsById };
  //   }
  //   await trackRecord.data.update({ artists: trackInfo.artists ?? trackRecord.data.artists });
  //   return { success: true, data: trackRecord.data.dataValues };
  // }
  // async deleteTrack(trackId: string) {
  //   const trackRecord = await this.getTrackById(trackId);
  //   if (!trackRecord.success) {
  //     return { success: false, reason: errorMessages.track.NotExistsById };
  //   }
  //   await trackRecord.data.destroy();
  //   return { success: true, data: null };
  // }
  // streamTrack(trackInfo: { id: string }) {
  // const trackRecord = await this.getTrackById(trackInfo.id);
  // if (!trackRecord.success) {
  //   return { success: false, reason: errorMessages.track.NotExistsById };
  // }
  // const pathToAudio = path.join(PATH_TO_AUDIO, trackRecord.data.track_filename);
  // const pathToAudio = path.join(PATH_TO_AUDIO, `${trackInfo.id}.mp3`);
  // console.log(pathToAudio);
  // const hlsSegmentFilename = `${trackInfo.id}_%v/data%03d.ts`;
  // const masterPlName = `master_${trackInfo.id}.m3u8`;
  // ffmpeg(pathToAudio)
  //   .audioCodec('aac')
  //   .outputOptions([
  //     '-ac 2',
  //     '-b:a 320k',
  // '-map a:0',
  // '-b:a 160k',
  // '-map a:0',
  // '-b:a 96k',
  // '-map a:0',
  // '-map a:0',
  // '-b:a 24k',
  //probably can stream just like that
  //   '-hls_time 5',
  //   // '-aq 2',
  //   '-hls_playlist_type vod',
  //   '-hls_flags independent_segments',
  //   '-hls_segment_type mpegts',
  //   '-hls_list_size 0',
  // ])
  // .outputOption('-var_stream_map', 'a:0 ')
  // .outputOption('-hls_segment_filename', hlsSegmentFilename)
  // .outputOption('-master_pl_name', `master_${trackInfo.id}.m3u8`)
  // .toFormat('hls')
  // .on('codecData', function (data) {
  //   console.log(data.audio, data.format, data.duration);
  // })
  // .on('error', function (error) {
  //   console.log('An error occurred: ' + error.message);
  // })
  // .output(`./${trackInfo.id}_%v/${trackInfo.id}_320_playlist_.m3u8`)
  // .outputOption('-b:a', '160k')
  // .output(`./${trackInfo.id}_160_playlist_.m3u8`)
  // .outputOption('-b:a', '96k')
  // .output(`./${trackInfo.id}_96_playlist_.m3u8`)
  // .outputOption('-b:a', '24k')
  // .output(`./${trackInfo.id}_24_playlist_.m3u8`)

  //     .on('end', function () {
  //       console.log('Processing finished !');
  //     })
  //     .run();
  // }
}
const tracks = new TrackManager();
console.log(await tracks.createTrack({ track_filename: '2a87a08f-79ac-4497-9da4-369d0cb40655' }));
//delete with deleted in db

export default TrackManager;
