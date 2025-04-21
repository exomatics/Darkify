import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { errorMessages } from '../errors/error-messages.ts';

import { PATH_TO_KEYS, PRIVATE_KEY_FILE_NAME, PUBLIC_KEY_FILE_NAME } from './config.ts';
import logger from './logger.ts';
function genKeyPair() {
  const keyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
  if (
    fs.existsSync(path.join(PATH_TO_KEYS, PRIVATE_KEY_FILE_NAME)) &&
    fs.existsSync(path.join(PATH_TO_KEYS, PUBLIC_KEY_FILE_NAME))
  ) {
    logger.info(errorMessages.init.KeysAlreadyGenerated);
    return;
  }
  try {
    fs.writeFileSync(path.join(PATH_TO_KEYS, PUBLIC_KEY_FILE_NAME), keyPair.publicKey);
    fs.writeFileSync(path.join(PATH_TO_KEYS, PRIVATE_KEY_FILE_NAME), keyPair.privateKey);
  } catch (error: unknown) {
    throw new Error(
      `Error occurred while generating key pair: ${error instanceof Error ? error.message : ''}`,
    );
  }
}

if (!fs.existsSync(PATH_TO_KEYS)) {
  fs.mkdirSync(PATH_TO_KEYS, { recursive: true });
}

genKeyPair();
