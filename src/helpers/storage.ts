/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import StorageHandler, {type StorageHandlerOptions} from './storage/handler';
import Cookies from 'js-cookie';

/**
 * A wrapper around StorageHandler that handles JSON serialization/deserialization.
 */
export default class Storage {
  handler: StorageHandler;

  constructor(options: StorageHandlerOptions) {
    this.handler = new StorageHandler(options);
  }

  getItem(key: string): unknown {
    const value = this.handler.getItem(key);
    try {
      return JSON.parse(value as string);
    } catch {
      return value;
    }
  }

  removeItem(key: string): void {
    return this.handler.removeItem(key);
  }

  setItem(key: string, value: unknown, options?: Cookies.CookieAttributes): void {
    const json = JSON.stringify(value);
    return this.handler.setItem(key, json, options);
  }
}
