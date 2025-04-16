import path from 'node:path';

const __dirname = import.meta.dirname;

export const PUBLIC_KEY_FILE_NAME = 'id_rsa_pub';
export const PRIVATE_KEY_FILE_NAME = 'id_rsa_priv';
export const ACCESS_TOKEN_EXPIRE_DATE = '14d';
export const REFRESH_TOKEN_EXPIRE_DATE = '1y';
export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 20;
export const PATH_TO_IMAGES = path.join(__dirname, '..', '..', 'uploads', 'images');
export const STATIC_DIRECTORY_PATH = '/files';
export const BASE_AVATAR_IMAGE = '5f76b92f-6fdd-4e47-9a8c-88ce5e1fe9e1'; //must be uuid
