var crypto = require('crypto');

function digestMessage(message, algo = 'sha256', encoding = 'hex') {
  const buff = Buffer.from(message);
  const sha256Hex = crypto.createHash(algo).update(buff).digest(encoding);
  return sha256Hex;
}

exports.module = digestMessage;
