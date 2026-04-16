import type Cookies from 'js-cookie';

/**
 * Options for initializing `StorageHandler`.
 * Controls which storage backend is selected at construction time.
 */
export type StorageHandlerOptions = {
  /**
   * When `true`, prefer `localStorage` over cookies.
   * Falls back to `CookieStorage` if `localStorage` is unavailable
   * (e.g. disabled in the browser), and ultimately to `DummyStorage`
   * if cookies also fail.
   */
  force_local_storage?: boolean;
};

/**
 * Contract that all storage backends must satisfy.
 * `StorageHandler` uses this to swap backends transparently
 * (localStorage → CookieStorage → DummyStorage), so the rest of
 * the SDK never deals with backend-specific APIs.
 *
 * Kept as `interface` to clearly communicate that this is a protocol
 * multiple concrete implementations fulfill (CookieStorage, DummyStorage,
 * and the native `localStorage`), even though none declare `implements`.
 */
export interface StorageBackend {
  getItem(key: string): string | null | undefined;
  removeItem(key: string): void;
  setItem(key: string, value: string, options?: Cookies.CookieAttributes): void;
}
