/**
 * Response received after a successful OAuth2 implicit (token) flow authorization.
 * Returned when `response_type` is `'token'`.
 *
 * Fields beyond `access_token` and `token_type` are optional because the redirect
 * flow only captures URL fragment params, while popup/iframe flows receive the full
 * server response via `window.postMessage`.
 */
export type TokenFlowResponse = {
  /** Short-lived OAuth2 bearer token to use in API calls. */
  access_token: string;
  /** Token type returned by the server; `'Bearer'` for standard OAuth2 access tokens. */
  token_type: string;
  /** Token lifetime in seconds. */
  expires_in?: number;
  /** List of granted scopes. */
  scope?: string;
  /**
   * The `state` value that was passed to the authorization request.
   * Used to match the response to the initiating request.
   */
  state?: string;
  /** Refresh token that can be used to obtain a new access token. `null` when not issued. */
  refresh_token?: string | null;
  /** UUID of the authenticated account. */
  account_id?: string;
  /** UUID of the organization the token belongs to. */
  organization_id?: string;
  /** OAuth2 client ID of the application that requested the token. */
  client_id?: string;
};

/**
 * Response received after a successful OAuth2 authorization code flow.
 * Returned when `response_type` is `'code'`.
 * The `code` must be exchanged server-side for tokens.
 */
export type CodeFlowResponse = {
  /** Single-use authorization code to exchange for tokens on the server. */
  code: string;
  /**
   * The `state` value that was passed to the authorization request.
   * Used to match the response to the initiating request.
   */
  state?: string;
};

/**
 * Union of all possible successful authorization responses.
 * Which variant is returned depends on the `response_type` SDK option:
 * - `'token'` → {@link TokenFlowResponse}
 * - `'code'`  → {@link CodeFlowResponse}
 */
export type AuthorizeResponse = TokenFlowResponse | CodeFlowResponse;
