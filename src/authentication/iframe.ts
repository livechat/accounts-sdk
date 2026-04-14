import Listener from '../helpers/listener';

interface IframeSDK {
  authorizeURL(options: Record<string, unknown>, flow: string): string;
}

interface IframeOptions {
  client_id?: string;
  response_type?: string;
  server_url?: string;
  [key: string]: unknown;
}

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

  authorize(): Promise<Record<string, unknown> | null> {
    return new Promise((resolve, reject) => {
      const url = this.sdk.authorizeURL(this.options, 'button');

      const listener = new Listener(this.options);

      const cb = (err: unknown, authorizeData: Record<string, unknown> | null) => {
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
    if (ref && ref.parentNode) {
      ref.parentNode.removeChild(ref);
    }
  }
}
