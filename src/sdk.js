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
 * Accounts SDK main class
 */
export default class AccountsSDK {
  /**
   * Accounts SDK constructor
   *
   * @constructor
   * @param {Object} options
   * @param {String} options.client_id registered client ID
   * @param {String} [options.prompt=''] use `consent` to force consent prompt in popup and redirect flows
   * @param {String} [options.response_type='token'] OAuth response type, use `token` or `code`
   * @param {String} [options.popup_flow='auto'] `auto` - close popup when not required, `manual` - always show popup
   * @param {String} [options.state=''] OAuth state param
   * @param {Boolean} [options.verify_state=true] check if state matches after redirect
   * @param {String} [options.scope=null] request exact scopes - must be configured for a given client id
   * @param {String} [options.redirect_uri=''] OAuth redirect uri - default current location
   * @param {String} [options.email_hint=''] fill in email in forms
   * @param {String} [options.server_url='https://accounts.livechat.com'] authorization server url
   * @param {String} [options.path=''] option to provide a path when loading accounts, for example '/signup'
   * @param {Object} [options.tracking] tracking querystring params
   * @param {Object} [options.transaction] options for transaction manager
   * @param {String} [options.transaction.namespace='com.livechat.accounts'] transaction keys prefix
   * @param {Number} [options.transaction.key_length=32] transaction random state length
   * @param {Boolean} [options.transaction.force_local_storage=false] try to use local storage instead of cookies
   * @param {Object} [options.pkce] PKCE configuration
   * @param {Boolean} [options.pkce.enabled=true] Oauth 2.1 PKCE extension enabled
   * @param {String} [options.pkce.code_verifier] override auto generated code verifier
   * @param {Number} [options.pkce.code_verifier_length=128] code verifier length, between 43 and 128 characters https://tools.ietf.org/html/rfc7636#section-4.1
   * @param {String} [options.pkce.code_challange_method='S256'] code challange method, use `S256` or `plain`
   */
  constructor(options = {}) {
    if (options.client_id == null) {
      throw new Error('client id not provided');
    }

    const defaultOptions = {
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
        code_challange_method: 'S256',
      },
    };

    this.options = Object.assign({}, defaultOptions, options);
    this.transaction = new Transaction(this.options);
    this.redirectUriParamsPersister = new RedirectUriParamsPersister(
      this.options
    );
  }

  /**
   * use iframe for authorization
   * @param {Object} options for overriding defaults
   * @return {Object} instance of an iframe flow
   */
  iframe(options = {}) {
    const localOptions = Object.assign({}, this.options, options);
    return new Iframe(this, localOptions);
  }

  /**
   * use popup for authorization
   * @param {Object} options for overriding defaults
   * @return {Object} instance of a popup flow
   */
  popup(options = {}) {
    const localOptions = Object.assign({}, this.options, options);
    return new Popup(this, localOptions);
  }

  /**
   * use redirect for authorization
   * @param {Object} options for overriding defaults
   * @return {Object} instance of a redirect flow
   */
  redirect(options = {}) {
    const localOptions = Object.assign({}, this.options, options);
    return new Redirect(this, localOptions);
  }

  /**
   * create authorization url
   * @param {Object} options for overriding defaults
   * @param {String} flow set 'button' for popup and iframe
   * @return {string} generated url
   */
  authorizeURL(options = {}, flow = '') {
    const localOptions = Object.assign({}, this.options, options);

    if (!localOptions.state) {
      localOptions.state = random.string(localOptions.key_length);
    }

    if (!localOptions.redirect_uri) {
      localOptions.redirect_uri = window.location.href;
    }

    const params = pick(localOptions, [
      'client_id',
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

      switch (localOptions.pkce.code_challange_method) {
        case 'S256':
          const codeChallenge = sjcl.hash.sha256.hash(codeVerifier);
          Object.assign(params, {
            code_verifier: codeVerifier,
            code_challenge: encoding.base64URLEncode(codeChallenge),
            code_challenge_method: localOptions.pkce.code_challange_method,
          });
          break;

        default:
          Object.assign(params, {
            code_verifier: codeVerifier,
            code_challenge: codeVerifier,
            code_challenge_method: localOptions.pkce.code_challange_method,
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
   * @param {Object} authorizeData authorize data to validate and return transaction state - redirect state, pkce code verifier
   * @return {Object} transaction state if valid, null otherwise
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
