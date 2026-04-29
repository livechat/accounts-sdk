/**
 * Encode a string as base64url (RFC 4648 §5).
 */
function base64URLEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default {
  base64URLEncode,
};
