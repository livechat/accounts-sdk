import SDK from './sdk';

describe('Popup Flow', function () {
  let sdk;
  let originalOpen;

  beforeEach(function () {
    jest.useFakeTimers();
    originalOpen = window.open;
    window.open = function () {
      return { focus: () => {} };
    };
    if (document.requestStorageAccess) {
      document.requestStorageAccess = undefined;
    }
    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
  });

  afterEach(function () {
    jest.useRealTimers();
    window.open = originalOpen;
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
});
