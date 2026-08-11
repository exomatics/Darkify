import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import multer from 'multer';
import sharp from 'sharp';

import { PATH_TO_AUDIO, PATH_TO_IMAGES } from '../../config/config.ts';
import { errorMessages } from '../../errors/error-messages.ts';
import ValidationError from '../../errors/validation-error.ts';

import type {
  AllowedAudioExtensions,
  AllowedAudioMimetypes,
} from '../../interfaces/track-interface.ts';
import type { PostTrackRequest } from '../../routes/track-route.ts';
import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { FileFilterCallback, StorageEngine } from 'multer';

class TrackAndCoverStorage implements StorageEngine {
  private memoryStorage: StorageEngine;
  private trackDiskStorage: StorageEngine;
  constructor() {
    this.memoryStorage = multer.memoryStorage();
    this.trackDiskStorage = multer.diskStorage({
      destination(
        request: Request<ParamsDictionary, unknown, unknown, unknown, Record<string, unknown>> & {
          audioExtension?: AllowedAudioExtensions;
        },
        file,
        callback,
      ) {
        callback(null, PATH_TO_AUDIO);
      },
      filename(request: PostTrackRequest, file, callback) {
        const trackId = crypto.randomUUID();
        request.trackId = trackId;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        callback(null, trackId + request.audioExtension!);
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
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/webp'
      ) {
        callback(null, true);
      } else {
        callback(new ValidationError(errorMessages.fileUpload.ExtensionNotSupported));
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
    return fileName;
  }
  uploadTrackOrCoverMiddleware = multer({
    storage: new TrackAndCoverStorage(),
    fileFilter: (request: Request & { audioExtension: string }, file, callback) => {
      const mimetypesToExtensions = {
        'audio/mpeg': '.mp3',
        'audio/flac': '.flac',
        'audio/x-flac': '.flac',
        'audio/wav': '.wav',
        'audio/ogg': '.ogg',
        'audio/mp4': '.m4a',
      };

      if (file.fieldname === 'cover') {
        if (
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/gif' ||
          file.mimetype === 'image/webp'
        ) {
          callback(null, true);
        } else {
          callback(new ValidationError(errorMessages.fileUpload.ExtensionNotSupported));
        }
      } else if (file.fieldname === 'track') {
        if (mimetypesToExtensions[file.mimetype as AllowedAudioMimetypes]) {
          request.audioExtension = mimetypesToExtensions[file.mimetype as AllowedAudioMimetypes];
          callback(null, true);
        } else {
          callback(new ValidationError(errorMessages.fileUpload.ExtensionNotSupported));
        }
      } else {
        callback(new ValidationError(errorMessages.fileUpload.UnexpectedField));
      }
    },
    limits: {
      fileSize: 1000 * 1000 * 100,
    },
  });
}
export { FileUploader };
