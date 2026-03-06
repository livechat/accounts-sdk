import url from 'url';
import qs from 'qs';

import SDK from '../src/sdk';

describe('Edge Cases and Error Handling', function () {
  it('should handle empty options object', function () {
    expect(() => new SDK({})).toThrow();
  });

  it('should handle undefined options', function () {
    expect(() => new SDK()).toThrow();
  });

  it('should handle null scope correctly', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      scope: null,
    });

    const authUrl = sdk.authorizeURL();
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.scope).toBeUndefined();
  });

  it('should handle empty string values', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      organization_id: '',
      prompt: '',
      state: '',
    });

    expect(sdk.options.organization_id).toBe('');
    expect(sdk.options.prompt).toBe('');
    expect(sdk.options.state).toBe('');
  });

  it('should generate different states for concurrent authorization URLs', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });

    const authUrl1 = sdk.authorizeURL({ state: 'unique-state-1' });
    const authUrl2 = sdk.authorizeURL({ state: 'unique-state-2' });
    const authUrl3 = sdk.authorizeURL({ state: 'unique-state-3' });

    const state1 = qs.parse(url.parse(authUrl1).query).state;
    const state2 = qs.parse(url.parse(authUrl2).query).state;
    const state3 = qs.parse(url.parse(authUrl3).query).state;

    expect(state1).not.toBe(state2);
    expect(state2).not.toBe(state3);
    expect(state1).not.toBe(state3);
  });

  it('should handle very long custom state', function () {
    const longState = 'a'.repeat(500);
    const sdk = new SDK({ client_id: 'test-client-id' });

    const authUrl = sdk.authorizeURL({ state: longState });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.state).toBe(longState);
  });

  it('should handle special characters in parameters', function () {
    const sdk = new SDK({
      client_id: 'test-client-id',
      email_hint: 'user+test@example.com',
    });

    const authUrl = sdk.authorizeURL();
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.email).toBe('user+test@example.com');
  });
});
