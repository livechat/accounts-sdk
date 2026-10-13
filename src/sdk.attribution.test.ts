import SDK from './sdk';
import Storage from './helpers/storage';
import {type SDKOptions} from './types/sdk';

const attribution = {
  source_id: 'pricing-hero',
  source_type: 'website',
  source_url: 'https://text.com/pricing/?utm_source=google&partner=a+b',
  landing_page: 'https://text.com/features/',
  referrer: 'https://search.example/',
  internal_campaign: 'website-banner',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'Autumn + winter',
  utm_term: 'customer service',
  utm_content: 'żółty & blue',
};

function makeSDK(options: Partial<SDKOptions> = {}) {
  const sdk = new SDK({client_id: 'test-client', ...options});
  sdk.redirectUriParamsPersister.persister.storage = new Storage({force_local_storage: true});
  return sdk;
}

describe('redirect attribution', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it.each(['token', 'code'] as const)('preserves explicit tracking across a %s roundtrip', async (response_type) => {
    const options = {response_type, redirect_uri: `${window.location.origin}/callback`};
    const sdk = makeSDK({...options, tracking: attribution});
    const outgoing = new URL(sdk.authorizeURL({state: 'roundtrip'}));
    expect(outgoing.searchParams.get('redirect_uri')).toBe(options.redirect_uri);
    for (const [key, value] of Object.entries(attribution)) {
      expect(outgoing.searchParams.get(key)).toBe(value);
    }

    const callback = new URLSearchParams({
      ...Object.fromEntries(Object.keys(attribution).map((key) => [key, 'callback-default'])),
      source_url: '',
      state: 'roundtrip',
      code: 'new-code',
    });
    const hash = response_type === 'token'
      ? '#access_token=new-token&token_type=Bearer&expires_in=3600&state=roundtrip'
      : '';
    window.history.replaceState(null, '', `/callback?${callback}${hash}`);

    const freshSDK = makeSDK(options);
    const result = await freshSDK.redirect().authorizeData();
    expect(result.state).toBe('roundtrip');
    expect(result.type).toBe(response_type);
    const restored = new URL(window.location.href);
    for (const [key, value] of Object.entries(attribution)) {
      expect(restored.searchParams.get(key)).toBe(value);
    }
    expect(restored.searchParams.get('code')).toBe('new-code');
    if (result.type === 'token') expect(result.access_token).toBe('new-token');
    if (result.type === 'code') expect(result.code).toBe('new-code');
  });

  it('restores external UTMs from the landing URL with the default redirect URI', async () => {
    window.history.replaceState(null, '', `/landing?${new URLSearchParams(attribution)}`);
    makeSDK({response_type: 'code'}).authorizeURL({state: 'landing'});
    window.history.replaceState(null, '', '/landing?code=new&state=landing&utm_source=internal');
    await makeSDK({response_type: 'code'}).redirect().authorizeData();
    const params = new URL(window.location.href).searchParams;
    for (const [key, value] of Object.entries(attribution)) {
      expect(params.get(key)).toBe(value);
    }
  });

  it.each(['', 'button'])('forwards explicit attribution without UTM defaults for flow "%s"', (flow) => {
    const external = new URL(makeSDK({tracking: attribution}).authorizeURL({}, flow)).searchParams;
    for (const [key, value] of Object.entries(attribution)) {
      expect(external.get(key)).toBe(value);
    }
    const sdk = makeSDK({tracking: {source_url: attribution.source_url, internal_campaign: 'caller-campaign'}});
    const params = new URL(sdk.authorizeURL({}, flow)).searchParams;
    expect(params.get('source_url')).toBe(attribution.source_url);
    expect(params.get('internal_campaign')).toBe('caller-campaign');
    expect([...params.keys()].filter((key) => key.startsWith('utm_'))).toEqual([]);
    const defaults = new URL(makeSDK().authorizeURL({}, flow)).searchParams;
    expect(defaults.has('internal_campaign')).toBe(false);
    expect(defaults.has('source_url')).toBe(false);
    expect([...defaults.keys()].filter((key) => key.startsWith('utm_'))).toEqual([]);
  });
});
