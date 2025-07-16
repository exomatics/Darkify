import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import multer from 'multer';
import sharp from 'sharp';

import { PATH_TO_AUDIO, PATH_TO_IMAGES } from '../../config/config.ts';
import ValidationError from '../../errors/validation-error.ts';

import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

class FileUploader {
  static init() {
    if (!fs.existsSync(PATH_TO_IMAGES)) {
      fs.mkdirSync(PATH_TO_IMAGES, { recursive: true });
    }
  }
  async uploadImage(fileBuffer: Express.Multer.File) {
    const fileName = crypto.randomUUID();
    const pathToFile = path.join(PATH_TO_IMAGES, `${fileName}.jpg`);
    await sharp(fileBuffer.buffer).toFormat('jpg').toFile(pathToFile);
    return { success: true, data: fileName };
  }
  uploadTrackMiddleware = multer({
    storage: multer.diskStorage({
      destination(request, file, callback) {
        callback(null, PATH_TO_AUDIO);
      },
      filename(request, file, callback) {
        callback(null, crypto.randomUUID());
      },
    }),
    fileFilter(request: Request, file, callback: FileFilterCallback) {
      if (file.mimetype === 'audio/mp3') {
        callback(null, true);
      } else {
        const fileValidationError = 'file is not an mp3';
        callback(new ValidationError(fileValidationError));
      }
    },
    limits: {
      fileSize: 1000 * 1000 * 100,
    },
  });
}
export { FileUploader };
