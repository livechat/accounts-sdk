import SDK from './sdk';
import Listener, {ListenerCallback} from './helpers/listener';

jest.mock('./helpers/listener');

describe('Iframe Flow', function () {
  let sdk: InstanceType<typeof SDK>;
  let capturedCallback: ListenerCallback | undefined;

  beforeEach(function () {
    jest.useFakeTimers();
    // Capture the callback so tests can fire it manually after the iframe is in the DOM
    jest
      .spyOn(Listener.prototype, 'start')
      .mockImplementation(function (timeout, callback) {
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
    capturedCallback!(null, {access_token: 'tok123', token_type: 'Bearer'});
    const result = await promise;
    expect((result as Record<string, unknown>).access_token).toBe('tok123');
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
    capturedCallback!(null, {access_token: 'tok'});
    await promise;
    expect(document.getElementById(iframeID)).toBeNull();
  });

  it('removeIframe is a no-op when element is not in the DOM', function () {
    const iframe = sdk.iframe();
    expect(() => iframe.removeIframe()).not.toThrow();
  });
});
