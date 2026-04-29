import Storage from './storage';

// CookieStorage sets Secure:true which is silently rejected in jsdom (HTTP context).
// force_local_storage bypasses the cookie layer so reads/writes work.
function makeStorage() {
  return new Storage({force_local_storage: true});
}

describe('helpers/Storage', function () {
  let storage: Storage;

  beforeEach(function () {
    storage = makeStorage();
  });

  it('stores and retrieves a string', function () {
    storage.setItem('key', 'hello');
    expect(storage.getItem('key')).toBe('hello');
  });

  it('stores and retrieves a plain object (JSON round-trip)', function () {
    storage.setItem('obj', {a: 1, b: true});
    expect(storage.getItem('obj')).toEqual({a: 1, b: true});
  });

  it('stores and retrieves an array', function () {
    storage.setItem('arr', [1, 2, 3]);
    expect(storage.getItem('arr')).toEqual([1, 2, 3]);
  });

  it('stores and retrieves a number', function () {
    storage.setItem('num', 42);
    expect(storage.getItem('num')).toBe(42);
  });

  it('stores and retrieves null', function () {
    storage.setItem('nil', null);
    expect(storage.getItem('nil')).toBeNull();
  });

  it('returns raw string when stored value is not valid JSON', function () {
    // Bypass setItem to inject a non-JSON string directly
    storage.handler.setItem('raw', 'not-json');
    expect(storage.getItem('raw')).toBe('not-json');
  });

  it('removeItem deletes the stored value', function () {
    storage.setItem('del', 'gone');
    storage.removeItem('del');
    expect(storage.getItem('del')).toBeNull();
  });
});
