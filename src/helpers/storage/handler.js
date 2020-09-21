/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import DummyStorage from './dummy';
import CookieStorage from './cookie';

function StorageHandler(options) {
  this.storage = new CookieStorage();
  if (options.force_local_storage !== true) {
    return;
  }
  try {
    // some browsers throw an error when trying to access localStorage
    // when localStorage is disabled.
    const localStorage = window.localStorage;
    if (localStorage) {
      this.storage = localStorage;
    }
  } catch (e) {
    console.warn(e);
    console.warn('Cant use localStorage. Using CookieStorage instead.');
  }
}

StorageHandler.prototype.failover = function () {
  if (this.storage instanceof DummyStorage) {
    console.warn('DummyStorage: ignore failover');
    return;
  } else if (this.storage instanceof CookieStorage) {
    console.warn('CookieStorage: failing over DummyStorage');
    this.storage = new DummyStorage();
  } else {
    console.warn('LocalStorage: failing over CookieStorage');
    this.storage = new CookieStorage();
  }
};

StorageHandler.prototype.getItem = function (key) {
  try {
    return this.storage.getItem(key);
  } catch (e) {
    console.warn(e);
    this.failover();
    return this.getItem(key);
  }
};

StorageHandler.prototype.removeItem = function (key) {
  try {
    return this.storage.removeItem(key);
  } catch (e) {
    console.warn(e);
    this.failover();
    return this.removeItem(key);
  }
};

StorageHandler.prototype.setItem = function (key, value, options) {
  try {
    return this.storage.setItem(key, value, options);
  } catch (e) {
    console.warn(e);
    this.failover();
    return this.setItem(key, value, options);
  }
};

export default StorageHandler;
