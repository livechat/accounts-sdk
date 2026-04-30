import errors from '../helpers/errors';
import qs from 'qs';
import {pick} from '../helpers/object';
import {type RedirectSDK, type RedirectOptions} from '../types/authentication';
import {
  type AuthorizeResponse,
  type TokenFlowResponse,
  type CodeFlowResponse,
} from '../types/auth';

function parseTokenResponse(hash: string): TokenFlowResponse | null {
  const raw = qs.parse(hash.substring(1));
  const {
    access_token,
    expires_in,
    token_type,
    scope,
    state,
    account_id,
    organization_id,
    client_id,
  } = pick(raw, [
    'access_token',
    'expires_in',
    'state',
    'scope',
    'token_type',
    'account_id',
    'organization_id',
    'client_id',
  ]);

  if (
    typeof access_token !== 'string' ||
    typeof expires_in !== 'string' ||
    typeof token_type !== 'string'
  ) {
    return null;
  }

  return {
    access_token,
    token_type,
    expires_in: parseInt(expires_in, 10) || 0,
    scope: scope as string,
    state: state as string,
    account_id: account_id as string,
    organization_id: organization_id as string,
    client_id: client_id as string,
  };
}

function parseCodeResponse(search: string): CodeFlowResponse | null {
  const {code, state, scope, organization_id, account_id, client_id} = pick(
    qs.parse(search, {ignoreQueryPrefix: true}),
    ['code', 'state', 'scope', 'organization_id', 'account_id', 'client_id'],
  );

  if (typeof code !== 'string') {
    return null;
  }

  return {
    code,
    state: state as string,
    scope: scope as string,
    organization_id: organization_id as string,
    account_id: account_id as string,
    client_id: client_id as string,
  };
}

export default class Redirect {
  options: RedirectOptions;
  private sdk: RedirectSDK;

  constructor(sdk: RedirectSDK, options: RedirectOptions) {
    this.options = options;
    this.sdk = sdk;
  }

  /**
   * run default authorization flow
   */
  authorize(): void {
    const url = this.sdk.authorizeURL(this.options);
    window.location.href = url;
  }

  /**
   * this function checks if the current origin was redirected to with authorize data
   * @returns {Promise} promise that resolves to authorize data or error
   */
  authorizeData(): Promise<AuthorizeResponse> {
    return new Promise((resolve, reject) => {
      let result: AuthorizeResponse | null = null;

      switch (this.options.response_type) {
        case 'token':
          result = parseTokenResponse(window.location.hash);
          break;
        case 'code':
          result = parseCodeResponse(window.location.search);
          break;
      }

      if (result === null) {
        reject(errors.extend({identity_exception: 'unauthorized'}));
        return;
      }

      this.sdk.redirectUriParamsPersister.retrieve(result.state ?? '');
      resolve(result);
    });
  }
}
