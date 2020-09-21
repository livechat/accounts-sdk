// eslint-disable-next-line require-jsdoc
function base64URLEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

module.exports = {
  base64URLEncode: base64URLEncode,
};
