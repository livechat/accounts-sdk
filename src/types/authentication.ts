/**
 * Contract describing the subset of `AccountsSDK` that the `Popup` class depends on.
 *
 * Kept as `interface` to communicate that this is a protocol `AccountsSDK`
 * must satisfy. Using a structural interface (rather than importing `AccountsSDK`
 * directly) breaks the circular dependency and makes `Popup` independently
 * testable with any object that satisfies this contract.
 */
export interface PopupSDK {
  authorizeURL(options: Partial<PopupOptions>, flow: string): string;
}

/**
 * Options relevant to the popup authorization flow.
 * A narrowed projection of `SDKOptions` containing only the fields
 * that `Popup` reads. The full `SDKOptions` object (merged with defaults)
 * satisfies this type and is passed in by `AccountsSDK.popup()`.
 */
export type PopupOptions = {
  /** Base URL of the accounts server, used for postMessage origin validation. */
  server_url?: string;
  organization_id?: string;
  prompt?: string;
};

/**
 * Contract describing the subset of `AccountsSDK` that the `Iframe` class depends on.
 * @see {@link PopupSDK} for the same pattern applied to the popup flow.
 */
export interface IframeSDK {
  authorizeURL(options: IframeOptions, flow: string): string;
}

/**
 * Options relevant to the iframe authorization flow.
 * A narrowed projection of `SDKOptions` containing only the fields
 * that `Iframe` reads.
 */
export type IframeOptions = {
  /** Used to build the unique iframe element ID via `client_id + response_type`. */
  client_id?: string;
  response_type?: string;
  /** Base URL of the accounts server, used for postMessage origin validation. */
  server_url?: string;
  organization_id?: string;
  email_hint?: string | null;
};

/**
 * Structural interface for the redirect-URI params persister dependency of `Redirect`.
 * Any object that implements `retrieve` satisfies this contract, enabling
 * isolated testing of the `Redirect` class without `RedirectUriParamsPersister`.
 */
export interface RedirectUriParamsPersisterLike {
  retrieve(state: string): void;
}

/**
 * Contract describing the subset of `AccountsSDK` that the `Redirect` class depends on.
 * @see {@link PopupSDK} for the same pattern applied to the popup flow.
 */
export interface RedirectSDK {
  authorizeURL(options: Partial<RedirectOptions>): string;
  /** Used to restore query/hash params to `window.location` after the callback. */
  redirectUriParamsPersister: RedirectUriParamsPersisterLike;
}

/**
 * Options relevant to the redirect authorization flow.
 * A narrowed projection of `SDKOptions` containing only the fields
 * that `Redirect` reads when parsing the callback URL.
 */
export type RedirectOptions = {
  /** Determines which part of the callback URL to parse: hash (`'token'`) or query (`'code'`). */
  response_type?: string;
  scope?: string | null;
};
