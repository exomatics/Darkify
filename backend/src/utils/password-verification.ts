import crypto from 'node:crypto';

function verificatePassword(password: string, hash: string, salt: string) {
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10_000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

export default verificatePassword;
