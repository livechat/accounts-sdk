/**
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */
export function pick(object: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return keys.reduce<Record<string, unknown>>((prev, key) => {
    if (object[key]) {
      prev[key] = object[key];
    }
    return prev;
  }, {});
}
