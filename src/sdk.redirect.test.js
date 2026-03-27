import SDK from './sdk';

describe('Redirect Flow', function () {
  let sdk;

  beforeEach(function () {
    jest.useFakeTimers();
    window.location.hash = '';
    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
  });

  afterEach(function () {
    jest.useRealTimers();
    window.location.hash = '';
    window.history.pushState(null, '', '/');
  });

  it('should create redirect instance', function () {
    const redirect = sdk.redirect();
    expect(typeof redirect).toBe('object');
    expect(typeof redirect.authorize).toBe('function');
    expect(typeof redirect.authorizeData).toBe('function');
  });

  it('should allow option overrides in redirect', function () {
    const redirect = sdk.redirect({
      response_type: 'code',
      scope: 'read write',
    });

    expect(redirect.options.response_type).toBe('code');
    expect(redirect.options.scope).toBe('read write');
  });

  it('should return promise from redirect authorizeData', function () {
    const redirect = sdk.redirect();
    const result = redirect.authorizeData();
    result.catch(() => {});
    expect(result).toBeInstanceOf(Promise);
  });

  it('should reject when required token fields are missing', async function () {
    window.location.hash = '#state=xyz';

    const redirect = sdk.redirect();
    const error = await redirect.authorizeData().catch((e) => e);
    expect(error.identity_exception).toBe('unauthorized');
  });

  it('should reject when code is missing for code response type', async function () {
    // Use pushState to set query params (avoids jsdom navigation error)
    window.history.pushState(null, '', '?state=xyz');

    sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'code',
    });

    const redirect = sdk.redirect();
    const error = await redirect.authorizeData().catch((e) => e);
    expect(error.identity_exception).toBe('unauthorized');
  });

  it('should resolve with token data from hash params', async function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      verify_state: false,
    });

    window.location.hash =
      '#access_token=tok123&token_type=Bearer&expires_in=28800&scope=read&state=somestate';

    const redirect = sdk.redirect();
    const data = await redirect.authorizeData();
    expect(data.access_token).toBe('tok123');
    expect(data.token_type).toBe('Bearer');
  });

  it('should resolve with code from query params for code flow', async function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'code',
      verify_state: false,
    });

    window.history.pushState(null, '', '?code=authcode123&state=somestate');

    const redirect = sdk.redirect();
    const data = await redirect.authorizeData();
    expect(data.code).toBe('authcode123');
  });

  it('should reject with unauthorized when error param is in hash (no error passthrough)', async function () {
    // The token flow only picks access_token/expires_in/state/scope/token_type from hash.
    // An error=access_denied hash is treated as missing required fields → unauthorized.
    window.location.hash =
      '#error=access_denied&error_description=User+denied+access&state=somestate';

    const redirect = sdk.redirect();
    const error = await redirect.authorizeData().catch((e) => e);
    expect(error.identity_exception).toBe('unauthorized');
  });
});
