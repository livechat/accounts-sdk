import url from 'url';
import qs from 'qs';

import SDK from '../src/sdk';

describe('Authorization URL Generation', function () {
  let sdk;

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

    expect(parsed.protocol).toBe('https:');
    expect(parsed.host).toBe('accounts.livechat.com');
    expect(query.client_id).toBe('test-client-id');
    expect(query.response_type).toBe('token');
    expect(query.redirect_uri).toBe('https://example.com/app');
    expect(query.state).toBe('test-state-123');
  });

  it('should include organization_id when provided', function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      organization_id: 'org-123',
    });

    const authUrl = sdk.authorizeURL();
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.organization_id).toBe('org-123');
  });

  it('should include scope when provided', function () {
    const authUrl = sdk.authorizeURL({ scope: 'read write' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.scope).toBe('read write');
  });

  it('should not include scope when set to null', function () {
    sdk = new SDK({ client_id: 'test-client-id', scope: null });
    const authUrl = sdk.authorizeURL();
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.scope).toBeUndefined();
  });

  it('should include prompt parameter', function () {
    const authUrl = sdk.authorizeURL({ prompt: 'consent' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.prompt).toBe('consent');
  });

  it('should include email hint', function () {
    const authUrl = sdk.authorizeURL({ email_hint: 'user@example.com' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.email).toBe('user@example.com');
  });

  it('should include tracking parameters', function () {
    const authUrl = sdk.authorizeURL();
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.utm_source).toBe('accounts.livechat.com');
    expect(query.utm_medium).toBe('accounts-sdk');
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

    expect(query.utm_source).toBe('custom-source');
    expect(query.utm_campaign).toBe('custom-campaign');
  });

  it('should use manual popup flow path', function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      popup_flow: 'manual',
    });

    const authUrl = sdk.authorizeURL();
    const parsed = url.parse(authUrl);

    expect(parsed.pathname).toBe('/signin');
  });

  it('should use custom path when provided', function () {
    const authUrl = sdk.authorizeURL({ path: '/signup' });
    const parsed = url.parse(authUrl);

    expect(parsed.pathname).toBe('/signup');
  });

  it('should combine manual popup flow with custom path', function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      popup_flow: 'manual',
    });

    const authUrl = sdk.authorizeURL({ path: '/signup' });
    const parsed = url.parse(authUrl);

    expect(parsed.pathname).toBe('/signin/signup');
  });

  it('should use custom server URL', function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      server_url: 'https://custom.accounts.com',
    });

    const authUrl = sdk.authorizeURL();
    const parsed = url.parse(authUrl);

    expect(parsed.host).toBe('custom.accounts.com');
  });

  it('should add flow parameter for button flows', function () {
    const authUrl = sdk.authorizeURL({}, 'button');
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.flow).toBe('button');
  });

  it('should use different states when provided', function () {
    const authUrl1 = sdk.authorizeURL({ state: 'state1' });
    const authUrl2 = sdk.authorizeURL({ state: 'state2' });

    const query1 = qs.parse(url.parse(authUrl1).query);
    const query2 = qs.parse(url.parse(authUrl2).query);

    expect(query1.state).toBe('state1');
    expect(query2.state).toBe('state2');
    expect(query1.state).not.toBe(query2.state);
  });

  it('should use provided state', function () {
    const authUrl = sdk.authorizeURL({ state: 'custom-state-123' });
    const query = qs.parse(url.parse(authUrl).query);

    expect(query.state).toBe('custom-state-123');
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

    expect(query.organization_id).toBe('org-override');
    expect(query.prompt).toBe('consent');
  });
});
