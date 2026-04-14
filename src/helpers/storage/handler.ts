/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import DummyStorage from './dummy';
import CookieStorage from './cookie';
import Cookies from 'js-cookie';

export interface StorageHandlerOptions {
  force_local_storage?: boolean;
  [key: string]: unknown;
}

// Common interface for all storage backends.
interface StorageBackend {
  getItem(key: string): string | null | undefined;
  removeItem(key: string): void;
  setItem(key: string, value: string, options?: Cookies.CookieAttributes): void;
}

/**
 * Manages the underlying storage with failover: localStorage → CookieStorage → DummyStorage.
 */
export default class StorageHandler {
  storage: StorageBackend;

  constructor(options: StorageHandlerOptions) {
    this.storage = new CookieStorage();
    if (options.force_local_storage !== true) {
      return;
    }
    try {
      // some browsers throw an error when trying to access localStorage
      // when localStorage is disabled.
      const ls = window.localStorage;
      if (ls) {
        this.storage = ls as unknown as StorageBackend;
      }
    } catch (e) {
      console.warn(e);
      console.warn('Cant use localStorage. Using CookieStorage instead.');
    }
  }

  failover(): void {
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
  }

  getItem(key: string): string | null | undefined {
    try {
      return this.storage.getItem(key);
    } catch (e) {
      console.warn(e);
      this.failover();
      return this.getItem(key);
    }
  }

  removeItem(key: string): void {
    try {
      return this.storage.removeItem(key);
    } catch (e) {
      console.warn(e);
      this.failover();
      return this.removeItem(key);
    }
  }

  setItem(key: string, value: string, options?: Cookies.CookieAttributes): void {
    try {
      return this.storage.setItem(key, value, options);
    } catch (e) {
      console.warn(e);
      this.failover();
      return this.setItem(key, value, options);
    }
  }
}
