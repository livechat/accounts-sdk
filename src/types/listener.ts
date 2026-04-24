import {type AuthError} from './errors';
import {type TokenFlowResponse} from './auth';

/**
 * Callback invoked with the result of a popup or iframe authorization flow.
 *
 * Follows the Node.js error-first convention:
 * - On success: `error` is `null`, `data` contains the token response.
 * - On failure: `error` is an {@link AuthError} or the string `'timeout'`,
 *   `data` is `null`.
 */
export type ListenerCallback = (error: AuthError | string | null, data: TokenFlowResponse | null) => void;

/**
 * Options for the `Listener` class.
 * Used to validate the `origin` of incoming `postMessage` events so that
 * messages from other origins are silently ignored.
 */
export type ListenerOptions = {
  /** Expected origin of the accounts server (e.g. `'https://accounts.livechat.com'`). */
  server_url?: string;
};
