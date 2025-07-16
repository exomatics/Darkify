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
export const STATIC_DIRECTORY_PATH = '/files';
export const PATH_TO_OPENAPI = path.resolve(PROJECT_ROOT, 'docs', 'openapi.yaml');
export const BITRATE_OPTIONS = {
  [Bitrate.Low]: '24',
  [Bitrate.Normal]: '96',
  [Bitrate.High]: '160',
  [Bitrate.VeryHigh]: '320',
  [Bitrate.Auto]: 'auto',
};
