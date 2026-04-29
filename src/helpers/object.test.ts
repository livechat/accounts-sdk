import {pick} from './object';

describe('helpers/pick', function () {
  it('returns only the requested keys', function () {
    expect(pick({a: 1, b: 2, c: 3}, ['a', 'c'])).toEqual({a: 1, c: 3});
  });

  it('ignores keys not present in the source object', function () {
    expect(pick({a: 1}, ['a', 'missing'])).toEqual({a: 1});
  });

  it('returns an empty object when no keys match', function () {
    expect(pick({a: 1}, ['x', 'y'])).toEqual({});
  });

  it('silently drops falsy values (0, false, empty string, null)', function () {
    // pick uses a truthy check — this is intentional Auth0 behaviour
    const src = {zero: 0, flag: false, empty: '', nothing: null, ok: 'yes'};
    expect(pick(src, ['zero', 'flag', 'empty', 'nothing', 'ok'])).toEqual({ok: 'yes'});
  });
});
