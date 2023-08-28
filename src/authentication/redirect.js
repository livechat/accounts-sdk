import errors from '../helpers/errors';
import qs from 'qs';
import {pick} from '../helpers/object';

// eslint-disable-next-line require-jsdoc
export default class Redirect {
  // eslint-disable-next-line require-jsdoc
  constructor(sdk, options) {
    this.options = options;
    this.sdk = sdk;
  }

  /**
   * run default authorization flow
   */
  authorize() {
    const url = this.sdk.authorizeURL(this.options);
    window.location = url;
  }

  /**
   * this function checks if the current origin was redirected to with authorize data
   * @return {Promise} promise that resolves to authorize data or error
   */
  authorizeData() {
    return new Promise((resolve, reject) => {
      let authorizeData = {};
      let requiredFields = [];

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
              authorizeData.hasOwnProperty(field)
            )
          ) {
            reject(errors.extend({identity_exception: 'unauthorized'}));
            return;
          }

          authorizeData.expires_in = parseInt(authorizeData.expires_in);
          break;

        case 'code':
          requiredFields = ['code'];

          authorizeData = qs.parse(window.location.search, {
            ignoreQueryPrefix: true,
          });
          authorizeData = pick(authorizeData, ['state', 'code']);

          if (
            !requiredFields.every((field) =>
              authorizeData.hasOwnProperty(field)
            )
          ) {
            reject(errors.extend({identity_exception: 'unauthorized'}));
            return;
          }
      }

      this.sdk.redirectUriParamsPersister.retrieve(authorizeData.state);

      resolve(authorizeData);
    });
  }
}
