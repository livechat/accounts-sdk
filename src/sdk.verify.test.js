import SDK from './sdk';

// Use force_local_storage:true so transactions actually persist in jsdom
// (CookieStorage sets Secure:true which is silently rejected on HTTP)
const SDK_OPTIONS = {
  client_id: 'test-client-id',
  redirect_uri: 'https://example.com/app',
  transaction: {
    namespace: 'com.livechat.accounts',
    force_local_storage: true,
  },
};

describe('State Verification', function () {
  let sdk;

  beforeEach(function () {
    sdk = new SDK(SDK_OPTIONS);
  });

  it('should return null for non-matching state', function () {
    const result = sdk.verify({ state: 'invalid-state' });
    expect(result).toBeNull();
  });

  it('should skip verification when verify_state is false', function () {
    sdk = new SDK({
      ...SDK_OPTIONS,
      verify_state: false,
    });

    const result = sdk.verify({ state: 'any-state' });
    expect(result).toBeTruthy();
  });

  it('should return transaction data when state matches generated transaction', function () {
    // Generate a URL with an explicit state — this stores a transaction in localStorage
    const authUrl = sdk.authorizeURL({ state: 'known-state-xyz' });
    const stateMatch = new URL(authUrl).searchParams.get('state');
    expect(stateMatch).toBe('known-state-xyz');

    // verify() returns the stored transactionData ({state, code_verifier}), not the full authorizeData
    const result = sdk.verify({ state: stateMatch });
    expect(result).toBeTruthy();
    expect(result.state).toBe('known-state-xyz');
  });

  it('should return null when state does not match any stored transaction', function () {
    sdk.authorizeURL({ state: 'some-state' }); // creates a transaction for 'some-state'
    const result = sdk.verify({ state: 'completely-wrong-state' });
    expect(result).toBeNull();
  });
});
