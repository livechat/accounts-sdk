import Listener from '../helpers/listener';
import {type TokenFlowResponse} from '../types/auth';
import {type PopupSDK, type PopupOptions} from '../types/authentication';

/**
 * Authentication using a popup window.
 * Should be called inside a click handler to avoid being blocked by the browser.
 */
export default class Popup {
  options: PopupOptions;
  private sdk: PopupSDK;

  constructor(sdk: PopupSDK, options: PopupOptions) {
    this.options = options;
    this.sdk = sdk;
  }

  authorize(): Promise<TokenFlowResponse | null> {
    return new Promise((resolve, reject) => {
      const url = this.sdk.authorizeURL(this.options, 'button');

      const w = 500;
      const h = 650;
      const left = window.screen.width / 2 - w / 2;
      const top = window.screen.height / 2 - h / 2;

      const listener = new Listener(this.options);
      listener.start(null, (err, authorizeData) => {
        if (err) {
          return reject(err);
        }
        resolve(authorizeData);
      });

      const open = function () {
        window.open(
          url,
          'livechat-login-popup',
          `resizable,scrollbars,width=${w},height=${h},left=${left},top=${top}`,
        );
      };

      if (document.requestStorageAccess) {
        const promise = document.requestStorageAccess();
        promise.then(open, open);
      } else {
        open();
      }
    });
  }
}
