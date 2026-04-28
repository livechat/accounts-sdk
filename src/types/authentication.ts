/**
 * Minimal contract for the popup authorization flow.
 */
export type PopupSDK = {
  authorizeURL(options: Partial<PopupOptions>, flow: string): string;
};

/**
 * Options for the popup authorization flow.
 */
export type PopupOptions = {
  /** Base URL of the accounts server (e.g. `'https://accounts.livechat.com'`). */
  server_url?: string;
  organization_id?: string;
  prompt?: string;
};

/**
 * Minimal contract for the iframe authorization flow.
 */
export type IframeSDK = {
  authorizeURL(options: IframeOptions, flow: string): string;
};

/**
 * Options for the iframe authorization flow.
 */
export type IframeOptions = {
  /** OAuth2 client ID registered in the LiveChat Developer Console. */
  client_id?: string;
  response_type?: 'token' | 'code';
  /** Base URL of the accounts server (e.g. `'https://accounts.livechat.com'`). */
  server_url?: string;
  organization_id?: string;
  email_hint?: string | null;
};

/**
 * Custom redirect-URI params persister.
 * Implement this to provide your own mechanism for restoring query and hash
 * params to the redirect URI after authorization completes.
 */
export type RedirectUriParamsPersisterLike = {
  retrieve(state: string): void;
};

/**
 * Minimal contract for the redirect authorization flow.
 */
export type RedirectSDK = {
  authorizeURL(options: Partial<RedirectOptions>): string;
  /** Persister for redirect URI query and hash params. */
  redirectUriParamsPersister: RedirectUriParamsPersisterLike;
};

/**
 * Options for the redirect authorization flow.
 */
export type RedirectOptions = {
  /** Determines which part of the callback URL to parse: hash (`'token'`) or query (`'code'`). */
  response_type?: 'token' | 'code';
  scope?: string | null;
};
