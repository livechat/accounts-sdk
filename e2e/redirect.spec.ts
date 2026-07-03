import {test, expect} from '@playwright/test';
import {
  hasCredentials,
  skipReason,
  sdkConfig,
  credentials,
  REDIRECT_URI,
} from './helpers/env';

test.describe('redirect login flow', () => {
  test.skip(!hasCredentials, skipReason);

  test('logs in via redirect and lands back using token flow', async ({
    page,
  }) => {
    await page.addInitScript((injected) => {
      // @ts-expect-error - injected app config, see e2e/app/app.js
      window.__E2E_CONFIG__ = injected;
    }, sdkConfig());

    await page.goto('/e2e/app/index.html');
    await page.click('#redirect-btn');

    const {username, password} = credentials();
    await page.getByTestId('login-email-input').fill(username);
    await page.getByTestId('login-password-input').fill(password);
    await page.getByTestId('login-submit-button').click();

    await page.waitForURL('**/e2e/app/redirect.html*');

    // Verify the redirect landed with a well-formed token response in the URL
    // itself, e.g.:
    // http://localhost:4173/e2e/app/redirect.html#access_token=...&expires_in=28800&scope=...&state=...&token_type=Bearer
    const url = new URL(page.url());
    const hashParams = new URLSearchParams(url.hash.slice(1));
    expect(hashParams.get('access_token')).toBeTruthy();
    expect(hashParams.get('expires_in')).toMatch(/^\d+$/);
    expect(hashParams.get('scope')).toBe('accounts--my:rw');
    expect(hashParams.get('state')).not.toBeNull();
    expect(hashParams.get('token_type')).toBe('Bearer');

    // Verify the SDK parsed every prop out of that URL and validated the
    await expect(page.locator('#result')).not.toHaveText('pending');
    const result = JSON.parse(
      (await page.locator('#result').textContent()) ?? '{}',
    );

    expect(result.error).toBeUndefined();
    expect(result.authorizeData).toMatchObject({
      type: 'token',
      token_type: 'Bearer',
      access_token: hashParams.get('access_token'),
      expires_in: Number(hashParams.get('expires_in')),
      scope: hashParams.get('scope'),
      state: hashParams.get('state'),
    });
    expect(result.transaction).not.toBeNull();
    expect(result.transaction.state).toBe(result.authorizeData.state);
  });

  test('logs in via redirect and lands back using code + PKCE flow', async ({
    page,
  }) => {
    await page.addInitScript(
      (injected) => {
        // @ts-expect-error - injected app config, see e2e/app/app.js
        window.__E2E_CONFIG__ = injected;
      },
      sdkConfig({response_type: 'code'}),
    );

    await page.goto('/e2e/app/index.html');
    await page.click('#redirect-btn');

    const {username, password} = credentials();
    await page.getByTestId('login-email-input').fill(username);
    await page.getByTestId('login-password-input').fill(password);
    await page.getByTestId('login-submit-button').click();

    await page.waitForURL('**/e2e/app/redirect.html*');

    // Code + PKCE flow returns `code` as a query param, not a URL hash.
    const url = new URL(page.url());
    expect(url.searchParams.get('code')).toBeTruthy();
    expect(url.searchParams.get('state')).not.toBeNull();

    // The fixture exchanges the code for a token itself after landing here
    // (see e2e/app/redirect.html) — that's an extra network round-trip,
    // so wait for it to actually finish before reading the result.
    await expect(page.locator('#result')).not.toHaveText('pending');
    const result = JSON.parse(
      (await page.locator('#result').textContent()) ?? '{}',
    );

    expect(result.error).toBeUndefined();
    expect(result.authorizeData).toMatchObject({
      type: 'code',
      code: url.searchParams.get('code'),
      state: url.searchParams.get('state'),
    });

    // PKCE-specific: the SDK generated a code_verifier at authorize-time and
    // must be able to hand it back out of the transaction after the redirect.
    expect(result.transaction).not.toBeNull();
    expect(result.transaction.state).toBe(result.authorizeData.state);
    expect(typeof result.transaction.code_verifier).toBe('string');

    // The fixture exchanged the code for a real token via POST /v2/token
    // (see exchangeCodeForToken in e2e/app/app.js) — the step every
    // integration must do itself since the implicit grant flow deprecation.
    expect(result.tokenResponse).toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      token_type: 'Bearer',
      expires_in: expect.any(Number),
    });
    expect(result.transaction.code_verifier.length).toBeGreaterThan(0);
  });

  test('preserves the caller-supplied redirect_uri query and hash params across the round-trip', async ({
    page,
  }) => {
    // RedirectUriParamsPersister strips query/hash from redirect_uri before
    // it's sent to the auth server (so it still matches the whitelisted
    // value), stashes them keyed by `state`, then restores them via
    // history.replaceState once the response lands back here — merged with
    // whatever the server itself appended. See
    // src/helpers/persisters/redirectUriParams.ts.
    await page.addInitScript(
      (injected) => {
        // @ts-expect-error - injected app config, see e2e/app/app.js
        window.__E2E_CONFIG__ = injected;
      },
      sdkConfig({redirect_uri: `${REDIRECT_URI}?app_param=hello#app-anchor`}),
    );

    await page.goto('/e2e/app/index.html');
    await page.click('#redirect-btn');

    const {username, password} = credentials();
    await page.getByTestId('login-email-input').fill(username);
    await page.getByTestId('login-password-input').fill(password);
    await page.getByTestId('login-submit-button').click();

    await page.waitForURL('**/e2e/app/redirect.html*');
    // retrieve() (and its history.replaceState call) runs synchronously
    // inside authorizeData(), before #result is populated - so waiting for
    // #result guarantees the URL below already reflects the restored params.
    await expect(page.locator('#result')).not.toHaveText('pending');

    const url = new URL(page.url());
    expect(url.searchParams.get('app_param')).toBe('hello');
    expect(url.hash).toContain('app-anchor');
    // The server's own token response must still be merged in alongside it.
    expect(url.hash).toContain('access_token=');

    const result = JSON.parse(
      (await page.locator('#result').textContent()) ?? '{}',
    );
    expect(result.error).toBeUndefined();
    expect(result.authorizeData.type).toBe('token');
  });

  test('pre-fills the login form email from the email_hint option', async ({
    page,
  }) => {
    const {username} = credentials();

    await page.addInitScript(
      (injected) => {
        // @ts-expect-error - injected app config, see e2e/app/app.js
        window.__E2E_CONFIG__ = injected;
      },
      sdkConfig({email_hint: username}),
    );

    await page.goto('/e2e/app/index.html');
    await page.click('#redirect-btn');

    await expect(page.getByTestId('login-email-input')).toHaveValue(username);
  });

  test('round-trips a caller-supplied custom state param', async ({page}) => {
    const customState = `e2e-custom-state-${Date.now()}`;

    await page.addInitScript(
      (injected) => {
        // @ts-expect-error - injected app config, see e2e/app/app.js
        window.__E2E_CONFIG__ = injected;
      },
      sdkConfig({state: customState}),
    );

    await page.goto('/e2e/app/index.html');
    await page.click('#redirect-btn');

    const {username, password} = credentials();
    await page.getByTestId('login-email-input').fill(username);
    await page.getByTestId('login-password-input').fill(password);
    await page.getByTestId('login-submit-button').click();

    await page.waitForURL('**/e2e/app/redirect.html*');
    await expect(page.locator('#result')).not.toHaveText('pending');

    const result = JSON.parse(
      (await page.locator('#result').textContent()) ?? '{}',
    );
    expect(result.authorizeData.state).toBe(customState);
    expect(result.transaction).not.toBeNull();
    expect(result.transaction.state).toBe(customState);
  });
});
