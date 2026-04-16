/**
 * @author Auth0 https://github.com/auth0/auth0.js
 * @license MIT
 */
export function pick<T extends object, K extends PropertyKey>(
  object: T,
  keys: K[],
): Pick<T, Extract<K, keyof T>> {
  return keys.reduce<Partial<T>>((prev, key) => {
    const val = (object as Record<PropertyKey, unknown>)[key];
    if (val) {
      (prev as Record<PropertyKey, unknown>)[key] = val;
    }
    return prev;
  }, {}) as Pick<T, Extract<K, keyof T>>;
}
