import errors from '../helpers/errors';
import qs from 'qs';
import {pick} from '../helpers/object';
import {type AuthorizeResponse} from '../types/auth';
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
      let authorizeData: Record<string, unknown> = {};
      let requiredFields: string[] = [];

      switch (this.options.response_type) {
        case 'token':
          requiredFields = ['access_token', 'expires_in', 'token_type'];

          authorizeData = qs.parse(window.location.hash.substring(1));
          authorizeData = pick(authorizeData, [
            'access_token',
            'expires_in',
            'state',
            'scope',
            'token_type',
          ]);

          if (
            !requiredFields.every((field) =>
              Object.prototype.hasOwnProperty.call(authorizeData, field),
            )
          ) {
            reject(errors.extend({identity_exception: 'unauthorized'}));
            return;
          }

          authorizeData.expires_in = parseInt(
            authorizeData.expires_in as string,
          );
          break;

        case 'code':
          requiredFields = ['code'];

          authorizeData = qs.parse(window.location.search, {
            ignoreQueryPrefix: true,
          });
          authorizeData = pick(authorizeData, ['state', 'code']);

          if (
            !requiredFields.every((field) =>
              Object.prototype.hasOwnProperty.call(authorizeData, field),
            )
          ) {
            reject(errors.extend({identity_exception: 'unauthorized'}));
            return;
          }
      }

      this.sdk.redirectUriParamsPersister.retrieve(
        authorizeData.state as string,
      );

      resolve(authorizeData as unknown as AuthorizeResponse);
    });
  }
}
