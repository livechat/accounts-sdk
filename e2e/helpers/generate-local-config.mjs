#!/usr/bin/env node
// Regenerates e2e/app/config.local.js from e2e/.env, so manual browser
// testing (see e2e/README.md) reads the same values as `npm run test:e2e`
// instead of needing a second, hand-maintained config file.
import {existsSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const envPath = join(root, '..', '.env');

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const config = {
  client_id: process.env.E2E_CLIENT_ID,
  server_url: process.env.E2E_SERVER_URL,
  redirect_uri: process.env.E2E_REDIRECT_URI,
  response_type: 'token',
};

const outPath = join(root, '..', 'app', 'config.local.js');

writeFileSync(
  outPath,
  '// Auto-generated from e2e/.env by e2e/helpers/generate-local-config.mjs — do not edit by hand.\n' +
    `window.__E2E_CONFIG__ = window.__E2E_CONFIG__ || ${JSON.stringify(config, null, 2)};\n`,
);

console.log(`Wrote ${outPath}`);
