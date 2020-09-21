import Listener from '../helpers/listener';

/**
 * Class for authentication using Iframe
 */
export default class Iframe {
  // eslint-disable-next-line require-jsdoc
  constructor(sdk, options) {
    this.options = options;
    this.sdk = sdk;
  }

  /**
   * run iframe authorization flow, not recommended because of ITP 2.0
   * @param {Function} callback callback with authorize data
   */
  authorize(callback) {
    const url = this.sdk.authorizeURL(this.options, 'button');

    const listener = new Listener(this.options);

    const cb = (...args) => {
      this.removeIframe();
      callback(...args);
    };

    listener.start(5000, cb);

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('id', this.iframeID());
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.right = '0';
    iframe.style.opacity = '0';
    iframe.style.visibility = 'none';

    document.body.appendChild(iframe);
  }

  // eslint-disable-next-line require-jsdoc
  iframeID() {
    return this.options.client_id + this.options.response_type;
  }

  // eslint-disable-next-line require-jsdoc
  removeIframe() {
    const ref = document.getElementById(this.iframeID());
    if (ref && ref.parentNode) {
      ref.parentNode.removeChild(ref);
    }
  }
}
