/**
 * @param {Record<string, unknown>} object Source object to pick properties from.
 * @param {string[]} keys Keys to pick from the source object.
 * @returns {Record<string, unknown>} A new object containing only the picked keys.
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */
export function pick(object, keys) {
  return keys.reduce((prev, key) => {
    if (object[key]) {
      prev[key] = object[key];
    }
    return prev;
  }, {});
}
