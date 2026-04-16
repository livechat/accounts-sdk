import qs from 'qs';

/**
 * Internal configuration for `Persister` instances, holding the fully
 * resolved namespace string (i.e. `transaction.namespace + type`).
 */
export type PersisterConfig = {
  namespace: string;
};

/**
 * Minimal options slice required by `Persister` and its subclasses.
 * Only `transaction.namespace` is needed — the persister uses it to build
 * namespaced storage keys.
 *
 * **Relationship to `TransactionSDKOptions`:**
 * `TransactionSDKOptions.transaction` is a superset of this type (it also
 * carries `key_length` and `force_local_storage`). `PersisterOptions` is
 * intentionally narrower so that the `Persister` class depends only on
 * what it actually uses, following the interface segregation principle.
 */
export type PersisterOptions = {
  transaction: PersisterConfig;
};

/**
 * Parameters passed to `RedirectUriParamsPersister.persist()`.
 * Before a redirect-based authorization, query and hash params from
 * `redirect_uri` are extracted and stored, then restored after the callback.
 */
export type PersistParams = {
  /** The redirect URI whose query/hash params should be persisted. */
  redirect_uri: string;
  /** The authorization `state` value, used as the storage key. */
  state: string;
};

/**
 * The shape of data stored by `RedirectUriParamsPersister`.
 * Query and hash params are stripped from `redirect_uri` before the
 * authorization redirect and saved here, keyed by `state`. After the
 * callback, they are restored to `window.location` via `history.replaceState`.
 */
export type RedirectUriParamsData = {
  /** Parsed query string params from the original `redirect_uri`. */
  query_params?: qs.ParsedQs;
  /** Parsed hash fragment params from the original `redirect_uri`. */
  hash_params?: qs.ParsedQs;
};
