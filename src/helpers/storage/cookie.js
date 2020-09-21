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
    },
    options
  );
  Cookie.set(key, value, params);
};

export default CookieStorage;
