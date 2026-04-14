/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

/**
 * Generates a random string using `Math.random()` as a fallback when the Web Crypto API is unavailable.
 */
function generateWithMathRandom(length: number, charset: string, charsetLength: number): string {
  let output = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charsetLength);
    output += charset.charAt(index);
  }
  return output;
}

/**
 * Generates a cryptographically-secure random string of the specified length.
 * Falls back to Math.random when the Web Crypto API is unavailable.
 */
function string(length: number): string {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
  const charsetLength = charset.length;
  // Cast to allow undefined in environments where window.crypto is overridden (e.g. tests).
  const cryptoObj = window.crypto as Crypto | undefined;
  const hasCrypto =
    cryptoObj && typeof cryptoObj.getRandomValues === 'function';

  if (!hasCrypto) {
    return generateWithMathRandom(length, charset, charsetLength);
  }

  const maxByte = Math.floor(256 / charsetLength) * charsetLength;
  if (maxByte === 0) {
    return generateWithMathRandom(length, charset, charsetLength);
  }

  const result: string[] = [];

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

export default {
  string,
};
