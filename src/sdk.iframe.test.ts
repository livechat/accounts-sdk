import SDK from './sdk';
import Iframe from './authentication/iframe';
import Listener from './helpers/listener';
import {type ListenerCallback} from './types/listener';
import {TokenFlowResponse} from './types/auth';

jest.mock('./helpers/listener');

describe('Iframe Flow', function () {
  let sdk: InstanceType<typeof SDK>;
  let capturedCallback: ListenerCallback | undefined;

  beforeEach(function () {
    jest.useFakeTimers();
    // Capture the callback so tests can fire it manually after the iframe is in the DOM
    jest
      .spyOn(Listener.prototype, 'start')
      .mockImplementation(function (_timeout, callback) {
        capturedCallback = callback;
      });
    jest.spyOn(Listener.prototype, 'stop').mockImplementation(jest.fn());
    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
  });

  afterEach(function () {
    jest.useRealTimers();
    capturedCallback = undefined;
    document.body.innerHTML = '';
  });

  it('should create iframe instance', function () {
    const iframe = sdk.iframe();
    expect(typeof iframe).toBe('object');
    expect(typeof iframe.authorize).toBe('function');
  });

  it('should allow option overrides in iframe', function () {
    const iframe = sdk.iframe({
      organization_id: 'org-override',
      email_hint: 'test@example.com',
    });

    expect(iframe.options.organization_id).toBe('org-override');
    expect(iframe.options.email_hint).toBe('test@example.com');
  });

  it('should return promise from iframe authorize', function () {
    const iframe = sdk.iframe();
    const result = iframe.authorize();
    result.catch(() => {});
    expect(result).toBeInstanceOf(Promise);
  });

  it('resolves with token data when listener calls back with success', async function () {
    const iframe = sdk.iframe();
    const promise = iframe.authorize();
    const tokenData: TokenFlowResponse = {
      type: 'token',
      access_token: 'tok123',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'read,write',
      state: 's',
      account_id: 'acc1',
      organization_id: 'org1',
      client_id: 'client1',
    };
    capturedCallback!(null, tokenData);
    const result = await promise;
    expect(result).toEqual(tokenData);
  });

  it('rejects with error when listener calls back with an error', async function () {
    const error = {identity_exception: 'unauthorized'};
    const iframe = sdk.iframe();
    const promise = iframe.authorize();
    capturedCallback!(error, null);
    await expect(promise).rejects.toEqual(error);
  });

  it('appends an iframe to document.body on authorize', function () {
    const iframe = sdk.iframe();
    iframe.authorize().catch(() => {});
    expect(document.getElementById(iframe.iframeID())).not.toBeNull();
  });

  it('removes the iframe from the DOM after callback fires', async function () {
    const iframe = sdk.iframe();
    const iframeID = iframe.iframeID();
    const promise = iframe.authorize();
    expect(document.getElementById(iframeID)).not.toBeNull();
    capturedCallback!(null, {
      type: 'token',
      access_token: 'tok',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'read,write',
      state: 's',
      account_id: 'a',
      organization_id: 'o',
      client_id: 'c',
    });
    await promise;
    expect(document.getElementById(iframeID)).toBeNull();
  });

  it('removeIframe is a no-op when element is not in the DOM', function () {
    const iframe = sdk.iframe();
    expect(() => iframe.removeIframe()).not.toThrow();
  });

  it('iframeID falls back to empty strings for undefined client_id and response_type', function () {
    const fakeSDK = {} as ConstructorParameters<typeof Iframe>[0];
    const iframe = new Iframe(fakeSDK, {});
    expect(iframe.iframeID()).toBe('');
  });
});
