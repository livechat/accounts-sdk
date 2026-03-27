import qs from 'qs';

import SDK from './sdk';

function parseQuery(authUrl) {
  return qs.parse(new URL(authUrl).search, {ignoreQueryPrefix: true});
}

describe('sdk.authorizeURL()', function () {
  let sdk;

  beforeEach(function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
  });

  describe('URL structure', function () {
    it('produces a valid HTTPS URL pointing to the default server', function () {
      const authUrl = sdk.authorizeURL({ state: 'test-state-123' });
      const parsed = new URL(authUrl);
      const query = parseQuery(authUrl);

      expect(parsed.protocol).toBe('https:');
      expect(parsed.host).toBe('accounts.livechat.com');
      expect(query.client_id).toBe('test-client-id');
      expect(query.response_type).toBe('token');
      expect(query.redirect_uri).toBe('https://example.com/app');
      expect(query.state).toBe('test-state-123');
    });

    it('uses a custom server URL when provided', function () {
      sdk = new SDK({ client_id: 'test-client-id', server_url: 'https://custom.accounts.com' });
      expect(new URL(sdk.authorizeURL()).host).toBe('custom.accounts.com');
    });
  });

  describe('path', function () {
    it('appends /signin for manual popup_flow', function () {
      sdk = new SDK({ client_id: 'test-client-id', popup_flow: 'manual' });
      expect(new URL(sdk.authorizeURL()).pathname).toBe('/signin');
    });

    it('appends a custom path', function () {
      expect(new URL(sdk.authorizeURL({ path: '/signup' })).pathname).toBe('/signup');
    });

    it('combines /signin prefix with a custom path', function () {
      sdk = new SDK({ client_id: 'test-client-id', popup_flow: 'manual' });
      expect(new URL(sdk.authorizeURL({ path: '/signup' })).pathname).toBe('/signin/signup');
    });
  });

  describe('query params', function () {
    it('includes organization_id', function () {
      sdk = new SDK({ client_id: 'test-client-id', organization_id: 'org-123' });
      expect(parseQuery(sdk.authorizeURL()).organization_id).toBe('org-123');
    });

    it('includes scope', function () {
      expect(parseQuery(sdk.authorizeURL({ scope: 'read write' })).scope).toBe('read write');
    });

    it('omits scope when null', function () {
      sdk = new SDK({ client_id: 'test-client-id', scope: null });
      expect(parseQuery(sdk.authorizeURL()).scope).toBeUndefined();
    });

    it('includes prompt', function () {
      expect(parseQuery(sdk.authorizeURL({ prompt: 'consent' })).prompt).toBe('consent');
    });

    it('maps email_hint to the email param', function () {
      expect(parseQuery(sdk.authorizeURL({ email_hint: 'user@example.com' })).email).toBe(
        'user@example.com'
      );
    });

    it('includes default tracking params', function () {
      const query = parseQuery(sdk.authorizeURL());
      expect(query.utm_source).toBe('accounts.livechat.com');
      expect(query.utm_medium).toBe('accounts-sdk');
    });

    it('uses custom tracking params', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        tracking: { utm_source: 'custom-source', utm_campaign: 'custom-campaign' },
      });
      const query = parseQuery(sdk.authorizeURL());
      expect(query.utm_source).toBe('custom-source');
      expect(query.utm_campaign).toBe('custom-campaign');
    });

    it('sets the flow param', function () {
      expect(parseQuery(sdk.authorizeURL({}, 'button')).flow).toBe('button');
    });

    it('uses the provided state', function () {
      expect(parseQuery(sdk.authorizeURL({ state: 'custom-state-123' })).state).toBe(
        'custom-state-123'
      );
    });

    it('method options override constructor options', function () {
      sdk = new SDK({ client_id: 'test-client-id', organization_id: 'original', prompt: 'original' });
      const query = parseQuery(sdk.authorizeURL({ organization_id: 'override', prompt: 'consent' }));
      expect(query.organization_id).toBe('override');
      expect(query.prompt).toBe('consent');
    });

    it('each call can use a different state', function () {
      const q1 = parseQuery(sdk.authorizeURL({ state: 'state1' }));
      const q2 = parseQuery(sdk.authorizeURL({ state: 'state2' }));
      expect(q1.state).toBe('state1');
      expect(q2.state).toBe('state2');
    });
  });

  describe('response types', function () {
    it('token type includes no PKCE params', function () {
      sdk = new SDK({ client_id: 'test-client-id', response_type: 'token' });
      const query = parseQuery(sdk.authorizeURL({ state: 'test-state' }));
      expect(query.response_type).toBe('token');
      expect(query.code_challenge).toBeUndefined();
    });

    it('code type includes PKCE params', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'code',
        pkce: {
          enabled: true,
          code_verifier: 'test-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-1234567890',
          code_challange_method: 'plain',
        },
      });
      const query = parseQuery(sdk.authorizeURL({ state: 'test-state' }));
      expect(query.response_type).toBe('code');
      expect(query.code_challenge).toBeTruthy();
    });

    it('response type can be overridden per call', function () {
      sdk = new SDK({ client_id: 'test-client-id', response_type: 'token' });
      const query = parseQuery(
        sdk.authorizeURL({
          response_type: 'code',
          state: 'test-state',
          pkce: {
            enabled: true,
            code_verifier: 'override-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-1234567890',
            code_challange_method: 'plain',
          },
        })
      );
      expect(query.response_type).toBe('code');
      expect(query.code_challenge).toBeTruthy();
    });
  });

  describe('PKCE', function () {
    it('includes code_challenge and code_challenge_method for code flow', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'code',
        pkce: {
          enabled: true,
          code_verifier: 'test-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-plain-method',
          code_challange_method: 'plain',
        },
      });
      const query = parseQuery(sdk.authorizeURL({ state: 'test-state' }));
      expect(query.code_challenge).toBe(
        'test-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-plain-method'
      );
      expect(query.code_challenge_method).toBe('plain');
      expect(query.code_verifier).toBeUndefined();
    });

    it('omits PKCE params for token flow', function () {
      sdk = new SDK({ client_id: 'test-client-id', response_type: 'token' });
      const query = parseQuery(sdk.authorizeURL());
      expect(query.code_challenge).toBeUndefined();
      expect(query.code_challenge_method).toBeUndefined();
    });

    it('uses plain method when specified', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'code',
        pkce: {
          enabled: true,
          code_verifier: 'test-plain-verifier-1234567890-abcdefghijklmnopqrstuvwxyz',
          code_challange_method: 'plain',
        },
      });
      const query = parseQuery(sdk.authorizeURL({ state: 'test-state' }));
      expect(query.code_challenge).toBe(
        'test-plain-verifier-1234567890-abcdefghijklmnopqrstuvwxyz'
      );
      expect(query.code_challenge_method).toBe('plain');
    });

    it('uses a custom code_verifier when provided', function () {
      const customVerifier =
        'my-custom-verifier-that-is-long-enough-to-meet-requirements-1234567890';
      sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'code',
        pkce: { enabled: true, code_verifier: customVerifier, code_challange_method: 'plain' },
      });
      const query = parseQuery(sdk.authorizeURL({ state: 'test-state' }));
      expect(query.code_challenge).toBe(customVerifier);
      expect(query.code_verifier).toBeUndefined();
    });

    it('omits PKCE when disabled', function () {
      sdk = new SDK({ client_id: 'test-client-id', response_type: 'code', pkce: { enabled: false } });
      const query = parseQuery(sdk.authorizeURL());
      expect(query.code_challenge).toBeUndefined();
      expect(query.code_challenge_method).toBeUndefined();
    });
  });

  describe('edge cases', function () {
    it('handles empty string option values', function () {
      sdk = new SDK({ client_id: 'test-client-id', organization_id: '', prompt: '', state: '' });
      expect(sdk.options.organization_id).toBe('');
      expect(sdk.options.prompt).toBe('');
      expect(sdk.options.state).toBe('');
    });

    it('produces unique states across concurrent calls', function () {
      const states = ['unique-1', 'unique-2', 'unique-3'].map(
        (s) => parseQuery(sdk.authorizeURL({ state: s })).state
      );
      expect(new Set(states).size).toBe(3);
    });

    it('handles a very long state value', function () {
      const longState = 'a'.repeat(500);
      expect(parseQuery(sdk.authorizeURL({ state: longState })).state).toBe(longState);
    });

    it('handles special characters in params (e.g. + in email)', function () {
      sdk = new SDK({ client_id: 'test-client-id', email_hint: 'user+test@example.com' });
      expect(parseQuery(sdk.authorizeURL()).email).toBe('user+test@example.com');
    });
  });
});
