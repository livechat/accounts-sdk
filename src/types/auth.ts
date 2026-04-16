/**
 * Response shape for the OAuth2 implicit (token) flow.
 * Returned by `Redirect.authorizeData()` when `response_type` is `'token'`,
 * and delivered via the postMessage listener in popup and iframe flows.
 */
export type TokenFlowResponse = {
  /** Short-lived OAuth2 bearer token to use in API calls. */
  access_token: string;
  /** Always `'Bearer'`. */
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
 * Response shape for the OAuth2 authorization code flow.
 * Returned by `Redirect.authorizeData()` when `response_type` is `'code'`.
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
