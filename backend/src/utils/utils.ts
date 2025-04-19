function decodeBase64Url(payload: string) {
  return Buffer.from(payload, 'base64').toString('ascii');
}

export { decodeBase64Url };
