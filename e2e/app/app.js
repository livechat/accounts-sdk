/* exported getE2EConfig, showResult, exchangeCodeForToken, handleAuthorizeResult */

// window.__E2E_CONFIG__ is set either by Playwright's page.addInitScript
// (automated tests, see e2e/helpers/env.ts) or by config.local.js, generated
// from e2e/.env by e2e/helpers/generate-local-config.mjs (manual testing
// without Playwright).
function getE2EConfig() {
  // Forwarded as-is into `new AccountsSDK(...)` — any SDKOptions field (scope,
  // state, email_hint, organization_id, prompt, ...) can be set this way from
  // a test via page.addInitScript, not just the 4 originally wired fields.
  return Object.assign({response_type: 'token'}, window.__E2E_CONFIG__ || {});
}

const SENSITIVE_KEYS = new Set(['access_token', 'refresh_token', 'code', 'code_verifier']);

// Deep-clones value, replacing sensitive string fields with '<redacted>' —
// used only for what gets rendered into the DOM (see showResult). Playwright
// traces/screenshots capture DOM content, and this fixture's result objects
// carry real OAuth tokens, so they must never appear there unmasked.
function redact(value) {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object') {
    const clone = {};
    Object.keys(value).forEach(function (key) {
      if (SENSITIVE_KEYS.has(key) && typeof value[key] === 'string') {
        clone[key] = '<redacted>';
      } else {
        clone[key] = redact(value[key]);
      }
    });
    return clone;
  }
  return value;
}

function showResult(value) {
  // Tests read the real, unredacted values via
  // page.evaluate(() => window.__E2E_RESULT__) — never from the DOM.
  window.__E2E_RESULT__ = value;
  document.getElementById('result').textContent = JSON.stringify(
    redact(value),
    null,
    2,
  );
}

// Exchanges an authorization code + PKCE code_verifier for a token, the step
// every real integration must perform itself now that the implicit grant
// flow is deprecated (the SDK only gets you the code, not the token).
async function exchangeCodeForToken(sdk, code, codeVerifier) {
  const response = await fetch(sdk.options.server_url + '/v2/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      client_id: sdk.options.client_id,
      redirect_uri: sdk.options.redirect_uri,
      code: code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error('token exchange failed: ' + response.status + ' ' + body);
  }

  return response.json();
}

// Shared by popup/iframe/redirect handlers: verifies the transaction and, for
// the code + PKCE flow, exchanges the code for a real token — the same steps
// a real integration needs regardless of which flow delivered the code.
async function handleAuthorizeResult(sdk, authorizeData) {
  const transaction = sdk.verify(authorizeData);

  if (authorizeData.type !== 'code') {
    showResult({authorizeData: authorizeData, transaction: transaction});
    return;
  }

  if (!transaction || !transaction.code_verifier) {
    showResult({
      authorizeData: authorizeData,
      transaction: transaction,
      error: 'missing code_verifier - cannot exchange code for a token',
    });
    return;
  }

  try {
    const tokenResponse = await exchangeCodeForToken(
      sdk,
      authorizeData.code,
      transaction.code_verifier,
    );
    showResult({
      authorizeData: authorizeData,
      transaction: transaction,
      tokenResponse: tokenResponse,
    });
  } catch (error) {
    showResult({
      authorizeData: authorizeData,
      transaction: transaction,
      error: String(error),
    });
  }
}
