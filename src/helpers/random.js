/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

function string(length) {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
  const charsetLength = charset.length;
  const cryptoObj = window.crypto || window.msCrypto;
  const hasCrypto = cryptoObj && typeof cryptoObj.getRandomValues === 'function';

  if (!hasCrypto) {
    return generateWithMathRandom(length, charset, charsetLength);
  }

  const maxByte = Math.floor(256 / charsetLength) * charsetLength;
  if (maxByte === 0) {
    return generateWithMathRandom(length, charset, charsetLength);
  }

  const result = [];

  while (result.length < length) {
    const remaining = length - result.length;
    const buffer = new Uint8Array(remaining);
    cryptoObj.getRandomValues(buffer);

    for (let i = 0; i < buffer.length && result.length < length; i++) {
      const value = buffer[i];
      // Skip values that would cause modulo bias.
      if (value >= maxByte) {
        continue;
      }
      result.push(charset.charAt(value % charsetLength));
    }
  }

  return result.join('');
}

function generateWithMathRandom(length, charset, charsetLength) {
  let output = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charsetLength);
    output += charset.charAt(index);
  }
  return output;
}

export default {
  string: string,
};
