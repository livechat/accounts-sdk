import errors from './errors';
import {type ListenerCallback, type ListenerOptions} from '../types/listener';

export default class Listener {
  private options: ListenerOptions;
  listening: boolean;
  private callback?: ListenerCallback;
  private tid?: ReturnType<typeof setTimeout>;

  constructor(options: ListenerOptions = {}) {
    this.options = options;
    this.listening = false;

    this.receiveMessage = this.receiveMessage.bind(this);
  }

  start(timeout: number | null, callback: ListenerCallback): void {
    if (this.listening) {
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

  receiveMessage(event: MessageEvent): void {
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

    if (!this.callback) {
      throw new Error('Listener callback is not set');
    }

    if (event.data.error) {
      this.callback(errors.extend(event.data.error), null);
    } else {
      if (event.data.data.scopes) {
        event.data.data.scope = event.data.data.scopes;
        delete event.data.data.scopes;
      }
      if (event.data.data.expires_in) {
        event.data.data.expires_in =
          parseInt(event.data.data.expires_in, 10) || 0;
      }
      event.data.data.type = event.data.data.access_token ? 'token' : 'code';
      this.callback(null, event.data.data);
    }
  }
}
