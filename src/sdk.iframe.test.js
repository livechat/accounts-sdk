import SDK from './sdk';

describe('Iframe Flow', function () {
  let sdk;

  beforeEach(function () {
    jest.useFakeTimers();
    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
  });

  afterEach(function () {
    jest.useRealTimers();
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
});
