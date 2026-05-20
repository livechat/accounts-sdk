import {pick} from './object';

describe('helpers/pick', function () {
  it('returns only the requested keys', function () {
    expect(pick({a: 1, b: 2, c: 3}, ['a', 'c'])).toEqual({a: 1, c: 3});
  });

  it('ignores keys not present in the source object', function () {
    // @ts-expect-error Testing behavior with non-existent keys
    expect(pick({a: 1}, ['a', 'missing'])).toEqual({a: 1});
  });

  it('returns an empty object when no keys match', function () {
    // @ts-expect-error Testing behavior with non-existent keys
    expect(pick({a: 1}, ['x', 'y'])).toEqual({});
  });

  it('keeps falsy values (0, false, empty string, null)', function () {
    const src = {zero: 0, flag: false, empty: '', nothing: null, ok: 'yes'};
    expect(pick(src, ['zero', 'flag', 'empty', 'nothing', 'ok'])).toEqual({
      zero: 0,
      flag: false,
      empty: '',
      nothing: null,
      ok: 'yes',
    });
  });

  it('drops keys with undefined values', function () {
    const src = {defined: 'value', missing: undefined};
    expect(pick(src, ['defined', 'missing'])).toEqual({defined: 'value'});
  });
});
