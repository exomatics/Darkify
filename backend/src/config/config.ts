import path from 'node:path';

const __dirname = import.meta.dirname;
export const PROJECT_ROOT = path.join(__dirname, '..', '..');
export const PUBLIC_KEY_FILE_NAME = 'id_rsa_pub';
export const PRIVATE_KEY_FILE_NAME = 'id_rsa_priv';
export const ACCESS_TOKEN_EXPIRE_DATE = '30d';
export const REFRESH_TOKEN_EXPIRE_DATE = '1y';
export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 20;
export const PATH_TO_IMAGES = path.join(PROJECT_ROOT, 'uploads', 'images');
export const STATIC_DIRECTORY_PATH = '/files';
export const PATH_TO_OPENAPI = path.resolve(PROJECT_ROOT, 'docs', 'openapi.yaml');
