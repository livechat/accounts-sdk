import SDK from './sdk';
import Listener from './helpers/listener';

jest.mock('./helpers/listener');

describe('Popup Flow', function () {
  let sdk;
  let capturedCallback;
  let originalOpen;

  beforeEach(function () {
    jest.useFakeTimers();
    originalOpen = window.open;
    window.open = jest.fn();
    delete document.requestStorageAccess;

    Listener.mockImplementation(function () {
      this.start = jest.fn((_timeout, cb) => {
        capturedCallback = cb;
      });
      this.stop = jest.fn();
    });

    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
  });

  afterEach(function () {
    jest.useRealTimers();
    window.open = originalOpen;
    capturedCallback = undefined;
  });

  it('should create popup instance', function () {
    const popup = sdk.popup();
    expect(typeof popup).toBe('object');
    expect(typeof popup.authorize).toBe('function');
  });

  it('should allow option overrides in popup', function () {
    const popup = sdk.popup({
      organization_id: 'org-override',
      prompt: 'consent',
    });

    expect(popup.options.organization_id).toBe('org-override');
    expect(popup.options.prompt).toBe('consent');
  });

  it('should return promise from popup authorize', function () {
    const popup = sdk.popup();
    const result = popup.authorize();
    result.catch(() => {});
    expect(result).toBeInstanceOf(Promise);
  });

  it('resolves with token data when listener calls back with success', async function () {
    const popup = sdk.popup();
    const promise = popup.authorize();
    capturedCallback(null, { access_token: 'tok123', token_type: 'Bearer' });
    const result = await promise;
    expect(result.access_token).toBe('tok123');
  });

  it('rejects with error when listener calls back with an error', async function () {
    const error = { identity_exception: 'unauthorized' };
    const popup = sdk.popup();
    const promise = popup.authorize();
    capturedCallback(error, null);
    await expect(promise).rejects.toEqual(error);
  });

  it('opens a popup window when requestStorageAccess is not available', function () {
    const popup = sdk.popup();
    popup.authorize().catch(() => {});
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('accounts.livechat.com'),
      'livechat-login-popup',
      expect.stringContaining('width=500')
    );
  });

  it('opens a popup window after requestStorageAccess resolves', async function () {
    document.requestStorageAccess = jest.fn(() => Promise.resolve());
    const popup = sdk.popup();
    popup.authorize().catch(() => {});
    await Promise.resolve();
    await Promise.resolve();
    expect(window.open).toHaveBeenCalled();
  });

  it('opens a popup window even when requestStorageAccess rejects', async function () {
    document.requestStorageAccess = jest.fn(() => Promise.reject(new Error('denied')));
    const popup = sdk.popup();
    popup.authorize().catch(() => {});
    await Promise.resolve();
    await Promise.resolve();
    expect(window.open).toHaveBeenCalled();
  });
});
