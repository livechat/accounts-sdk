import RedirectUriParamsPersister from './redirectUriParams';
import Storage from '../storage';

// CookieStorage doesn't persist in jsdom (Secure:true rejected on HTTP). Use localStorage.
function makePersister() {
  const persister = new RedirectUriParamsPersister({
    transaction: {namespace: 'test.ns'},
  });
  // Override inner persister's storage to use localStorage
  persister.persister.storage = new Storage({force_local_storage: true});
  return persister;
}

describe('helpers/persisters/RedirectUriParamsPersister', function () {
  let persister: RedirectUriParamsPersister;
  let replaceStateSpy: jest.SpyInstance;

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
    it.each(['query', 'hash'])('preserves attribution but replaces OAuth and app params in %s', (part) => {
      const original = 'source_url=https%3A%2F%2Ftext.com%2F&source_id=hero&code=old&state=old&app=old';
      const callback = 'source_url=&source_id=default&code=new&state=new&app=new';
      const prefix = part === 'query' ? '?' : '#';
      persister.persist({redirect_uri: `https://example.com/cb${prefix}${original}`, state: 'merge'});
      window.history.pushState(null, '', `/cb${prefix}${callback}`);
      persister.retrieve('merge');
      const restored = new URL(replaceStateSpy.mock.calls[0][2] as string);
      const params = new URLSearchParams(part === 'query' ? restored.search : restored.hash.substring(1));
      expect(params.get('source_url')).toBe('https://text.com/');
      expect(params.get('source_id')).toBe('hero');
      expect(params.get('code')).toBe('new');
      expect(params.get('state')).toBe('new');
      expect(params.get('app')).toBe('new');
    });

    it('uses callback attribution when the original values are empty, null or missing', () => {
      persister.persister.set('empty', {query_params: {source_url: '', source_id: null}});
      window.history.pushState(null, '', '/?source_url=https%3A%2F%2Ftext.com&source_id=hero&utm_source=google');
      persister.retrieve('empty');
      const params = new URL(replaceStateSpy.mock.calls[0][2] as string).searchParams;
      expect(params.get('source_url')).toBe('https://text.com');
      expect(params.get('source_id')).toBe('hero');
      expect(params.get('utm_source')).toBe('google');
    });

    it('prefers explicit tracking over redirect URI attribution and isolates states', () => {
      persister.persist({redirect_uri: 'https://example.com/?source_id=uri', state: 'one', source_id: 'tracking'});
      persister.persist({redirect_uri: 'https://example.com/?source_id=second', state: 'two', source_id: ''});
      persister.retrieve('one');
      expect(new URL(replaceStateSpy.mock.calls[0][2] as string).searchParams.get('source_id')).toBe('tracking');
      persister.retrieve('two');
      expect(new URL(replaceStateSpy.mock.calls[1][2] as string).searchParams.get('source_id')).toBe('second');
      persister.retrieve('one');
      expect(new URL(replaceStateSpy.mock.calls[2][2] as string).searchParams.has('source_id')).toBe(false);
    });

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
      const newUrl = replaceStateSpy.mock.calls[0][2] as string;
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
      const newUrl = replaceStateSpy.mock.calls[0][2] as string;
      expect(newUrl).toContain('stored=1');
      expect(newUrl).toContain('live=2');
    });

    it('calls replaceState with current URL when state has no stored params', function () {
      // persister.get() always returns {} (never null), so retrieve() always calls replaceState.
      persister.retrieve('unknown-state');
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      const newUrl = replaceStateSpy.mock.calls[0][2] as string;
      expect(newUrl).not.toContain('foo');
    });

    it('returns early without calling replaceState when inner persister returns falsy', function () {
      // Persister.get() currently always returns data||{}, so this branch is defensive.
      jest.spyOn(persister.persister, 'get').mockReturnValue(null);
      persister.retrieve('any-state');
      expect(replaceStateSpy).not.toHaveBeenCalled();
    });

    it('calls replaceState without trailing ? or # when all params are empty', function () {
      persister.retrieve('unknown-state');
      const newUrl = replaceStateSpy.mock.calls[0][2] as string;
      expect(newUrl).not.toMatch(/[?#]/);
    });
  });
});
