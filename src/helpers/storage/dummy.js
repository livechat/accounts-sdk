/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

function DummyStorage() {}

DummyStorage.prototype.getItem = function () {
  return null;
};

DummyStorage.prototype.removeItem = function () {};

DummyStorage.prototype.setItem = function () {};

export default DummyStorage;
