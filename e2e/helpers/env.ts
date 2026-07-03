// Fixed for this test client/environment — not expected to change, so no
// need to configure them per-machine like the credentials below.
export const SERVER_URL = 'https://accounts.labs.livechat.com';
export const REDIRECT_URI = 'http://localhost:4173/e2e/app/redirect.html';

export const hasCredentials = Boolean(
  process.env.E2E_CLIENT_ID &&
  process.env.E2E_USERNAME &&
  process.env.E2E_PASSWORD,
);

export const skipReason = 'requires E2E_* env vars — see e2e/README.md';

export function sdkConfig(overrides: Record<string, string | undefined> = {}) {
  return {
    client_id: process.env.E2E_CLIENT_ID,
    server_url: SERVER_URL,
    redirect_uri: REDIRECT_URI,
    ...overrides,
  };
}

export function credentials() {
  return {
    username: process.env.E2E_USERNAME as string,
    password: process.env.E2E_PASSWORD as string,
  };
}
