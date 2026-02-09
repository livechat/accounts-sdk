/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import StorageHandler from './storage/handler';

/**
 * A wrapper around the underlying storage mechanism that handles JSON serialization and deserialization.
 * @param {object} options Storage configuration options passed to the underlying StorageHandler.
 */
function Storage(options) {
  this.handler = new StorageHandler(options);
}

Storage.prototype.getItem = function (key) {
  const value = this.handler.getItem(key);
  try {
    return JSON.parse(value);
  } catch {
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
