/**
 * Structured error returned by the LiveChat accounts server when
 * authorization fails. At least one of `oauth_exception` or
 * `identity_exception` will be set.
 */
export type AuthError = {
  /** OAuth2 error code (e.g. `'invalid_request'`, `'access_denied'`). */
  oauth_exception?: string;
  /** LiveChat identity error code (e.g. `'unauthorized'`). */
  identity_exception?: string;
  /** Human-readable explanation of the error. */
  description?: string;
};
