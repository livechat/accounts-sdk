import Popup from './authentication/popup';
import Redirect from './authentication/redirect';
import Iframe from './authentication/iframe';
import Transaction, {type TransactionParams} from './authentication/transaction';
import qs from 'qs';
import sjcl from './vendor/sjcl';
import {pick} from './helpers/object';
import encoding from './helpers/encoding';
import RedirectUriParamsPersister from './helpers/persisters/redirectUriParams';
import random from './helpers/random';

export interface PKCEOptions {
  enabled?: boolean;
  code_verifier?: string;
  code_verifier_length?: number;
  code_challenge_method?: string;
  /** @deprecated Use `code_challenge_method` instead. */
  code_challange_method?: string;
}

export interface TransactionOptions {
  namespace?: string;
  key_length?: number;
  force_local_storage?: boolean;
}

export interface TrackingOptions {
  utm_source?: string;
  utm_medium?: string;
  [key: string]: string | undefined;
}

export interface SDKOptions {
  client_id: string;
  organization_id?: string;
  prompt?: string;
  response_type?: string;
  popup_flow?: string;
  state?: string;
  verify_state?: boolean;
  verify_callback?: boolean;
  scope?: string | null;
  redirect_uri?: string;
  email_hint?: string | null;
  server_url?: string;
  path?: string;
  tracking?: TrackingOptions;
  transaction?: TransactionOptions;
  pkce?: PKCEOptions;
  [key: string]: unknown;
}

interface ResolvedOptions extends SDKOptions {
  client_id: string;
  organization_id: string;
  prompt: string;
  response_type: string;
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
  key_length: number;
}

/**
 * Normalize PKCE options, support deprecated code_challange_method option.
 */
function normalizePkce(pkce: PKCEOptions | undefined): PKCEOptions | undefined {
  if (!pkce || pkce.code_challange_method === undefined) {
    return pkce;
  }
  const normalized = Object.assign({}, pkce);
  // eslint-disable-next-line max-len
  console.warn('[accounts-sdk] pkce.code_challange_method is deprecated and will be removed in v3.0.0. Use code_challenge_method instead.');
  if (normalized.code_challenge_method === undefined) {
    normalized.code_challenge_method = normalized.code_challange_method;
  }
  delete normalized.code_challange_method;
  return normalized;
}

/**
 * Accounts SDK main class for "Sign in with LiveChat".
 */
export default class AccountsSDK {
  options: ResolvedOptions;
  transaction: Transaction;
  redirectUriParamsPersister: RedirectUriParamsPersister;

  constructor(options: SDKOptions) {
    if (options?.client_id == null) {
      throw new Error('client id not provided');
    }

    const defaultOptions: Omit<ResolvedOptions, 'client_id'> = {
      organization_id: '',
      prompt: '',
      response_type: 'token',
      popup_flow: 'auto',
      state: '',
      verify_state: true,
      verify_callback: true,
      scope: null,
      redirect_uri: '',
      email_hint: null,
      server_url: 'https://accounts.livechat.com',
      tracking: {
        utm_source: 'accounts.livechat.com',
        utm_medium: 'accounts-sdk',
      },
      transaction: {
        namespace: 'com.livechat.accounts',
        key_length: 32,
        force_local_storage: false,
      },
      pkce: {
        enabled: true,
        code_verifier_length: 128,
        code_challenge_method: 'S256',
      },
      key_length: 32,
    };

    this.options = Object.assign({}, defaultOptions, options) as ResolvedOptions;
    this.options.pkce = normalizePkce(this.options.pkce) as PKCEOptions;
    this.transaction = new Transaction(this.options);
    this.redirectUriParamsPersister = new RedirectUriParamsPersister(this.options);
  }

  /**
   * Use iframe for authorization. Not recommended due to ITP 2.0.
   */
  iframe(options: Partial<SDKOptions> = {}): Iframe {
    const localOptions = Object.assign({}, this.options, options);
    return new Iframe(this, localOptions);
  }

  /**
   * Use popup for authorization. Must be called inside a click handler.
   */
  popup(options: Partial<SDKOptions> = {}): Popup {
    const localOptions = Object.assign({}, this.options, options);
    return new Popup(this, localOptions);
  }

  /**
   * Use redirect for authorization.
   */
  redirect(options: Partial<SDKOptions> = {}): Redirect {
    const localOptions = Object.assign({}, this.options, options);
    return new Redirect(this, localOptions);
  }

  /**
   * Generate an authorization URL.
   * @param options - Options to override SDK defaults.
   * @param flow - Set to `'button'` for popup and iframe flows.
   */
  authorizeURL(options: Record<string, unknown> = {}, flow = ''): string {
    const localOptions: ResolvedOptions = Object.assign({}, this.options, options);
    localOptions.pkce = normalizePkce(localOptions.pkce) as PKCEOptions;

    if (!localOptions.state) {
      localOptions.state = random.string(localOptions.transaction.key_length);
    }

    if (!localOptions.redirect_uri) {
      localOptions.redirect_uri = window.location.href;
    }

    const params: Record<string, unknown> = pick(localOptions, [
      'client_id',
      'organization_id',
      'redirect_uri',
      'state',
      'response_type',
      'scope',
      'prompt',
    ]);

    Object.assign(params, localOptions.tracking);

    if (params.scope === null) {
      delete params.scope;
    }

    if (flow != null) {
      params.flow = flow;
    }

    if (localOptions.email_hint) {
      params.email = localOptions.email_hint;
    }

    let url = localOptions.server_url;
    if (localOptions.popup_flow === 'manual') {
      url += '/signin';
    }

    if (localOptions.path) {
      url += localOptions.path;
    }

    if (localOptions.response_type === 'code' && localOptions.pkce?.enabled) {
      const codeVerifier =
        localOptions.pkce.code_verifier ||
        random.string(localOptions.pkce.code_verifier_length ?? 128);

      switch (localOptions.pkce.code_challenge_method) {
        case 'S256': {
          const hashBits = sjcl.hash.sha256.hash(codeVerifier);
          const hashBytes = hashBits.reduce((s, w) =>
            s + String.fromCharCode((w >>> 24) & 0xff, (w >>> 16) & 0xff, (w >>> 8) & 0xff, w & 0xff), '');
          Object.assign(params, {
            code_verifier: codeVerifier,
            code_challenge: encoding.base64URLEncode(hashBytes),
            code_challenge_method: localOptions.pkce.code_challenge_method,
          });
          break;
        }

        default:
          Object.assign(params, {
            code_verifier: codeVerifier,
            code_challenge: codeVerifier,
            code_challenge_method: localOptions.pkce.code_challenge_method,
          });
      }
    }

    this.transaction.generate(params as TransactionParams);
    this.redirectUriParamsPersister.persist(params as {state: string; redirect_uri: string});

    delete params.code_verifier;

    return url + '?' + qs.stringify(params);
  }

  /**
   * Verify if redirect transaction params are valid.
   * @param authorizeData - Authorize data to validate.
   * @returns Transaction state if valid, null otherwise.
   */
  verify(authorizeData: {state?: string}): {state?: string; code_verifier?: string} | null {
    const transactionData = this.transaction.get(authorizeData.state ?? '');

    if (authorizeData.state && this.options.verify_state) {
      if (transactionData.state != authorizeData.state) {
        return null;
      }
    }

    return transactionData;
  }
}
