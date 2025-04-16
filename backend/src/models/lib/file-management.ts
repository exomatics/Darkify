import crypto from 'node:crypto';
import path from 'node:path';

import sharp from 'sharp';

import { PATH_TO_IMAGES } from '../../config/config.ts';
class File {
  async uploadImage(fileBuffer: Express.Multer.File) {
    const fileName = crypto.randomUUID();
    const pathToFile = path.join(PATH_TO_IMAGES, `${fileName}.jpg}`);
    await sharp(fileBuffer.buffer).toFormat('jpg').toFile(pathToFile);
    return { success: true, data: fileName };
  }
}
export { File };
