/**
 * Response received after a successful OAuth2 implicit (token) flow authorization.
 * Returned when `response_type` is `'token'`.
 */
export type TokenFlowResponse = {
  /** Short-lived OAuth2 bearer token to use in API calls. */
  access_token: string;
  /** Token type returned by the server; `'Bearer'` for standard OAuth2 access tokens. */
  token_type: string;
  /** Token lifetime in seconds. */
  expires_in?: number;
  /** Space-separated list of granted scopes. */
  scope?: string;
  /**
   * The `state` value that was passed to the authorization request.
   * Used to match the response to the initiating request.
   */
  state?: string;
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
