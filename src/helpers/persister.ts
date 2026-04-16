/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import Storage from './storage';
import {type PersisterOptions, type PersisterConfig} from '../types/persister';

export default class Persister {
  options: PersisterConfig;
  storage: Storage;

  constructor(options: PersisterOptions, type: string) {
    this.options = {
      namespace: options.transaction.namespace + type,
    };
    // Storage is created with empty options — Persister always uses CookieStorage.
    this.storage = new Storage({});
  }

  set<T>(state: string, data: T): void {
    this.storage.setItem<T>(this.options.namespace + state, data, {expires: 1 / 48});
  }

  get<T>(state: string): T {
    const data = this.storage.getItem<T>(this.options.namespace + state);
    this.clear(state);
    return (data || {}) as T;
  }

  clear(state: string): void {
    this.storage.removeItem(this.options.namespace + state);
  }
}
