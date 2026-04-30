import Listener from '../helpers/listener';
import {type AuthorizeResponse} from '../types/auth';
import {type IframeSDK, type IframeOptions} from '../types/authentication';

/**
 * Authentication using an iframe. Not recommended because of ITP 2.0.
 */
export default class Iframe {
  options: IframeOptions;
  private sdk: IframeSDK;

  constructor(sdk: IframeSDK, options: IframeOptions) {
    this.options = options;
    this.sdk = sdk;
  }

  authorize(): Promise<AuthorizeResponse | null> {
    return new Promise((resolve, reject) => {
      const url = this.sdk.authorizeURL(this.options, 'button');

      const listener = new Listener(this.options);

      const cb = (
        err: unknown,
        authorizeData: AuthorizeResponse | null,
      ) => {
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

  iframeID(): string {
    return (this.options.client_id ?? '') + (this.options.response_type ?? '');
  }

  removeIframe(): void {
    const ref = document.getElementById(this.iframeID());
    if (ref?.parentNode) {
      ref.parentNode.removeChild(ref);
    }
  }
}
