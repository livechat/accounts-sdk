# Contributing

## Development Setup

```bash
npm install
npm run build   # build dist files
npm test        # run tests
npm run lint    # lint source
```

To test changes in your application, publish a beta release and install it. See [Release process & beta releases](docs/releasing.md).

## Testing locally

To verify the built artifacts work as consumers would experience them:

### `npm pack` (most accurate)

Packs only what is in the `files` field (`dist/`), matching what `npm publish` would upload.

```bash
npm run build
npm pack
# → livechat-accounts-sdk-x.x.x.tgz
```

In the consumer project:

```bash
npm install /path/to/accounts-sdk/livechat-accounts-sdk-x.x.x.tgz
```

Run `npm pack --dry-run` first to verify the right files are included without creating the tarball.

### `npm link` (faster iteration)

```bash
# In the SDK repo
npm run build
npm link

# In the consumer project
npm link @livechat/accounts-sdk
```

Unlink when done:

```bash
# In the consumer project
npm unlink @livechat/accounts-sdk
# In the SDK repo
npm unlink
```

Note: `npm link` symlinks the entire package directory rather than just `dist/`, so use `npm pack` for a final verification before publishing.
