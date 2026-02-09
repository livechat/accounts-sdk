import url from 'url';
import expect from 'expect.js';
import qs from 'qs';
import { describe, it } from 'mocha';

import SDK from '../src/sdk';

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
