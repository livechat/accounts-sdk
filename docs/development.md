# Development

## SJCL

One of components uses crypto library called SJCL. We include a custom build in `src/vendor/sjcl.js` that only includes the pieces we need and avoids bundler errors caused by Node requires in standard version.

To do this build yourself and verify code integrity, do the following:

1. Clone [the SJCL repo](https://github.com/bitwiseshiftleft/sjcl).
2. Check out a `1.0.8` version.
3. Run `./configure --without-all --with-sha256 --compress=none` to configure our build.
4. Run `make sjcl.js` to build the file.
5. Compare newly created `sjcl.js` with the one included in `src/vendor`.
