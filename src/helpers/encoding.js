// eslint-disable-next-line require-jsdoc
function base64URLEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default {
  base64URLEncode: base64URLEncode,
};
