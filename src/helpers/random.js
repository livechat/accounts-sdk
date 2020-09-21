/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

function string(length) {
  const bytes = new Uint8Array(length);
  const result = [];
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';

  const cryptoObj = window.crypto || window.msCrypto;
  if (!cryptoObj) {
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }

  const random = cryptoObj.getRandomValues(bytes);

  for (let a = 0; a < random.length; a++) {
    result.push(charset[random[a] % charset.length]);
  }

  return result.join('');
}

export default {
  string: string,
};
