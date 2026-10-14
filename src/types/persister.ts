import qs from 'qs';

/**
 * Configuration for a persister instance.
 */
export type PersisterConfig = {
  namespace: string;
};

/**
 * Options required by persister classes.
 */
export type PersisterOptions = {
  transaction: PersisterConfig;
};

/**
 * Parameters for persisting redirect URI params before an authorization redirect.
 */
export type PersistParams = {
  /** The redirect URI whose query and hash params should be persisted. */
  redirect_uri: string;
  /** The authorization `state` value, used as the storage key. */
  state: string;
};

/**
 * Persisted query and hash params from a redirect URI, restored to
 * `window.location` after authorization completes.
 */
export type RedirectUriParamsData = {
  /** Query string params from the redirect URI. */
  query_params?: qs.ParsedQs;
  /** Hash fragment params from the redirect URI. */
  hash_params?: qs.ParsedQs;
};
