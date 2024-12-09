import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

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

  fs.writeFileSync(path.join('./', 'id_rsa_pub.pem'), keyPair.publicKey);

  fs.writeFileSync(path.join('./', 'id_rsa_priv.pem'), keyPair.privateKey);
}

genKeyPair();
