import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { errorMessages } from '../errors/error-messages.ts';

import { PRIVATE_KEY_FILE_NAME, PUBLIC_KEY_FILE_NAME } from './config.ts';
import logger from './logger.ts';
const __dirname = import.meta.dirname;
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
    fs.existsSync(path.join(__dirname, `${PRIVATE_KEY_FILE_NAME}.pem`)) &&
    fs.existsSync(path.join(__dirname, `${PUBLIC_KEY_FILE_NAME}.pem`))
  ) {
    logger.info(errorMessages.init.KeysAlreadyGenerated);
    return;
  }
  try {
    fs.writeFileSync(path.join(__dirname, `${PUBLIC_KEY_FILE_NAME}.pem`), keyPair.publicKey);
    fs.writeFileSync(path.join(__dirname, `${PRIVATE_KEY_FILE_NAME}.pem`), keyPair.privateKey);
  } catch (error: unknown) {
    throw new Error(
      `Error occurred while generating key pair: ${error instanceof Error ? error.message : ''}`,
    );
  }
}

genKeyPair();
