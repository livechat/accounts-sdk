# E2E tests

Playwright tests that drive the popup and redirect auth flows against a **real**
accounts server (staging or production) — no mocks. They complement the jsdom
unit tests in `src/`, which mock `window.open`/`postMessage`/`window.location`.

**Iframe flow is intentionally not covered here.** It's a silent-auth flow (an
invisible 1x1 iframe, no login UI) that only succeeds if the browser already
has a session cookie for the accounts server, and `iframe.ts` doesn't even
attempt `requestStorageAccess()` to work around third-party-cookie blocking
the way `popup.ts` does. The SDK's own docs call it out as not recommended
because of ITP 2.0. A fresh Playwright context has no such session, so
covering it would mean either a flaky timeout-only test or first logging in
via popup/redirect to seed a session — extra complexity for a deprecated
fallback. Revisit if the iframe flow becomes load-bearing again.

- `playwright.config.ts` — Playwright config (webServer, baseURL, `.env` loading).
- `*.spec.ts` — the actual Playwright tests.
- `helpers/` — Node-side test tooling (env var handling, local config generation).
- `app/` — the browser-side sample app the tests drive: plain HTML/JS pages
  that load the built SDK and wire up popup/redirect/PKCE-exchange buttons,
  standing in for a real integration.

## Setup

1. Create an account at https://www.labs.text.com/app — this becomes your
   **dedicated test account** (`E2E_USERNAME`/`E2E_PASSWORD`). Don't use a
   personal or production account, since credentials are entered by the test
   and stored as a CI secret.
2. Create an OAuth client at
   https://www.labs.text.com/app/settings/integrations/api-access/oauth-clients.
3. Set the client's redirect URI to `REDIRECT_URI` from `e2e/helpers/env.ts`
   (currently `http://localhost:4173/e2e/app/redirect.html`).
4. Note the generated `client_id` — this is `E2E_CLIENT_ID`. A `client_secret`
   may also be issued; these tests don't use it (the code + PKCE flow is a
   public-client flow, no secret involved).
5. Copy `e2e/.env.example` to `e2e/.env` and fill in
   `E2E_CLIENT_ID`/`E2E_USERNAME`/`E2E_PASSWORD` — or add the same as repo
   secrets for CI.
6. Install browsers once: `npx playwright install chromium`.
7. Run: `npm run test:e2e`.

`playwright.config.ts` loads `.env` itself (via `process.loadEnvFile`) if
the file exists, so no manual `source`/`export` is needed — this also makes
the tests runnable straight from the
[VSCode Playwright extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
(Test Explorer / the ▶ gutter icon next to each `test(...)`), since the
extension launches the runner without your shell's env.

Without `.env` and its vars set, `npm run test:e2e` runs and every e2e
test reports as **skipped** (not failed) — this is intentional so the suite
is safe to run before real credentials exist.

## Environment variables

| Variable        | Required | Description                                 |
| --------------- | -------- | -------------------------------------------- |
| `E2E_CLIENT_ID` | yes      | client_id of the test OAuth client           |
| `E2E_USERNAME`  | yes      | login/email of the dedicated test account    |
| `E2E_PASSWORD`  | yes      | password of the dedicated test account       |

`server_url`/`redirect_uri` are fixed constants (`SERVER_URL`/`REDIRECT_URI`
in `e2e/helpers/env.ts`) rather than env vars, since this test client is
tied to one specific server + registered redirect URI and isn't expected to
change per-machine.

## Manual testing without Playwright

The app pages (`e2e/app/index.html`, `redirect.html`) read config from
`window.__E2E_CONFIG__`. During automated runs, Playwright sets it via
`page.addInitScript`. To poke at the pages by hand in a plain browser
instead, with `.env` as the single source of truth:

```
npm run test:e2e:manual
```

This regenerates `e2e/app/config.local.js` (gitignored) from `.env` via
`e2e/helpers/generate-local-config.mjs`, builds the SDK, and serves the repo
at `http://localhost:4173` — open `http://localhost:4173/e2e/app/index.html`.

`config.local.js` only fills in config if nothing set it yet, so it's a
no-op during real Playwright runs even if the file exists on disk.

## CI

The `e2e` job in `.github/workflows/ci.yml` runs on every push, sourcing
`E2E_*` from repository secrets. Until those secrets are added, the job is a
green no-op (every test skips). Once real secrets are in place, be aware that
this job depends on an external server and logs in with real credentials on
every push — expect more flakiness than the mocked unit tests, and revisit
running on every push vs. a manual/scheduled trigger if that becomes a
problem.
