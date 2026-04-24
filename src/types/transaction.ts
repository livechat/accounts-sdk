import {type TransactionOptions} from './sdk';

/**
 * Resolved configuration for the `Transaction` class, produced after the SDK
 * applies its defaults to the user-supplied {@link TransactionOptions} (from `sdk.ts`).
 *
 * **Relationship to `TransactionOptions`:**
 * `TransactionConfig` is derived from `TransactionOptions` by making `namespace`
 * required. All other fields remain optional. This expresses in the type system
 * that `TransactionConfig` is exactly `TransactionOptions` after a default for
 * `namespace` has been applied — safe for the `Transaction` class to use without
 * null-checks on `namespace`.
 */
export type TransactionConfig = TransactionOptions & { namespace: string };

/**
 * Structural interface that the `Transaction` constructor accepts.
 * Defined as an interface (rather than using `AccountsSDK` directly) so that
 * the `Transaction` class can be instantiated with any object that has a
 * `transaction` field, enabling isolated testing.
 */
export type TransactionSDKOptions = {
  transaction: TransactionConfig;
};

/**
 * Data written to storage when an authorization request is initiated.
 * Stored under the key `namespace + state` and retrieved in the callback
 * to verify the round-trip and recover the PKCE code verifier.
 *
 * **Relationship to `TransactionData`:**
 * `TransactionParams` is the **write** path — `state` is required because
 * it must be provided to generate the storage key.
 * `TransactionData` is the **read** path — all fields are optional because
 * storage may return an empty object if the entry expired or was not found.
 */
export type TransactionParams = {
  /** The `state` value sent in the authorization request. */
  state: string;
  /** PKCE code verifier to store alongside the state (code flow only). */
  code_verifier?: string;
};

/**
 * Data retrieved from storage during the authorization callback.
 * All fields are optional because the entry may have expired or never existed.
 */
export type TransactionData = {
  /** The `state` that was stored when the request was initiated. */
  state?: string;
  /** PKCE code verifier, present only for code flow transactions. */
  code_verifier?: string;
};

/**
 * Input passed to `AccountsSDK.verify()`.
 * Contains the `state` returned by the authorization server in the callback
 * URL, used to look up and validate the stored transaction.
 */
export type VerifyInput = {
  /** The `state` value returned from the authorization server callback. */
  state?: string;
};
