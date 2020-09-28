import Listener from '../helpers/listener';
/**
 * Class for authentication using popup.
 */
export default class Popup {
  // eslint-disable-next-line require-jsdoc
  constructor(sdk, options) {
    this.options = options;
    this.sdk = sdk;
  }

  /**
   * run popup authorization flow, should be called in a click handler to avoid beeing blocked
   * @param {Function} callback callback with authorize data
   */
  authorize(callback) {
    const url = this.sdk.authorizeURL(this.options, 'button');

    const w = 500;
    const h = 650;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;

    const listener = new Listener(this.options);
    listener.start(null, callback);

    window.open(
      url,
      'livechat-login-popup',
      `resizable,scrollbars,width=${w},height=${h},left=${left},top=${top}`
    );
  }
}
