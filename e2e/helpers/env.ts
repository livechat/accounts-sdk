export const hasCredentials = Boolean(
  process.env.E2E_CLIENT_ID &&
  process.env.E2E_USERNAME &&
  process.env.E2E_PASSWORD,
);

export const skipReason = 'requires E2E_* env vars — see e2e/README.md';

export function sdkConfig(overrides: Record<string, string | undefined> = {}) {
  return {
    client_id: process.env.E2E_CLIENT_ID,
    server_url: process.env.E2E_SERVER_URL,
    redirect_uri: process.env.E2E_REDIRECT_URI,
    ...overrides,
  };
}

export function credentials() {
  return {
    username: process.env.E2E_USERNAME as string,
    password: process.env.E2E_PASSWORD as string,
  };
}
