import errors, {type AuthError} from './errors';

export type ListenerCallback = (error: AuthError | string | null, data: Record<string, unknown> | null) => void;

interface ListenerOptions {
  server_url?: string;
}

export default class Listener {
  private options: ListenerOptions;
  listening: boolean;
  private callback?: ListenerCallback;
  private tid?: ReturnType<typeof setTimeout>;
  _listenerInited?: boolean;

  // Arrow function so `this` is captured without explicit .bind() call.
  receiveMessage = (event: MessageEvent): void => {
    if (
      event.origin !== this.options.server_url &&
      event.origin !==
        this.options.server_url?.replace(/livechat\.com$/, 'livechatinc.com')
    ) {
      return;
    }

    if (!event.data.data && !event.data.error) {
      return;
    }

    this.stop();

    if (event.data.error) {
      this.callback!(errors.extend(event.data.error), null);
    } else {
      if (event.data.data.scopes) {
        event.data.data.scope = event.data.data.scopes;
        delete event.data.data.scopes;
      }
      if (event.data.data.expires_in) {
        event.data.data.expires_in = parseInt(event.data.data.expires_in) || 0;
      }
      this.callback!(null, event.data.data);
    }
  };

  constructor(options: ListenerOptions = {}) {
    this.options = options;
    this.listening = false;
  }

  start(timeout: number | null, callback: ListenerCallback): void {
    if (this._listenerInited) {
      return;
    }
    this.listening = true;
    this.callback = callback;

    if (timeout) {
      this.tid = setTimeout(() => {
        this.stop();
        callback('timeout', null);
      }, timeout);
    }

    window.addEventListener('message', this.receiveMessage);
  }

  stop(): void {
    this.listening = false;
    clearTimeout(this.tid);
    window.removeEventListener('message', this.receiveMessage, false);
  }
}
