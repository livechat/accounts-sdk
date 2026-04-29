/**
 * @file
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */

import Cookies from 'js-cookie';

/**
 * A storage mechanism that uses cookies to store data.
 */
export default class CookieStorage {
  getItem(key: string): string | undefined {
    return Cookies.get(key);
  }

  removeItem(key: string): void {
    Cookies.remove(key);
  }

  setItem(key: string, value: string, options?: Cookies.CookieAttributes): void {
    const params: Cookies.CookieAttributes = Object.assign(
      {
        expires: 1, // 1 day

        // After august 2020 chrome changed iframe cookie policy and without
        // those parameters cookies won't be stored properly if document is inside iframe.
        sameSite: 'none',
        secure: true,
      },
      options
    );
    Cookies.set(key, value, params);
  }
}
