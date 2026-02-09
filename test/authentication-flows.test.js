import expect from 'expect.js';
import { describe, it, beforeEach, afterEach } from 'mocha';

import SDK from '../src/sdk';

describe('Authentication Flows', function () {
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

    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
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

    it('should reject when required token fields are missing', async function () {
      window.location.hash = '#state=xyz'; // Missing access_token

      const redirect = sdk.redirect();
      const error = await redirect.authorizeData().catch((e) => e);
      expect(error.identity_exception).to.be('unauthorized');
    });

    it('should reject when code is missing for code response type', async function () {
      window.location.search = '?state=xyz'; // Missing code

      sdk = new SDK({
        client_id: 'test-client-id',
        response_type: 'code',
      });

      const redirect = sdk.redirect();
      const error = await redirect.authorizeData().catch((e) => e);
      expect(error.identity_exception).to.be('unauthorized');
    });
  });
});
