# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Add `object.deepMerge()` utility for recursive object merging
- Add `object.omitBy()` utility for filtering object properties by predicate

### Changed
- `pick()` now preserves falsy values (`0`, `false`, `""`, `null`) — only `undefined` properties are dropped

### Fixed
- Fix default options with nested properties being overwritten when merging
- Fix `transaction.generate` passing `undefined` state
- Omit empty string and `null` values from `authorizeURL` query parameters

### Removed
- Remove deprecated `pkce.code_challange_method` option — use `pkce.code_challenge_method` instead

## [3.0.0] - 2026-04-29

### Added
- Ship TypeScript declaration files (`.d.ts`) in `dist/`; `package.json` now sets `"types": "./dist/index.d.ts"` (#77)
- Export named TypeScript types from the package entry point: `SDKOptions`, `PKCEOptions`, `TransactionOptions`, `TokenFlowResponse`, `CodeFlowResponse`, `AuthorizeResponse`, `AuthError`, `ListenerCallback`, `TransactionData`, `VerifyInput`, `RedirectUriParamsPersisterLike` (#77)

### Changed
- Migrate entire source and test suite from JavaScript to TypeScript (#77)
- Narrow `response_type` option type from `string` to `'token' | 'code'` literal union (#77)
- Replace Babel (`@rollup/plugin-babel`) with `@rollup/plugin-typescript`; replace `babel-jest` with `ts-jest` (#77)

## [2.3.0] - 2026-03-30

### Added
- Add `code_challenge_method` parameter and deprecate `code_challange_method` (typo fix) (#70)
- Add Node 24 support; CI now tests against both Node 22 and Node 24 (#72)

### Changed
- Comprehensive test suite overhaul (#68)
- Update development dependencies (#71)

### Security
- Bump serialize-javascript from 7.0.4 to 7.0.5 (#69)
- Bump picomatch from 2.3.1 to 2.3.2 (#67)

### Documentation
- Move internal docs to `docs/` and add badges to readme (#66)

## [2.2.3] - 2026-03-23

### Security
- Security patch

## [2.2.2] - 2026-03-11

### Changed
- Update dependencies

## [2.2.1] - 2026-03-09

### Changed
- Update dependencies
- Security update (#56)

## [2.2.0] - 2026-02-09

### Changed
- Update dependencies and build tooling (#40)

### Added
- Introduce dependabot and PR template (#30)

### Documentation
- Update release documentation (#29)

## [2.1.3] - 2026-01-26

### Security
- Bump lodash in the npm_and_yarn group across 1 directory (#27)

## [2.1.2] - 2026-01-07

### Security
- Bump qs in the npm_and_yarn group across 1 directory (#25)

## [2.1.1] - 2025-12-16

### Fixed
- Fix random string generation (#23)

### Security
- Bump the npm_and_yarn group across 1 directory with 1 update (#22)

### Documentation
- Update readme with release process description (#21)

## [2.1.0] - 2025-10-16

### Security
- Fix vulnerabilities (#19)

### Added
- Add codeowners (#18)

### Fixed
- Fix return type comments (#12)

## [2.0.10] - 2024-03-01

### Added
- Add organization id to params (#17)

## [2.0.9] - 2024-01-16

### Security
- Patching of critical dependencies (#16)

## [2.0.8] - 2023-09-08

### Fixed
- Fix for v2.0.7 with invalid property access (issue #14)

## [2.0.7] - 2023-08-24

### Fixed
- Query params are unnecessary cleared in redirect-uri when using redirect strategy

## [2.0.6] - 2022-06-22

### Documentation
- Fix typo in readme file

## [2.0.5] - 2022-03-03

### Documentation
- Update example in readme file

## [2.0.4] - 2022-03-03

### Changed
- Switch to custom sjcl build (#10)

### Added
- Support path option

## [2.0.3] - 2021-06-14

### Fixed
- Fixed typo in AccountsSDK export

## [2.0.2] - 2021-04-19

### Fixed
- Fix for variables

### Added
- Add required fields
- Add default verify state
- Post message data validation

## [2.0.0] - 2020-12-28

### Added
- Initial 2.0 release with ITP (Intelligent Tracking Prevention) support
- Request storage access functionality
- ES6 export/import support
- Comprehensive test suite
- Error descriptions

### Changed
- Restored CommonJS build
- Updated build script

### Documentation
- Updated readme with new features and usage

[Unreleased]: https://github.com/livechat/accounts-sdk/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/livechat/accounts-sdk/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/livechat/accounts-sdk/compare/v2.2.3...v2.3.0
[2.2.3]: https://github.com/livechat/accounts-sdk/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/livechat/accounts-sdk/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/livechat/accounts-sdk/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/livechat/accounts-sdk/compare/v2.1.3...v2.2.0
[2.1.3]: https://github.com/livechat/accounts-sdk/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/livechat/accounts-sdk/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/livechat/accounts-sdk/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/livechat/accounts-sdk/compare/v2.0.10...v2.1.0
[2.0.10]: https://github.com/livechat/accounts-sdk/compare/v2.0.9...v2.0.10
[2.0.9]: https://github.com/livechat/accounts-sdk/compare/v2.0.8...v2.0.9
[2.0.8]: https://github.com/livechat/accounts-sdk/compare/v2.0.7...v2.0.8
[2.0.7]: https://github.com/livechat/accounts-sdk/compare/v2.0.6...v2.0.7
[2.0.6]: https://github.com/livechat/accounts-sdk/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/livechat/accounts-sdk/compare/v2.0.4...v2.0.5
[2.0.4]: https://github.com/livechat/accounts-sdk/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/livechat/accounts-sdk/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/livechat/accounts-sdk/compare/2.0...v2.0.2
[2.0.0]: https://github.com/livechat/accounts-sdk/releases/tag/2.0
