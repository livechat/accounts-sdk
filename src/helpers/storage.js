/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import StorageHandler from './storage/handler';

function Storage(options) {
  this.handler = new StorageHandler(options);
}

Storage.prototype.getItem = function (key) {
  const value = this.handler.getItem(key);
  try {
    return JSON.parse(value);
  } catch (_) {
    return value;
  }
};

Storage.prototype.removeItem = function (key) {
  return this.handler.removeItem(key);
};

Storage.prototype.setItem = function (key, value, options) {
  const json = JSON.stringify(value);
  return this.handler.setItem(key, json, options);
};

export default Storage;
