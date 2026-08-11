import path from 'node:path';

import sequelize from 'sequelize';

import { Bitrate } from '../types/bitrate-type.ts';

import database from './database.ts';

import type { OrderItem } from '../interfaces/playlist-interface.ts';

const __dirname = import.meta.dirname;
const PROJECT_ROOT = path.join(__dirname, '..', '..');
export const PUBLIC_KEY_FILE_NAME = 'id_rsa_pub.pem';
export const PRIVATE_KEY_FILE_NAME = 'id_rsa_priv.pem';
export const PATH_TO_KEYS = path.join(PROJECT_ROOT, 'keys');
export const ACCESS_TOKEN_EXPIRE_DATE = '30d';
export const REFRESH_TOKEN_EXPIRE_DATE = '1y';
export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 20;
export const PATH_TO_UPLOADS = path.join(PROJECT_ROOT, 'uploads');
export const PATH_TO_AUDIO = path.join(PATH_TO_UPLOADS, 'audio');
export const PATH_TO_IMAGES = path.join(PATH_TO_UPLOADS, 'images');

export const PATH_TO_losslessm3u8 = path.join('lossless', 'lossless.m3u8');
export const PATH_TO_320m3u8 = path.join('320kbps', '320kbps.m3u8');
export const PATH_TO_160m3u8 = path.join('160kbps', '160kbps.m3u8');
export const PATH_TO_96m3u8 = path.join('96kbps', '96kbps.m3u8');
export const PATH_TO_24m3u8 = path.join('24kbps', '24kbps.m3u8');
export const PATH_TO_AUTO_BITRATE = 'master_playlist.m3u8';

export const STATIC_DIRECTORY_PATH = '/files';
export const STATIC_IMAGES_PATH = `${STATIC_DIRECTORY_PATH}/images`;
export const STATIC_AUDIO_PATH = `${STATIC_DIRECTORY_PATH}/audio`;

export const PATH_TO_OPENAPI = path.resolve(PROJECT_ROOT, 'docs', 'openapi.yaml');
export const ORDER_NUMBER = 100;
export const BITRATE_OPTIONS = {
  [Bitrate.Low]: '24',
  [Bitrate.Normal]: '96',
  [Bitrate.High]: '160',
  [Bitrate.VeryHigh]: '320',
  [Bitrate.Auto]: 'auto',
};

export const playlistOrderOptions: Record<string, OrderItem[]> = {
  name: [database.trackModel, sequelize.col('name')],
  date_added: [sequelize.col('date_added')],
  album: [database.trackModel, 'album', sequelize.col('name')],
  artist: [database.trackModel, database.userModel, sequelize.col('visible_username')],
  duration: [database.trackModel, sequelize.col('duration')],
  order: [sequelize.col('order')],
};

export const albumOrderOptions: Record<string, OrderItem[]> = {
  ...playlistOrderOptions,
  play_count: [database.trackModel, sequelize.col('play_count')],
};
