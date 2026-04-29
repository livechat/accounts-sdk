/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

/**
 * A dummy storage mechanism that does not persist data.
 * Used as a last-resort fallback when no real storage is available.
 */
export default class DummyStorage {
  getItem(_key: string): null {
    return null;
  }

  removeItem(_key: string): void {}

  setItem(_key: string, _value: string, _options?: Record<string, unknown>): void {}
}
