import {defineConfig} from '@playwright/test';
import {existsSync} from 'fs';
import {join} from 'path';

const envPath = join(__dirname, '.env');

// Loads local creds regardless of how the test runner was launched (CLI, CI,
// or the VSCode Playwright extension) — CI sets E2E_* via real env vars and
// has no e2e/.env file, so this is a no-op there.
if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    // Traces can capture request/response bodies, and these tests exchange
    // real OAuth tokens — keep them local-only (debugging), never in CI
    // where they'd get uploaded as an artifact.
    trace: process.env.CI ? 'off' : 'retain-on-failure',
  },
  webServer: {
    // cwd defaults to this config file's directory (e2e/), so serve the
    // parent (repo root) to expose both /dist/accounts-sdk.js and /e2e/app/*.
    command: 'npx http-server .. -p 4173 -s',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
