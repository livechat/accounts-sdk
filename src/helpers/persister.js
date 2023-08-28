/* eslint-disable require-jsdoc */

/** @fileOverview
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

/* internal file */
import Storage from './storage';

export default class Persister {
  constructor(options, type) {
    this.options = {
      namespace: options.transaction.namespace + type,
    };
    this.storage = new Storage(this.options);
  }

  set(state, data) {
    this.storage.setItem(this.options.namespace + state, data, {
      expires: 1 / 48,
    });
  }

  get(state) {
    const data = this.storage.getItem(this.options.namespace + state);
    this.clear(state);
    return data || {};
  }

  clear(state) {
    this.storage.removeItem(this.options.namespace + state);
  }
}
