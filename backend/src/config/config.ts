import path from 'node:path';

const __dirname = import.meta.dirname;
const PROJECT_ROOT = path.join(__dirname, '..', '..');
export const PUBLIC_KEY_FILE_NAME = 'id_rsa_pub.pem';
export const PRIVATE_KEY_FILE_NAME = 'id_rsa_priv.pem';
export const PATH_TO_KEYS = path.join(PROJECT_ROOT, 'src', 'keys');
export const ACCESS_TOKEN_EXPIRE_DATE = '30d';
export const REFRESH_TOKEN_EXPIRE_DATE = '1y';
export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 20;
export const PATH_TO_IMAGES = path.join(PROJECT_ROOT, 'uploads', 'images');
export const STATIC_DIRECTORY_PATH = '/files';
