/**
 * Configuration for the PKCE (Proof Key for Code Exchange) extension.
 * Only relevant when `response_type` is `'code'`. PKCE protects the
 * authorization code flow against interception attacks.
 */
export type PKCEOptions = {
  /** Enable PKCE. Defaults to `true` when `response_type` is `'code'`. */
  enabled?: boolean;
  /**
   * Provide a custom code verifier instead of letting the SDK generate one.
   * Must be a high-entropy random string between 43 and 128 characters.
   */
  code_verifier?: string;
  /** Length of the auto-generated code verifier. Defaults to `128`. */
  code_verifier_length?: number;
  /**
   * Hash method used to derive the code challenge from the verifier.
   * `'S256'` (SHA-256, recommended) or `'plain'`.
   */
  code_challenge_method?: string;
  /** @deprecated Use `code_challenge_method` instead. */
  code_challange_method?: string;
};

/**
 * Configuration for the short-lived transaction storage used to carry
 * state and PKCE data across authorization redirects.
 */
export type TransactionOptions = {
  /**
   * Key prefix for storage entries.
   * Defaults to `'com.livechat.accounts'`.
   */
  namespace?: string;
  /** Length of the auto-generated `state` string. Defaults to `32`. */
  key_length?: number;
  /**
   * Force localStorage instead of cookies.
   * Useful in environments where cookies are restricted.
   */
  force_local_storage?: boolean;
};

/**
 * UTM tracking parameters appended to every authorization URL so that
 * traffic to the accounts server can be attributed in analytics.
 */
export type TrackingOptions = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

/**
 * Configuration passed to `new AccountsSDK(options)`.
 * Only `client_id` is required; all other fields have sensible defaults.
 */
export type SDKOptions = {
  /** OAuth2 client ID registered in the LiveChat Developer Console. */
  client_id: string;
  /** LiveChat organization ID, used for multi-organization setups. */
  organization_id?: string;
  /** OAuth2 `prompt` parameter (e.g. `'consent'`, `'select_account'`). */
  prompt?: string;
  /** OAuth2 response type: `'token'` (implicit) or `'code'` (PKCE). Defaults to `'token'`. */
  response_type?: 'token' | 'code';
  /**
   * Controls the popup window behavior.
   * `'auto'` (default) — opens a popup; `'manual'` — redirects to `/signin`.
   */
  popup_flow?: string;
  /** OAuth2 `state` parameter. Auto-generated if not provided. */
  state?: string;
  /**
   * When `true` (default), verifies that the `state` returned in the callback
   * matches the one sent in the request. Disabling is not recommended.
   */
  verify_state?: boolean;
  /**
   * When `true` (default), verifies that the callback URL contains expected
   * authorization data before resolving.
   */
  verify_callback?: boolean;
  /** OAuth2 scopes to request. `null` omits the parameter. */
  scope?: string | null;
  /** URL to redirect back to after authorization. Defaults to `window.location.href`. */
  redirect_uri?: string;
  /** Pre-fill the email field on the login page. `null` clears any hint. */
  email_hint?: string | null;
  /** Base URL of the LiveChat accounts server. Defaults to `'https://accounts.livechat.com'`. */
  server_url?: string;
  /** Path appended to `server_url` in the authorization URL (e.g. `'/signup'`). */
  path?: string;
  /** UTM tracking parameters added to the authorization URL. */
  tracking?: TrackingOptions;
  /** Transaction storage configuration. */
  transaction?: TransactionOptions;
  /** PKCE configuration for the authorization code flow. */
  pkce?: PKCEOptions;
};

/**
 * SDK options with all defaults applied. Not part of the public API.
 */
export type ResolvedOptions = SDKOptions & {
  organization_id: string;
  prompt: string;
  response_type: 'token' | 'code';
  popup_flow: string;
  state: string;
  verify_state: boolean;
  verify_callback: boolean;
  scope: string | null;
  redirect_uri: string;
  email_hint: string | null;
  server_url: string;
  tracking: TrackingOptions;
  transaction: Required<TransactionOptions>;
  pkce: PKCEOptions;
  flow?: string;
  email?: string;
  code_verifier?: string;
};
