import errors from '../helpers/errors';
import qs from 'qs';
import {type AuthorizeResponse, type TokenFlowResponse, type CodeFlowResponse} from '../types/auth';
import {type RedirectSDK, type RedirectOptions} from '../types/authentication';

export default class Redirect {
  options: RedirectOptions;
  private sdk: RedirectSDK;

  constructor(sdk: RedirectSDK, options: RedirectOptions) {
    this.options = options;
    this.sdk = sdk;
  }

  /**
   * Run the default authorization flow by redirecting the page.
   */
  authorize(): void {
    const url = this.sdk.authorizeURL(this.options);
    window.location.href = url;
  }

  /**
   * Check if the current origin was redirected with authorize data.
   * @returns Promise that resolves to authorize data or rejects with an error.
   */
  authorizeData(): Promise<AuthorizeResponse> {
    return new Promise((resolve, reject) => {
      switch (this.options.response_type) {
        case 'token': {
          const parsed = qs.parse(window.location.hash.substring(1));
          if (
            !['access_token', 'expires_in', 'token_type'].every((f) =>
              Object.prototype.hasOwnProperty.call(parsed, f),
            )
          ) {
            reject(errors.extend({identity_exception: 'unauthorized'}));
            return;
          }
          const tokenResponse: TokenFlowResponse = {
            access_token: parsed.access_token as string,
            expires_in: parseInt(parsed.expires_in as string),
            token_type: parsed.token_type as string,
            ...(parsed.state && {state: parsed.state as string}),
            ...(parsed.scope && {scope: parsed.scope as string}),
          };
          this.sdk.redirectUriParamsPersister.retrieve(tokenResponse.state ?? '');
          resolve(tokenResponse);
          return;
        }

        case 'code': {
          const parsed = qs.parse(window.location.search, {
            ignoreQueryPrefix: true,
          });
          if (!Object.prototype.hasOwnProperty.call(parsed, 'code')) {
            reject(errors.extend({identity_exception: 'unauthorized'}));
            return;
          }
          const codeResponse: CodeFlowResponse = {
            code: parsed.code as string,
            ...(parsed.state && {state: parsed.state as string}),
          };
          this.sdk.redirectUriParamsPersister.retrieve(codeResponse.state ?? '');
          resolve(codeResponse);
          return;
        }
      }
    });
  }
}
