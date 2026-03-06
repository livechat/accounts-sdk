import SDK from '../src/sdk';

describe('State Verification', function () {
  let sdk;

  beforeEach(function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      redirect_uri: 'https://example.com/app',
    });
  });

  it('should return null for non-matching state', function () {
    const result = sdk.verify({ state: 'invalid-state' });
    expect(result).toBeNull();
  });

  it('should skip verification when verify_state is false', function () {
    sdk = new SDK({
      client_id: 'test-client-id',
      verify_state: false,
    });

    // Even without generating a transaction, verification should pass
    const result = sdk.verify({ state: 'any-state' });
    expect(result).toBeTruthy();
  });
});
