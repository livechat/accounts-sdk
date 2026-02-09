import expect from 'expect.js';
import { describe, it } from 'mocha';

import SDK from '../src/sdk';

describe('SDK Initialization', function () {
  it('should throw error when client_id is missing', function () {
    expect(() => new SDK()).to.throwError(/client id not provided/);
    expect(() => new SDK({})).to.throwError(/client id not provided/);
    expect(() => new SDK({ client_id: null })).to.throwError(
      /client id not provided/
    );
  });

  it('should initialize with required client_id', function () {
    const sdk = new SDK({ client_id: 'test-client-id' });
    expect(sdk).to.be.an('object');
    expect(sdk.options.client_id).to.be('test-client-id');
  });

  it('should use default options when not provided', function () {
    const sdk = new SDK({ client_id: 'test-client-id' });

    expect(sdk.options.response_type).to.be('token');
    expect(sdk.options.popup_flow).to.be('auto');
    expect(sdk.options.verify_state).to.be(true);
    expect(sdk.options.server_url).to.be('https://accounts.livechat.com');
    expect(sdk.options.organization_id).to.be('');
    expect(sdk.options.prompt).to.be('');
    expect(sdk.options.state).to.be('');
    expect(sdk.options.redirect_uri).to.be('');
  });

  it('should merge custom options with defaults', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      organization_id: 'org-123',
      response_type: 'code',
      server_url: 'https://custom.server.com',
      prompt: 'consent',
    });

    expect(sdk.options.client_id).to.be('test-client-id');
    expect(sdk.options.organization_id).to.be('org-123');
    expect(sdk.options.response_type).to.be('code');
    expect(sdk.options.server_url).to.be('https://custom.server.com');
    expect(sdk.options.prompt).to.be('consent');
    // Defaults should still be present
    expect(sdk.options.popup_flow).to.be('auto');
  });

  it('should initialize with PKCE enabled by default', function () {
    const sdk = new SDK({ client_id: 'test-client-id' });

    expect(sdk.options.pkce.enabled).to.be(true);
    expect(sdk.options.pkce.code_verifier_length).to.be(128);
    expect(sdk.options.pkce.code_challange_method).to.be('S256');
  });

  it('should allow custom PKCE configuration', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      pkce: {
        enabled: false,
        code_verifier_length: 64,
        code_challange_method: 'plain',
      },
    });

    expect(sdk.options.pkce.enabled).to.be(false);
    expect(sdk.options.pkce.code_verifier_length).to.be(64);
    expect(sdk.options.pkce.code_challange_method).to.be('plain');
  });

  it('should initialize transaction manager', function () {
    const sdk = new SDK({ client_id: 'test-client-id' });
    expect(sdk.transaction).to.be.an('object');
  });

  it('should initialize redirect URI params persister', function () {
    const sdk = new SDK({ client_id: 'test-client-id' });
    expect(sdk.redirectUriParamsPersister).to.be.an('object');
  });
});
