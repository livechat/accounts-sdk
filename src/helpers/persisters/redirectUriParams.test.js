import RedirectUriParamsPersister from './redirectUriParams';
import Storage from '../storage';

// CookieStorage doesn't persist in jsdom (Secure:true rejected on HTTP). Use localStorage.
function makePersister() {
  const persister = new RedirectUriParamsPersister({
    transaction: { namespace: 'test.ns' },
  });
  // Override inner persister's storage to use localStorage
  persister.persister.storage = new Storage({
    namespace: persister.persister.options.namespace,
    force_local_storage: true,
  });
  return persister;
}

describe('helpers/persisters/RedirectUriParamsPersister', function () {
  let persister;
  let replaceStateSpy;

  beforeEach(function () {
    persister = makePersister();
    replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    // Reset to clean URL using pushState (avoids Object.defineProperty on window.location)
    window.history.pushState(null, '', '/');
    window.location.hash = '';
  });

  afterEach(function () {
    replaceStateSpy.mockRestore();
    window.history.pushState(null, '', '/');
    window.location.hash = '';
  });

  describe('persist', function () {
    it('strips query params from redirect_uri and stores them', function () {
      const params = {
        redirect_uri: 'https://example.com/cb?foo=bar&baz=qux',
        state: 'state1',
      };

      persister.persist(params);

      expect(params.redirect_uri).toBe('https://example.com/cb');
    });

    it('strips hash params from redirect_uri and stores them', function () {
      const params = {
        redirect_uri: 'https://example.com/cb#section=top',
        state: 'state2',
      };

      persister.persist(params);

      expect(params.redirect_uri).toBe('https://example.com/cb');
    });

    it('stores both query and hash params', function () {
      const params = {
        redirect_uri: 'https://example.com/cb?q=1#h=2',
        state: 'state3',
      };

      persister.persist(params);

      expect(params.redirect_uri).toBe('https://example.com/cb');
    });

    it('leaves redirect_uri unchanged when it has no extra params', function () {
      const params = {
        redirect_uri: 'https://example.com/cb',
        state: 'state4',
      };

      persister.persist(params);

      expect(params.redirect_uri).toBe('https://example.com/cb');
    });
  });

  describe('retrieve', function () {
    it('calls history.replaceState with merged query params after retrieve', function () {
      const params = {
        redirect_uri: 'https://example.com/cb?foo=bar',
        state: 'retrieve-state',
      };

      persister.persist(params);

      // Simulate the OAuth callback landing with additional query params
      window.history.pushState(null, '', '/?access_token=tok');

      persister.retrieve('retrieve-state');

      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      const newUrl = replaceStateSpy.mock.calls[0][2];
      expect(newUrl).toContain('foo=bar');
      expect(newUrl).toContain('access_token=tok');
    });

    it('calls history.replaceState merging hash params after retrieve', function () {
      const params = {
        redirect_uri: 'https://example.com/cb#stored=1',
        state: 'hash-state',
      };

      persister.persist(params);

      window.location.hash = '#live=2';

      persister.retrieve('hash-state');

      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      const newUrl = replaceStateSpy.mock.calls[0][2];
      expect(newUrl).toContain('stored=1');
      expect(newUrl).toContain('live=2');
    });

    it('calls replaceState with current URL when state has no stored params', function () {
      // persister.get() always returns {} (never null), so retrieve() always calls replaceState.
      // When no params were stored the result is a URL update with only current location params.
      persister.retrieve('unknown-state');
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
