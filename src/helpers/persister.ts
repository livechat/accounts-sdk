/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import Storage from './storage';

interface PersisterSDKOptions {
  transaction: {
    namespace: string;
  };
}

export default class Persister {
  options: {namespace: string};
  storage: Storage;

  constructor(options: PersisterSDKOptions, type: string) {
    this.options = {
      namespace: options.transaction.namespace + type,
    };
    // Storage is created with empty options — Persister always uses CookieStorage.
    this.storage = new Storage({});
  }

  set(state: string, data: unknown): void {
    this.storage.setItem(this.options.namespace + state, data, {expires: 1 / 48});
  }

  get(state: string): unknown {
    const data = this.storage.getItem(this.options.namespace + state);
    this.clear(state);
    return data || {};
  }

  clear(state: string): void {
    this.storage.removeItem(this.options.namespace + state);
  }
}
