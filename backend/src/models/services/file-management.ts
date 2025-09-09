import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import multer from 'multer';
import sharp from 'sharp';

import { PATH_TO_AUDIO, PATH_TO_IMAGES } from '../../config/config.ts';
import ValidationError from '../../errors/validation-error.ts';

import type { PostTrackRequest } from '../../routes/track-route.ts';
import type { Request } from 'express';
import type { FileFilterCallback, StorageEngine } from 'multer';
class TrackAndCoverStorage implements StorageEngine {
  private memoryStorage: StorageEngine;
  private trackDiskStorage: StorageEngine;
  constructor() {
    this.memoryStorage = multer.memoryStorage();
    this.trackDiskStorage = multer.diskStorage({
      destination(request, file, callback) {
        callback(null, PATH_TO_AUDIO);
      },
      filename(request: PostTrackRequest, file, callback) {
        const trackId = crypto.randomUUID();
        request.trackId = trackId;
        callback(null, `${trackId}.mp3`);
      },
    });
  }
  _handleFile(
    request: Request,
    file: Express.Multer.File,
    callback: (error?: unknown, info?: Partial<Express.Multer.File>) => void,
  ) {
    if (file.fieldname === 'cover') {
      this.memoryStorage._handleFile(request, file, callback);
    }
    if (file.fieldname === 'track') {
      this.trackDiskStorage._handleFile(request, file, callback);
    }
  }
  _removeFile(
    request: Request,
    file: Express.Multer.File,
    callback: (error: Error | null) => void,
  ) {
    if (file.fieldname === 'cover') {
      this.memoryStorage._removeFile(request, file, callback);
    } else if (file.fieldname === 'track') {
      this.trackDiskStorage._removeFile(request, file, callback);
    } else {
      callback(null);
    }
  }
}

class FileUploader {
  static init() {
    if (!fs.existsSync(PATH_TO_IMAGES)) {
      fs.mkdirSync(PATH_TO_IMAGES, { recursive: true });
    }
    if (!fs.existsSync(PATH_TO_AUDIO)) {
      fs.mkdirSync(PATH_TO_AUDIO, { recursive: true });
    }
  }
  uploadImageMiddleware = multer({
    storage: multer.memoryStorage(),
    fileFilter(request: Request, file, callback: FileFilterCallback) {
      if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        callback(null, true);
      } else {
        const fileValidationError = 'file is not an png or jpeg image';
        callback(new ValidationError(fileValidationError));
      }
    },
    limits: {
      fileSize: 1000 * 1000 * 100,
    },
  });
  async uploadImage(file: Express.Multer.File) {
    const fileName = crypto.randomUUID();
    const pathToFile = path.join(PATH_TO_IMAGES, `${fileName}.jpg`);
    await sharp(file.buffer).toFormat('jpg').toFile(pathToFile);
    return { success: true, data: fileName };
  }
  uploadTrackMiddleware = multer({
    storage: multer.diskStorage({
      destination(request, file, callback) {
        callback(null, PATH_TO_AUDIO);
      },
      filename(request: PostTrackRequest, file, callback) {
        const trackId = crypto.randomUUID();
        request.trackId = trackId;
        callback(null, `${trackId}.mp3`);
      },
    }),
    fileFilter(request: Request, file, callback: FileFilterCallback) {
      if (file.mimetype === 'audio/mpeg') {
        callback(null, true);
      } else {
        const fileValidationError = 'file is not a mpeg';
        callback(new ValidationError(fileValidationError));
      }
    },
    limits: {
      fileSize: 1000 * 1000 * 100,
    },
  });
  uploadTrackOrCoverMiddleware = multer({
    storage: new TrackAndCoverStorage(),
    fileFilter: (_request, file, callback) => {
      if (file.fieldname === 'cover') {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
          callback(null, true);
        } else {
          callback(new ValidationError('file is not a png or jpeg image'));
        }
      } else if (file.fieldname === 'track') {
        if (file.mimetype === 'audio/mpeg') {
          callback(null, true);
        } else {
          callback(new ValidationError('file is not a mpeg'));
        }
      } else {
        callback(new ValidationError('Unexpected field'));
      }
    },
    limits: {
      fileSize: 1000 * 1000 * 100,
    },
  });
}
export { FileUploader };
