import SDK from '../src/sdk';

describe('Transaction Management', function () {
  let sdk;

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
    expect(sdk.transaction).toBeTruthy();
    expect(sdk.transaction.options.namespace).toBe('test.namespace');
  });
});
