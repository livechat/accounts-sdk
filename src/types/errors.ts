/**
 * Structured error returned by the LiveChat accounts server in OAuth callback
 * postMessages (popup and iframe flows). At least one of `oauth_exception` or
 * `identity_exception` will be set.
 *
 * This type describes the LiveChat-specific OAuth callback error format, which
 * differs from the REST API `ErrorDefault` schema (`error` / `error_description`).
 *
 * Known `oauth_exception` values (from the accounts API):
 * `'invalid_request'`, `'unauthorized_client'`, `'access_denied'`,
 * `'unsupported_response_type'`, `'invalid_scope'`, `'invalid_grant'`,
 * `'invalid_client'`, `'unsupported_grant_type'`.
 *
 * Known `identity_exception` values: `'unauthorized'`.
 */
export type AuthError = {
  /** OAuth2 error code (e.g. `'invalid_request'`, `'access_denied'`). */
  oauth_exception?: string;
  /** LiveChat identity error code (e.g. `'unauthorized'`). */
  identity_exception?: string;
  /** Human-readable explanation of the error. */
  description?: string;
};
