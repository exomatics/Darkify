import path from 'node:path';

import { Bitrate } from '../types/bitrate-type.ts';
const __dirname = import.meta.dirname;
export const PROJECT_ROOT = path.join(__dirname, '..', '..');
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

export const STATIC_PATH_TO_320m3u8 = '320kbps/320kbps.m3u8';
export const STATIC_PATH_TO_160m3u8 = '160kbps/160kbps.m3u8';
export const STATIC_PATH_TO_96m3u8 = '96kbps/96kbps.m3u8';
export const STATIC_PATH_TO_24m3u8 = '24kbps/24kbps.m3u8';
export const STATIC_PATH_TO_AUTO_BITRATE = 'master_playlist.m3u8';
export const STATIC_DIRECTORY_PATH = '/files';
export const STATIC_IMAGES_PATH = `${STATIC_DIRECTORY_PATH}/images`;
export const STATIC_AUDIO_PATH = `${STATIC_DIRECTORY_PATH}/audio`;

export const PATH_TO_OPENAPI = path.resolve(PROJECT_ROOT, 'docs', 'openapi.yaml');

export const BITRATE_OPTIONS = {
  [Bitrate.Low]: '24',
  [Bitrate.Normal]: '96',
  [Bitrate.High]: '160',
  [Bitrate.VeryHigh]: '320',
  [Bitrate.Auto]: 'auto',
};
