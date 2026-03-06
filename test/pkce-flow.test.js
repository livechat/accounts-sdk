import url from 'url';
import qs from 'qs';

import SDK from '../src/sdk';

describe('PKCE Flow', function () {
  it('should include PKCE parameters for code response type', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'code',
      redirect_uri: 'https://example.com/callback',
      pkce: {
        enabled: true,
        code_verifier: 'test-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-plain-method',
        code_challange_method: 'plain',
      },
    });

    const authUrl = sdk.authorizeURL({ state: 'test-state' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.code_challenge).toBe('test-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-plain-method');
    expect(query.code_challenge_method).toBe('plain');
    expect(query.code_verifier).toBeUndefined(); // Should not be in URL
  });

  it('should not include PKCE parameters for token response type', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'token',
    });

    const authUrl = sdk.authorizeURL();
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.code_challenge).toBeUndefined();
    expect(query.code_challenge_method).toBeUndefined();
  });

  it('should use plain method when specified', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'code',
      redirect_uri: 'https://example.com/callback',
      pkce: {
        enabled: true,
        code_verifier: 'test-plain-verifier-1234567890-abcdefghijklmnopqrstuvwxyz',
        code_challange_method: 'plain',
      },
    });

    const authUrl = sdk.authorizeURL({ state: 'test-state' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.code_challenge).toBe('test-plain-verifier-1234567890-abcdefghijklmnopqrstuvwxyz');
    expect(query.code_challenge_method).toBe('plain');
  });

  it('should use custom code verifier when provided', function () {
    const customVerifier = 'my-custom-verifier-that-is-long-enough-to-meet-requirements-1234567890';

    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'code',
      redirect_uri: 'https://example.com/callback',
      pkce: {
        enabled: true,
        code_verifier: customVerifier,
        code_challange_method: 'plain',
      },
    });

    const authUrl = sdk.authorizeURL({ state: 'test-state' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.code_challenge).toBe(customVerifier);
    expect(query.code_verifier).toBeUndefined(); // Should not be in URL
  });

  it('should not include PKCE when disabled', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'code',
      pkce: {
        enabled: false,
      },
    });

    const authUrl = sdk.authorizeURL();
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.code_challenge).toBeUndefined();
    expect(query.code_challenge_method).toBeUndefined();
  });
});
