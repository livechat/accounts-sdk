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
 * Configuration for the state/PKCE transaction storage used across
 * authorization redirects. The SDK stores a short-lived entry keyed by
 * `namespace + state` so it can verify the callback and retrieve the
 * code verifier after the redirect.
 * @see `TransactionConfig` in `types/transaction.ts` for the resolved (defaults-applied) counterpart
 * used internally by the `Transaction` class.
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
 * User-facing configuration passed to `new AccountsSDK(options)`.
 * Only `client_id` is required; all other fields have sensible defaults.
 *
 * After construction, the SDK merges these options with its defaults to
 * produce a {@link ResolvedOptions} object that is used internally. You
 * never interact with `ResolvedOptions` directly.
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
  /** Space-separated OAuth2 scopes to request. `null` omits the parameter. */
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
 * Internal representation of SDK options after merging user-supplied
 * {@link SDKOptions} with the built-in defaults in the `AccountsSDK` constructor.
 *
 * **Relationship to `SDKOptions`:**
 * `ResolvedOptions` extends `SDKOptions` and narrows every optional field to
 * required, guaranteeing that downstream code never has to deal with `undefined`.
 * It also adds three internal fields (`flow`, `email`, `code_verifier`) that are
 * only populated during an authorization URL build and are never exposed to callers.
 *
 * This type is internal to the SDK and is not part of the public API.
 *
 * Kept as `interface extends` (rather than a type intersection) so that the
 * narrowing of optional → required fields is expressed clearly through inheritance.
 */
export interface ResolvedOptions extends SDKOptions {
  client_id: string;
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
  /** All transaction fields are required after defaults are applied. */
  transaction: Required<TransactionOptions>;
  pkce: PKCEOptions;
  key_length: number;
  /** Authorization flow identifier appended to the URL (e.g. `'button'` for popup/iframe). */
  flow?: string;
  /** Resolved value of `email_hint`, passed as the `email` query param. */
  email?: string;
  /** PKCE code verifier, present during URL generation but stripped before the redirect. */
  code_verifier?: string;
}
