import Persister from './persister';
import Storage from './storage';

// CookieStorage sets Secure:true which is silently rejected in jsdom (HTTP context).
// Swap out persister.storage for a localStorage-backed Storage after construction.
function makeWorkingStorage() {
  return new Storage({force_local_storage: true});
}

describe('helpers/Persister', function () {
  let persister: Persister;

  beforeEach(function () {
    const options = {transaction: {namespace: 'test.persister'}};
    persister = new Persister(options, ':test');
    // Override storage so it uses localStorage (works in jsdom)
    persister.storage = makeWorkingStorage();
  });

  it('creates namespace from transaction namespace + type', function () {
    expect(persister.options.namespace).toBe('test.persister:test');
  });

  it('stores and retrieves data by state key', function () {
    persister.set('state1', {access_token: 'tok'});
    const result = persister.get<{access_token: string}>('state1');
    expect(result.access_token).toBe('tok');
  });

  it('clears data after get (single-use read)', function () {
    persister.set('state2', {code: 'abc'});
    persister.get('state2');
    // Second get should return empty object since data was cleared
    const result = persister.get('state2');
    expect(result).toEqual({});
  });

  it('returns empty object when state key does not exist', function () {
    const result = persister.get('nonexistent-state');
    expect(result).toEqual({});
  });

  it('clear removes the stored data', function () {
    persister.set('state3', {value: 'x'});
    persister.clear('state3');
    const result = persister.get('state3');
    expect(result).toEqual({});
  });

  it('different state keys are stored independently', function () {
    persister.set('stateA', {token: 'a'});
    persister.set('stateB', {token: 'b'});

    expect(persister.get<{token: string}>('stateA').token).toBe('a');
    expect(persister.get<{token: string}>('stateB').token).toBe('b');
  });
});
