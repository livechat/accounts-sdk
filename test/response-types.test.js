import url from 'url';
import qs from 'qs';

import SDK from '../src/sdk';

describe('Response Type Variations', function () {
  it('should handle token response type', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'token',
      redirect_uri: 'https://example.com/callback',
    });

    const authUrl = sdk.authorizeURL({ state: 'test-state' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.response_type).toBe('token');
    expect(query.code_challenge).toBeUndefined();
  });

  it('should handle code response type', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'code',
      redirect_uri: 'https://example.com/callback',
      pkce: {
        enabled: true,
        code_verifier: 'test-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-1234567890',
        code_challange_method: 'plain',
      },
    });

    const authUrl = sdk.authorizeURL({ state: 'test-state' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.response_type).toBe('code');
    expect(query.code_challenge).toBeTruthy();
  });

  it('should allow overriding response type per request', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      response_type: 'token',
      redirect_uri: 'https://example.com/callback',
    });

    const authUrl = sdk.authorizeURL({
      response_type: 'code',
      state: 'test-state',
      pkce: {
        enabled: true,
        code_verifier: 'override-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-1234567890',
        code_challange_method: 'plain',
      },
    });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.response_type).toBe('code');
    expect(query.code_challenge).toBeTruthy();
  });
});
