import type {AuthorizeResponse, TransactionData} from '../../src/index';

// Shape of the object e2e/app/app.js passes to showResult() — what specs
// read back via page.evaluate(() => window.__E2E_RESULT__).
export interface E2EResult {
  authorizeData: AuthorizeResponse;
  transaction: TransactionData | null;
  tokenResponse?: Record<string, unknown>;
  error?: string;
}

// Ambient typing for the globals e2e/app/*.js reads/writes on `window` —
// lets specs assign/read them without inline casts or @ts-expect-error.
declare global {
  interface Window {
    __E2E_CONFIG__?: Record<string, unknown>;
    __E2E_RESULT__?: E2EResult;
  }
}
