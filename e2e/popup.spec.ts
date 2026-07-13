import {test, expect} from '@playwright/test';
import {
  hasCredentials,
  skipReason,
  sdkConfig,
  credentials,
} from './helpers/env';

test.describe('popup login flow', () => {
  test.skip(!hasCredentials, skipReason);

  test('logs in via popup and resolves a token flow AuthorizeResponse', async ({
    page,
    context,
  }) => {
    await page.addInitScript((config) => {
      window.__E2E_CONFIG__ = config;
    }, sdkConfig());

    await page.goto('/e2e/app/index.html');

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('#popup-btn'),
    ]);
    await popup.waitForLoadState();

    const {username, password} = credentials();
    await popup.getByTestId('login-email-input').fill(username);
    await popup.getByTestId('login-password-input').fill(password);
    await popup.getByTestId('login-submit-button').click();

    await popup.waitForEvent('close');

    // The listener resolves synchronously once postMessage arrives — no
    // extra network round-trip for the token flow, unlike code + PKCE below.
    await expect(page.locator('#result')).not.toHaveText('');
    const result = (await page.evaluate(() => window.__E2E_RESULT__))!;

    expect(result.error).toBeUndefined();
    // NOTE: unlike the redirect flow's URL hash, this env's popup postMessage
    // payload comes back with token_type/expires_in/scope as null — a gap
    // between the two flows worth raising with the accounts team, not
    // something this SDK controls (see listener.ts's mapping of `scopes` ->
    // `scope` and `expires_in` parsing, which only run when the source value
    // is truthy). Asserting the real shape here so a future fix shows up as
    // a (welcome) test failure instead of silently not being noticed.
    expect(result.authorizeData).toMatchObject({
      type: 'token',
      token_type: null,
      access_token: expect.any(String),
      expires_in: null,
      state: expect.any(String),
    });
    expect(result.transaction).not.toBeNull();
    expect(result.transaction!.state).toBe(result.authorizeData.state);
  });

  test('logs in via popup and resolves a code + PKCE AuthorizeResponse', async ({
    page,
    context,
  }) => {
    await page.addInitScript(
      (config) => {
        window.__E2E_CONFIG__ = config;
      },
      sdkConfig({response_type: 'code'}),
    );

    await page.goto('/e2e/app/index.html');

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('#popup-btn'),
    ]);
    await popup.waitForLoadState();

    const {username, password} = credentials();
    await popup.getByTestId('login-email-input').fill(username);
    await popup.getByTestId('login-password-input').fill(password);
    await popup.getByTestId('login-submit-button').click();

    await popup.waitForEvent('close');

    // The fixture exchanges the code for a token itself (see
    // handleAuthorizeResult in e2e/app/app.js) — an extra network round-trip,
    // so wait for it to actually finish before reading the result.
    await expect(page.locator('#result')).not.toHaveText('');
    const result = (await page.evaluate(() => window.__E2E_RESULT__))!;

    expect(result.error).toBeUndefined();
    expect(result.authorizeData).toMatchObject({
      type: 'code',
      code: expect.any(String),
      state: expect.any(String),
    });

    expect(result.transaction).not.toBeNull();
    expect(result.transaction!.state).toBe(result.authorizeData.state);
    expect(typeof result.transaction!.code_verifier).toBe('string');
    expect(result.transaction!.code_verifier!.length).toBeGreaterThan(0);

    expect(result.tokenResponse).toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
      token_type: 'Bearer',
      expires_in: expect.any(Number),
    });
  });

  test('pre-fills the login form email from the email_hint option', async ({
    page,
    context,
  }) => {
    const {username} = credentials();

    await page.addInitScript(
      (config) => {
        window.__E2E_CONFIG__ = config;
      },
      sdkConfig({email_hint: username}),
    );

    await page.goto('/e2e/app/index.html');

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('#popup-btn'),
    ]);
    await popup.waitForLoadState();

    await expect(popup.getByTestId('login-email-input')).toHaveValue(username);

    await popup.close();
  });

  test('round-trips a caller-supplied custom state param', async ({
    page,
    context,
  }) => {
    const customState = `e2e-custom-state-${Date.now()}`;

    await page.addInitScript(
      (config) => {
        window.__E2E_CONFIG__ = config;
      },
      sdkConfig({state: customState}),
    );

    await page.goto('/e2e/app/index.html');

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('#popup-btn'),
    ]);
    await popup.waitForLoadState();

    const {username, password} = credentials();
    await popup.getByTestId('login-email-input').fill(username);
    await popup.getByTestId('login-password-input').fill(password);
    await popup.getByTestId('login-submit-button').click();

    await popup.waitForEvent('close');

    await expect(page.locator('#result')).not.toHaveText('');
    const result = (await page.evaluate(() => window.__E2E_RESULT__))!;

    expect(result.authorizeData.state).toBe(customState);
    expect(result.transaction).not.toBeNull();
    expect(result.transaction!.state).toBe(customState);
  });
});
