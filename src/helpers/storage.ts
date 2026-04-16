/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import StorageHandler from './storage/handler';
import {type StorageHandlerOptions} from '../types/storage';
import Cookies from 'js-cookie';

/**
 * A wrapper around StorageHandler that handles JSON serialization/deserialization.
 */
export default class Storage {
  handler: StorageHandler;

  constructor(options: StorageHandlerOptions) {
    this.handler = new StorageHandler(options);
  }

  getItem<T>(key: string): T | null {
    const value = this.handler.getItem(key);
    try {
      return JSON.parse(value as string) as T | null;
    } catch {
      return value as unknown as T | null;
    }
  }

  removeItem(key: string): void {
    return this.handler.removeItem(key);
  }

  setItem<T>(key: string, value: T, options?: Cookies.CookieAttributes): void {
    const json = JSON.stringify(value);
    return this.handler.setItem(key, json, options);
  }
}
