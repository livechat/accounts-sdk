/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import Cookie from 'js-cookie';
function CookieStorage() {}

CookieStorage.prototype.getItem = function (key) {
  return Cookie.get(key);
};

CookieStorage.prototype.removeItem = function (key) {
  Cookie.remove(key);
};

CookieStorage.prototype.setItem = function (key, value, options) {
  const params = Object.assign(
    {
      expires: 1, // 1 day

      // After august 2020 chrome changed iframe cookie policy and without
      // those parameters cookies wont we stored properly if document is inside iframe.
      SameSite: 'none',
      Secure: true,
    },
    options
  );
  Cookie.set(key, value, params);
};

export default CookieStorage;
