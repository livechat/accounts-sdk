import {type TransactionOptions} from './sdk';

/**
 * Resolved transaction configuration with `namespace` guaranteed to be set.
 */
export type TransactionConfig = TransactionOptions & { namespace: string };

/**
 * SDK options slice that includes transaction configuration.
 */
export type TransactionSDKOptions = {
  transaction: TransactionConfig;
};

/**
 * Parameters for initiating an authorization transaction.
 */
export type TransactionParams = {
  /** The `state` value sent in the authorization request. */
  state: string;
  /** PKCE code verifier (code flow only). */
  code_verifier?: string;
};

/**
 * Authorization transaction data returned during the callback.
 * All fields are optional — the transaction may have expired or not been found.
 */
export type TransactionData = {
  /** The `state` from the authorization request. */
  state?: string;
  /** PKCE code verifier, present only for code flow. */
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
