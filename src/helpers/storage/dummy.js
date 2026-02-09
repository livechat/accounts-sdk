/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

/**
 * A dummy storage mechanism that does not persist data.
 * It provides methods to get, set, and remove items, but they do not perform any actual storage operations.
 * This can be used as a fallback when no other storage mechanism is available.
 */
function DummyStorage() {}

DummyStorage.prototype.getItem = function () {
  return null;
};

DummyStorage.prototype.removeItem = function () {};

DummyStorage.prototype.setItem = function () {};

export default DummyStorage;
