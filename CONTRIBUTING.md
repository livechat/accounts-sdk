# Contributing

## Development Setup

```bash
npm install
npm run build   # build dist files
npm test        # run tests
npm run lint    # lint source
```

To test changes in your application, publish a beta release and install it. See [Release process & beta releases](docs/releasing.md).

## Minimum package age

CI installs run behind [Aikido Safe Chain](https://github.com/AikidoSec/safe-chain),
which blocks any package published less than 48 hours ago. `min-release-age=2` in
the root `.npmrc` — exempting `@livechat/*`, as CI does — and the Dependabot
`cooldown` keep such a version out of the lockfile. `npm ci` is unaffected.

Dependabot security updates ignore the cooldown by design, so a lockfile can
still end up with a too-fresh entry. Every install job then fails with
`403 Forbidden - blocked by safe-chain direct download minimum package age`. Re-resolve
it — re-locking in place keeps the pin — or re-run 48 hours after that version
was published:

```bash
git checkout origin/master -- package-lock.json
npm install --package-lock-only # then redo the dependency change
git commit package-lock.json
```

Never pass `--safe-chain-skip-minimum-package-age` — it drops the gate for the
whole install.
