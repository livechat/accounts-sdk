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
   * @param {Function} callback callback for handling autorize errors
   */
  authorize(callback) {
    const url = this.sdk.authorizeURL(this.options);
    window.location = url;
  }

  /**
   * this function checks if the current origin was redirected to with authorize data
   * @param {Function} callback callback with authorize data
   */
  authorizeData(callback) {
    let authorizeData = {};

    switch (this.options.response_type) {
      case 'token':
        authorizeData = qs.parse(window.location.hash.substring(1));
        authorizeData = pick(authorizeData, [
          'access_token',
          'expires_in',
          'state',
          'scope',
          'token_type',
        ]);
        if (Object.keys(authorizeData).length != 5) {
          callback(errors.identity_exception.unauthorized);
          return;
        }

        authorizeData.expires_in = parseInt(authorizeData.expires_in);
        break;

      case 'code':
        authorizeData = qs.parse(window.location.search, {
          ignoreQueryPrefix: true,
        });
        authorizeData = pick(authorizeData, ['state', 'code']);
        if (Object.keys(authorizeData).length < 2) {
          callback(errors.identity_exception.unauthorized);
          return;
        }
    }

    callback(null, authorizeData);
  }
}
