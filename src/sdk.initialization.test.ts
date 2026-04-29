import SDK from './sdk';

describe('SDK Initialization', function () {
  afterEach(function () {
    jest.restoreAllMocks();
  });

  it('should throw error when client_id is missing', function () {
    // Intentionally test invalid inputs — @ts-expect-error bypasses TypeScript's argument checks
    // @ts-expect-error — testing runtime validation with missing args
    expect(() => new SDK()).toThrow(/client id not provided/);
    // @ts-expect-error — testing runtime validation with empty object
    expect(() => new SDK({})).toThrow(/client id not provided/);
    // @ts-expect-error — testing runtime validation with null client_id
    expect(() => new SDK({client_id: null})).toThrow(/client id not provided/);
  });

  it('should initialize with required client_id', function () {
    const sdk = new SDK({client_id: 'test-client-id'});
    expect(typeof sdk).toBe('object');
    expect(sdk.options.client_id).toBe('test-client-id');
  });

  it('should use default options when not provided', function () {
    const sdk = new SDK({client_id: 'test-client-id'});

    expect(sdk.options.response_type).toBe('token');
    expect(sdk.options.popup_flow).toBe('auto');
    expect(sdk.options.verify_state).toBe(true);
    expect(sdk.options.server_url).toBe('https://accounts.livechat.com');
    expect(sdk.options.organization_id).toBe('');
    expect(sdk.options.prompt).toBe('');
    expect(sdk.options.state).toBe('');
    expect(sdk.options.redirect_uri).toBe('');
  });

  it('should merge custom options with defaults', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      organization_id: 'org-123',
      response_type: 'code',
      server_url: 'https://custom.server.com',
      prompt: 'consent',
    });

    expect(sdk.options.client_id).toBe('test-client-id');
    expect(sdk.options.organization_id).toBe('org-123');
    expect(sdk.options.response_type).toBe('code');
    expect(sdk.options.server_url).toBe('https://custom.server.com');
    expect(sdk.options.prompt).toBe('consent');
    expect(sdk.options.popup_flow).toBe('auto');
  });

  it('should initialize with PKCE enabled by default', function () {
    const sdk = new SDK({client_id: 'test-client-id'});

    expect(sdk.options.pkce?.enabled).toBe(true);
    expect(sdk.options.pkce?.code_verifier_length).toBe(128);
    expect(sdk.options.pkce?.code_challenge_method).toBe('S256');
  });

  it('should allow custom PKCE configuration', function () {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const sdk = new SDK({
      client_id: 'test-client-id',
      pkce: {
        enabled: false,
        code_verifier_length: 64,
        code_challange_method: 'plain',
      },
    });

    expect(sdk.options.pkce?.enabled).toBe(false);
    expect(sdk.options.pkce?.code_verifier_length).toBe(64);
    expect(sdk.options.pkce?.code_challenge_method).toBe('plain');
  });

  it('should initialize transaction manager', function () {
    const sdk = new SDK({client_id: 'test-client-id'});
    expect(typeof sdk.transaction).toBe('object');
  });

  it('should initialize redirect URI params persister', function () {
    const sdk = new SDK({client_id: 'test-client-id'});
    expect(typeof sdk.redirectUriParamsPersister).toBe('object');
  });
});
