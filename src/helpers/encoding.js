/**
 * Encode a string as base64url (RFC 4648 §5).
 * @param {string} str - The string to encode.
 * @returns {string} The base64url-encoded string.
 */
function base64URLEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default {
  base64URLEncode: base64URLEncode,
};
