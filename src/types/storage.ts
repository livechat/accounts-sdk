import type Cookies from 'js-cookie';

/**
 * Options for configuring storage behaviour.
 */
export type StorageHandlerOptions = {
  /**
   * When `true`, prefer `localStorage` over cookies.
   * Falls back to cookies if `localStorage` is unavailable (e.g. disabled in the browser).
   */
  force_local_storage?: boolean;
};

/**
 * Contract that all storage backends must satisfy.
 */
export type StorageBackend = {
  getItem(key: string): string | null | undefined;
  removeItem(key: string): void;
  setItem(key: string, value: string, options?: Cookies.CookieAttributes): void;
};
