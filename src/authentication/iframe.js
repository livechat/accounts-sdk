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
   * @return {Promise} promise that resolves to authorize data or error
   */
  authorize() {
    return new Promise((resolve, reject) => {
      const url = this.sdk.authorizeURL(this.options, 'button');

      const listener = new Listener(this.options);

      const cb = (err, authorizeData) => {
        this.removeIframe();
        if (err) {
          return reject(err);
        }
        resolve(authorizeData);
      };

      listener.start(5000, cb);

      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', url);
      iframe.setAttribute('id', this.iframeID());
      iframe.setAttribute('sandbox', "allow-storage-access-by-user-activation allow-scripts allow-same-origin")
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.right = '0';
      iframe.style.opacity = '0';
      iframe.style.visibility = 'none';

      document.body.appendChild(iframe);
    });
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
