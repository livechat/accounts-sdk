// Ambient typing for the globals e2e/app/*.js reads/writes on `window` —
// lets specs assign/read them without inline casts or @ts-expect-error.
declare global {
  interface Window {
    __E2E_CONFIG__?: Record<string, unknown>;
    __E2E_RESULT__?: unknown;
  }
}

export {};
