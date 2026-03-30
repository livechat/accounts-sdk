import Popup from './authentication/popup';
import Redirect from './authentication/redirect';
import Iframe from './authentication/iframe';
import Transaction from './authentication/transaction';
import qs from 'qs';
import sjcl from './vendor/sjcl';
import {pick} from './helpers/object';
import encoding from './helpers/encoding';
import RedirectUriParamsPersister from './helpers/persisters/redirectUriParams';
import random from './helpers/random';

/**
 * Normalize PKCE options, support deprecated code_challange_method option
 * @param {object|undefined} pkce PKCE options
 * @returns {object|undefined} normalized PKCE options
 */
function normalizePkce(pkce) {
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
 * Accounts SDK main class
 */
export default class AccountsSDK {
  /**
   * Accounts SDK constructor
   * @class
   * @param {object} options configuration options for AccountsSDK
   * @param {string} options.client_id registered client ID
   * @param {string} options.organization_id organization ID
   * @param {string} [options.prompt] use `consent` to force consent prompt in popup and redirect flows
   * @param {string} [options.response_type] OAuth response type, use `token` or `code` (default: `token`)
   * @param {string} [options.popup_flow] `auto` - close popup when not required, `manual` - always show popup (default: `auto`)
   * @param {string} [options.state] OAuth state param (default: empty string)
   * @param {boolean} [options.verify_state] check if state matches after redirect (default: `true`)
   * @param {string} [options.scope] request exact scopes - must be configured for a given client id (default: `null`)
   * @param {string} [options.redirect_uri] OAuth redirect uri - default current location (default: empty string)
   * @param {string} [options.email_hint] fill in email in forms (default: `null`)
   * @param {string} [options.server_url] authorization server url (default: `https://accounts.livechat.com`)
   * @param {string} [options.path] option to provide a path when loading accounts, for example '/signup' (default: empty string)
   * @param {object} [options.tracking] tracking querystring params
   * @param {object} [options.transaction] options for transaction manager
   * @param {string} [options.transaction.namespace] transaction keys prefix (default: `com.livechat.accounts`)
   * @param {number} [options.transaction.key_length] transaction random state length (default: `32`)
   * @param {boolean} [options.transaction.force_local_storage] try to use local storage instead of cookies (default: `false`)
   * @param {object} [options.pkce] PKCE configuration
   * @param {boolean} [options.pkce.enabled] Oauth 2.1 PKCE extension enabled (default: `true`)
   * @param {string} [options.pkce.code_verifier] override auto generated code verifier
   * @param {number} [options.pkce.code_verifier_length] code verifier length, between 43 and 128 characters
   *   https://tools.ietf.org/html/rfc7636#section-4.1 (default: `128`)
   * @param {string} [options.pkce.code_challenge_method] code challenge method, use `S256` or `plain` (default: `S256`)
   * @param {string} [options.pkce.code_challange_method] **Deprecated.** Use `code_challenge_method` instead.
   */
  constructor(options = {}) {
    if (options.client_id == null) {
      throw new Error('client id not provided');
    }

    const defaultOptions = {
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
    };

    this.options = Object.assign({}, defaultOptions, options);
    this.options.pkce = normalizePkce(this.options.pkce);
    this.transaction = new Transaction(this.options);
    this.redirectUriParamsPersister = new RedirectUriParamsPersister(
      this.options
    );
  }

  /**
   * use iframe for authorization
   * @param {object} options for overriding defaults
   * @returns {Iframe} instance of an iframe flow
   */
  iframe(options = {}) {
    const localOptions = Object.assign({}, this.options, options);
    return new Iframe(this, localOptions);
  }

  /**
   * use popup for authorization
   * @param {object} options for overriding defaults
   * @returns {Popup} instance of a popup flow
   */
  popup(options = {}) {
    const localOptions = Object.assign({}, this.options, options);
    return new Popup(this, localOptions);
  }

  /**
   * use redirect for authorization
   * @param {object} options for overriding defaults
   * @returns {Redirect} instance of a redirect flow
   */
  redirect(options = {}) {
    const localOptions = Object.assign({}, this.options, options);
    return new Redirect(this, localOptions);
  }

  /**
   * create authorization url
   * @param {object} options for overriding defaults
   * @param {string} flow set 'button' for popup and iframe
   * @returns {string} generated url
   */
  authorizeURL(options = {}, flow = '') {
    const localOptions = Object.assign({}, this.options, options);
    localOptions.pkce = normalizePkce(localOptions.pkce);

    if (!localOptions.state) {
      localOptions.state = random.string(localOptions.key_length);
    }

    if (!localOptions.redirect_uri) {
      localOptions.redirect_uri = window.location.href;
    }

    const params = pick(localOptions, [
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

    if (localOptions.response_type === 'code' && localOptions.pkce.enabled) {
      const codeVerifier =
        localOptions.pkce.code_verifier ||
        random.string(localOptions.pkce.code_verifier_length);

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

    this.transaction.generate(params);
    this.redirectUriParamsPersister.persist(params);

    delete params.code_verifier;

    return url + '?' + qs.stringify(params);
  }

  /**
   * This function verifies if redirect transaction params are valid.
   * @param {object} authorizeData authorize data to validate and return transaction state - redirect state, pkce code verifier
   * @returns {object | null} transaction state if valid, null otherwise
   */
  verify(authorizeData) {
    const transactionData = this.transaction.get(authorizeData.state);

    if (authorizeData.state && this.options.verify_state) {
      if (transactionData.state != authorizeData.state) {
        return null;
      }
    }

    return transactionData;
  }
}
