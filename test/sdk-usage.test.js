import url from 'url';
import expect from 'expect.js';
import qs from 'qs';
import { describe, it, beforeEach, afterEach } from 'mocha';

import SDK from '../src/sdk';

describe('SDK - Comprehensive Usage Tests', function () {
  let sdk;
  let originalOpen;

  beforeEach(function () {
    // Save original values
    originalOpen = window.open;

    // Mock window.screen if not exists
    if (!window.screen) {
      window.screen = {
        width: 1920,
        height: 1080,
      };
    }

    // Mock window.open
    window.open = function () {
      return { focus: () => {} };
    };

    // Ensure document.requestStorageAccess is not set
    if (document.requestStorageAccess) {
      document.requestStorageAccess = undefined;
    }
  });

  afterEach(function () {
    // Restore originals
    if (originalOpen) {
      window.open = originalOpen;
    }
    // Reset location properties
    window.location.hash = '';
    window.location.search = '';
  });

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

  describe('Authorization URL Generation', function () {
    beforeEach(function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        redirect_uri: 'https://example.com/app',
      });
    });

    it('should generate valid authorization URL with basic params', function () {
      const authUrl = sdk.authorizeURL({ state: 'test-state-123' });
      const parsed = url.parse(authUrl);
      const query = qs.parse(parsed.query);

      expect(parsed.protocol).to.be('https:');
      expect(parsed.host).to.be('accounts.livechat.com');
      expect(query.client_id).to.be('test-client-id');
      expect(query.response_type).to.be('token');
      expect(query.redirect_uri).to.be('https://example.com/app');
      expect(query.state).to.be('test-state-123');
    });

    it('should include organization_id when provided', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        organization_id: 'org-123',
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.organization_id).to.be('org-123');
    });

    it('should include scope when provided', function () {
      const authUrl = sdk.authorizeURL({ scope: 'read write' });
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.scope).to.be('read write');
    });

    it('should not include scope when set to null', function () {
      sdk = new SDK({ client_id: 'test-client-id', scope: null });
      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.scope).to.be(undefined);
    });

    it('should include prompt parameter', function () {
      const authUrl = sdk.authorizeURL({ prompt: 'consent' });
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.prompt).to.be('consent');
    });

    it('should include email hint', function () {
      const authUrl = sdk.authorizeURL({ email_hint: 'user@example.com' });
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.email).to.be('user@example.com');
    });

    it('should include tracking parameters', function () {
      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.utm_source).to.be('accounts.livechat.com');
      expect(query.utm_medium).to.be('accounts-sdk');
    });

    it('should use custom tracking parameters', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        tracking: {
          utm_source: 'custom-source',
          utm_campaign: 'custom-campaign',
        },
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.utm_source).to.be('custom-source');
      expect(query.utm_campaign).to.be('custom-campaign');
    });

    it('should use manual popup flow path', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        popup_flow: 'manual',
      });

      const authUrl = sdk.authorizeURL();
      const parsed = url.parse(authUrl);

      expect(parsed.pathname).to.be('/signin');
    });

    it('should use custom path when provided', function () {
      const authUrl = sdk.authorizeURL({ path: '/signup' });
      const parsed = url.parse(authUrl);

      expect(parsed.pathname).to.be('/signup');
    });

    it('should combine manual popup flow with custom path', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        popup_flow: 'manual',
      });

      const authUrl = sdk.authorizeURL({ path: '/signup' });
      const parsed = url.parse(authUrl);

      expect(parsed.pathname).to.be('/signin/signup');
    });

    it('should use custom server URL', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        server_url: 'https://custom.accounts.com',
      });

      const authUrl = sdk.authorizeURL();
      const parsed = url.parse(authUrl);

      expect(parsed.host).to.be('custom.accounts.com');
    });

    it('should add flow parameter for button flows', function () {
      const authUrl = sdk.authorizeURL({}, 'button');
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.flow).to.be('button');
    });

    it('should use different states when provided', function () {
      const authUrl1 = sdk.authorizeURL({ state: 'state1' });
      const authUrl2 = sdk.authorizeURL({ state: 'state2' });

      const query1 = qs.parse(url.parse(authUrl1).query);
      const query2 = qs.parse(url.parse(authUrl2).query);

      expect(query1.state).to.be('state1');
      expect(query2.state).to.be('state2');
      expect(query1.state).not.to.be(query2.state);
    });

    it('should use provided state', function () {
      const authUrl = sdk.authorizeURL({ state: 'custom-state-123' });
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.state).to.be('custom-state-123');
    });

    it('should override constructor options with method options', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        organization_id: 'org-original',
        prompt: 'original',
      });

      const authUrl = sdk.authorizeURL({
        organization_id: 'org-override',
        prompt: 'consent',
      });

      const query = qs.parse(url.parse(authUrl).query);

      expect(query.organization_id).to.be('org-override');
      expect(query.prompt).to.be('consent');
    });
  });

  describe('PKCE Flow', function () {
    it('should include PKCE parameters for code response type', function () {
      sdk = new SDK({
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

      expect(query.code_challenge).to.be('test-verifier-1234567890-abcdefghijklmnopqrstuvwxyz-plain-method');
      expect(query.code_challenge_method).to.be('plain');
      expect(query.code_verifier).to.be(undefined); // Should not be in URL
    });

    it('should not include PKCE parameters for token response type', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'token',
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.code_challenge).to.be(undefined);
      expect(query.code_challenge_method).to.be(undefined);
    });

    it('should use plain method when specified', function () {
      sdk = new SDK({
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

      expect(query.code_challenge).to.be('test-plain-verifier-1234567890-abcdefghijklmnopqrstuvwxyz');
      expect(query.code_challenge_method).to.be('plain');
    });

    it('should use custom code verifier when provided', function () {
      const customVerifier = 'my-custom-verifier-that-is-long-enough-to-meet-requirements-1234567890';

      sdk = new SDK({
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

      expect(query.code_challenge).to.be(customVerifier);
      expect(query.code_verifier).to.be(undefined); // Should not be in URL
    });

    it('should not include PKCE when disabled', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'code',
        pkce: {
          enabled: false,
        },
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.code_challenge).to.be(undefined);
      expect(query.code_challenge_method).to.be(undefined);
    });
  });

  describe('Authentication Flows', function () {
    beforeEach(function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        redirect_uri: 'https://example.com/app',
      });
    });

    describe('Popup Flow', function () {
      it('should create popup instance', function () {
        const popup = sdk.popup();
        expect(popup).to.be.an('object');
        expect(popup.authorize).to.be.a('function');
      });

      it('should allow option overrides in popup', function () {
        const popup = sdk.popup({
          organization_id: 'org-override',
          prompt: 'consent',
        });

        expect(popup.options.organization_id).to.be('org-override');
        expect(popup.options.prompt).to.be('consent');
      });

      it('should return promise from popup authorize', function () {
        const popup = sdk.popup();
        const result = popup.authorize();
        expect(result).to.be.a(Promise);
      });
    });

    describe('Iframe Flow', function () {
      it('should create iframe instance', function () {
        const iframe = sdk.iframe();
        expect(iframe).to.be.an('object');
        expect(iframe.authorize).to.be.a('function');
      });

      it('should allow option overrides in iframe', function () {
        const iframe = sdk.iframe({
          organization_id: 'org-override',
          email_hint: 'test@example.com',
        });

        expect(iframe.options.organization_id).to.be('org-override');
        expect(iframe.options.email_hint).to.be('test@example.com');
      });

      it('should return promise from iframe authorize', function () {
        const iframe = sdk.iframe();
        const result = iframe.authorize();
        expect(result).to.be.a(Promise);
      });
    });

    describe('Redirect Flow', function () {
      it('should create redirect instance', function () {
        const redirect = sdk.redirect();
        expect(redirect).to.be.an('object');
        expect(redirect.authorize).to.be.a('function');
        expect(redirect.authorizeData).to.be.a('function');
      });

      it('should allow option overrides in redirect', function () {
        const redirect = sdk.redirect({
          response_type: 'code',
          scope: 'read write',
        });

        expect(redirect.options.response_type).to.be('code');
        expect(redirect.options.scope).to.be('read write');
      });

      it('should return promise from redirect authorizeData', function () {
        const redirect = sdk.redirect();
        const result = redirect.authorizeData();
        expect(result).to.be.a(Promise);
      });

      it('should reject when required token fields are missing', function (done) {
        window.location.hash = '#state=xyz'; // Missing access_token

        const redirect = sdk.redirect();
        redirect
          .authorizeData()
          .then(() => {
            done(new Error('Should have rejected'));
          })
          .catch((err) => {
            expect(err.identity_exception).to.be('unauthorized');
            done();
          });
      });

      it('should reject when code is missing for code response type', function (done) {
        window.location.search = '?state=xyz'; // Missing code

        sdk = new SDK({
          client_id: 'test-client-id',
          response_type: 'code',
        });

        const redirect = sdk.redirect();
        redirect
          .authorizeData()
          .then(() => {
            done(new Error('Should have rejected'));
          })
          .catch((err) => {
            expect(err.identity_exception).to.be('unauthorized');
            done();
          });
      });
    });
  });

  describe('State Verification', function () {
    beforeEach(function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        redirect_uri: 'https://example.com/app',
      });
    });

    it('should return null for non-matching state', function () {
      const result = sdk.verify({ state: 'invalid-state' });
      expect(result).to.be(null);
    });

    it('should skip verification when verify_state is false', function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        verify_state: false,
      });

      // Even without generating a transaction, verification should pass
      const result = sdk.verify({ state: 'any-state' });
      expect(result).to.be.ok();
    });
  });

  describe('Real-world Usage Scenarios', function () {
    it('should handle complete popup authentication flow', function () {
      // Initialize SDK
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        organization_id: 'my-org',
      });

      // Create popup and get authorization URL
      sdk.popup();
      const authUrl = sdk.authorizeURL({}, 'button');

      // Verify URL contains expected parameters
      const query = qs.parse(url.parse(authUrl).query);
      expect(query.client_id).to.be('my-app-client-id');
      expect(query.organization_id).to.be('my-org');
      expect(query.flow).to.be('button');
    });

    it('should handle complete redirect flow with code grant', function () {
      // Initialize SDK with code grant
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        response_type: 'code',
        redirect_uri: 'https://myapp.com/callback',
        pkce: {
          enabled: true,
          // eslint-disable-next-line max-len
          code_verifier: 'explicit-verifier-for-testing-purposes-1234567890-abcdefghijklmnopqrstuvwxyz-1234567890-abcdefghijklmnopqrstuvwxyz',
          code_challange_method: 'plain',
        },
      });

      // Generate authorization URL
      const authUrl = sdk.authorizeURL({ state: 'test-state' });
      const query = qs.parse(url.parse(authUrl).query);

      // Verify PKCE is included
      expect(query.response_type).to.be('code');
      expect(query.code_challenge).to.be.ok();
      expect(query.code_challenge_method).to.be('plain');
      expect(query.redirect_uri).to.be('https://myapp.com/callback');
    });

    it('should handle signup flow with email hint', function () {
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        path: '/signup',
        email_hint: 'user@example.com',
      });

      const authUrl = sdk.authorizeURL();
      const parsed = url.parse(authUrl);
      const query = qs.parse(parsed.query);

      expect(parsed.pathname).to.be('/signup');
      expect(query.email).to.be('user@example.com');
    });

    it('should handle force consent prompt', function () {
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        prompt: 'consent',
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.prompt).to.be('consent');
    });

    it('should handle custom scopes', function () {
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        scope: 'accounts--all:ro chats--all:rw',
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.scope).to.be('accounts--all:ro chats--all:rw');
    });

    it('should handle custom tracking parameters for analytics', function () {
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        tracking: {
          utm_source: 'my-website',
          utm_medium: 'banner',
          utm_campaign: 'summer-2024',
          custom_param: 'custom-value',
        },
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.utm_source).to.be('my-website');
      expect(query.utm_medium).to.be('banner');
      expect(query.utm_campaign).to.be('summer-2024');
      expect(query.custom_param).to.be('custom-value');
    });

    it('should handle organization-specific authentication', function () {
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        organization_id: 'acme-corp-123',
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.organization_id).to.be('acme-corp-123');
    });

    it('should allow dynamic option overrides per authentication', function () {
      const sdk = new SDK({
        client_id: 'my-app-client-id',
        organization_id: 'default-org',
      });

      // First authentication with default org
      const authUrl1 = sdk.authorizeURL();
      const query1 = qs.parse(url.parse(authUrl1).query);
      expect(query1.organization_id).to.be('default-org');

      // Second authentication with different org
      const authUrl2 = sdk.authorizeURL({ organization_id: 'other-org' });
      const query2 = qs.parse(url.parse(authUrl2).query);
      expect(query2.organization_id).to.be('other-org');
    });
  });

  describe('Edge Cases and Error Handling', function () {
    it('should handle empty options object', function () {
      expect(() => new SDK({})).to.throwError();
    });

    it('should handle undefined options', function () {
      expect(() => new SDK()).to.throwError();
    });

    it('should handle null scope correctly', function () {
      const sdk = new SDK({
        client_id: 'test-client-id',
        scope: null,
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.scope).to.be(undefined);
    });

    it('should handle empty string values', function () {
      const sdk = new SDK({
        client_id: 'test-client-id',
        organization_id: '',
        prompt: '',
        state: '',
      });

      expect(sdk.options.organization_id).to.be('');
      expect(sdk.options.prompt).to.be('');
      expect(sdk.options.state).to.be('');
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

      expect(state1).not.to.be(state2);
      expect(state2).not.to.be(state3);
      expect(state1).not.to.be(state3);
    });

    it('should handle very long custom state', function () {
      const longState = 'a'.repeat(500);
      const sdk = new SDK({ client_id: 'test-client-id' });

      const authUrl = sdk.authorizeURL({ state: longState });
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.state).to.be(longState);
    });

    it('should handle special characters in parameters', function () {
      const sdk = new SDK({
        client_id: 'test-client-id',
        email_hint: 'user+test@example.com',
      });

      const authUrl = sdk.authorizeURL();
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.email).to.be('user+test@example.com');
    });
  });

  describe('Transaction Management', function () {
    beforeEach(function () {
      sdk = new SDK({
        client_id: 'test-client-id',
        redirect_uri: 'https://example.com/app',
        transaction: {
          namespace: 'test.namespace',
          key_length: 16,
        },
      });
    });

    it('should initialize transaction manager with correct namespace', function () {
      expect(sdk.transaction).to.be.ok();
      expect(sdk.transaction.options.namespace).to.be('test.namespace');
    });
  });

  describe('Response Type Variations', function () {
    it('should handle token response type', function () {
      const sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'token',
        redirect_uri: 'https://example.com/callback',
      });

      const authUrl = sdk.authorizeURL({ state: 'test-state' });
      const query = qs.parse(url.parse(authUrl).query);

      expect(query.response_type).to.be('token');
      expect(query.code_challenge).to.be(undefined);
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

      expect(query.response_type).to.be('code');
      expect(query.code_challenge).to.be.ok();
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

      expect(query.response_type).to.be('code');
      expect(query.code_challenge).to.be.ok();
    });
  });
});
