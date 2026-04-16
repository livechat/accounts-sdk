/**
 * Structured error returned by the LiveChat accounts server.
 * Errors arrive via redirect query params or the postMessage channel,
 * and are enriched with a human-readable `description` by `errors.extend()`.
 *
 * At least one of `oauth_exception` or `identity_exception` will be set
 * when the authorization server rejects a request.
 */
export type AuthError = {
  /** OAuth2 error code (e.g. `'invalid_request'`, `'access_denied'`). */
  oauth_exception?: string;
  /** LiveChat identity error code (e.g. `'unauthorized'`). */
  identity_exception?: string;
  /** Human-readable explanation, filled in by `errors.extend()`. */
  description?: string;
};
