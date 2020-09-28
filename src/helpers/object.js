/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

export function pick(object, keys) {
  return keys.reduce((prev, key) => {
    if (object[key]) {
      prev[key] = object[key];
    }
    return prev;
  }, {});
}
