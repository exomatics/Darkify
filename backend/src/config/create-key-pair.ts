import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { PRIVATE_KEY_FILE_NAME, PUBLIC_KEY_FILE_NAME } from './config.ts';

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
  try {
    fs.writeFileSync(path.join('./', `${PUBLIC_KEY_FILE_NAME}.pem`), keyPair.publicKey);

    fs.writeFileSync(path.join('./', `${PRIVATE_KEY_FILE_NAME}.pem`), keyPair.privateKey);
  } catch {
    throw new Error('Error occured while generating key pair');
  }
}

genKeyPair();
