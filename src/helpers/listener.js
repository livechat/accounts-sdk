/* eslint-disable require-jsdoc */
import './errors';
import errors from './errors';
export default class Listener {
  constructor(options = {}) {
    this.options = options;
    this.listening = false;

    this.receiveMessage = this.receiveMessage.bind(this);
  }

  start(timeout, callback) {
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

  stop() {
    this.listening = false;
    clearTimeout(this.tid);
    window.removeEventListener('message', this.receiveMessage, false);
  }

  receiveMessage(event) {
    if (
      event.origin !== this.options.server_url &&
      event.origin !==
        this.options.server_url.replace(/livechat\.com$/, 'livechatinc.com')
    ) {
      return;
    }

    this.stop();

    if (event.data.error) {
      this.callback(errors.extend(event.data.error), null);
    } else {
      if (event.data.data.scopes) {
        event.data.data.scope = event.data.data.scopes;
        delete event.data.data.scopes;
      }
      if (event.data.data.expires_in) {
        event.data.data.expires_in = parseInt(event.data.data.expires_in) || 0;
      }
      this.callback(null, event.data.data);
    }
  }
}
