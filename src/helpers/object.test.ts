import {deepMerge, omitBy, pick} from './object';
import {type SDKOptions} from '../types/sdk';

describe('helpers/deepMerge', function () {
  describe('shallow fields', function () {
    it('merges top-level primitive fields', function () {
      const target: SDKOptions = {client_id: 'aaa', response_type: 'token'};
      const result = deepMerge(target, {response_type: 'code'});
      expect(result).toEqual({client_id: 'aaa', response_type: 'code'});
    });

    it('adds new fields from source', function () {
      const target: SDKOptions = {client_id: 'aaa'};
      const result = deepMerge(target, {prompt: 'consent'});
      expect(result).toEqual({client_id: 'aaa', prompt: 'consent'});
    });

    it('does not overwrite target value when source value is undefined', function () {
      const target: SDKOptions = {client_id: 'aaa', prompt: 'consent'};
      const result = deepMerge(target, {prompt: undefined});
      expect(result.prompt).toBe('consent');
    });

    it('preserves falsy source values (null, empty string, false, 0)', function () {
      const target: SDKOptions = {
        client_id: 'aaa',
        scope: 'agents--all:rw',
        email_hint: 'user@example.com',
        verify_state: true,
      };
      const result = deepMerge(target, {
        scope: null,
        email_hint: '',
        verify_state: false,
      });
      expect(result.scope).toBeNull();
      expect(result.email_hint).toBe('');
      expect(result.verify_state).toBe(false);
    });
  });

  describe('nested plain objects', function () {
    it('deep merges tracking options', function () {
      const target: SDKOptions = {
        client_id: 'aaa',
        tracking: {utm_source: 'app', utm_medium: 'web'},
      };
      const result = deepMerge(target, {tracking: {utm_campaign: 'launch'}});
      expect(result.tracking).toEqual({
        utm_source: 'app',
        utm_medium: 'web',
        utm_campaign: 'launch',
      });
    });

    it('deep merges transaction options', function () {
      const target: SDKOptions = {
        client_id: 'aaa',
        transaction: {namespace: 'com.livechat', key_length: 32},
      };
      const result = deepMerge(target, {
        transaction: {force_local_storage: true},
      });
      expect(result.transaction).toEqual({
        namespace: 'com.livechat',
        key_length: 32,
        force_local_storage: true,
      });
    });

    it('deep merges pkce options', function () {
      const target: SDKOptions = {
        client_id: 'aaa',
        pkce: {enabled: true, code_verifier_length: 128},
      };
      const result = deepMerge(target, {
        pkce: {code_challenge_method: 'S256'},
      });
      expect(result.pkce).toEqual({
        enabled: true,
        code_verifier_length: 128,
        code_challenge_method: 'S256',
      });
    });
  });

  describe('multiple sources', function () {
    it('applies sources left-to-right', function () {
      const target: SDKOptions = {client_id: 'aaa'};
      const result = deepMerge(
        target,
        {response_type: 'token'},
        {response_type: 'code'},
      );
      expect(result.response_type).toBe('code');
    });

    it('deep merges nested objects across multiple sources', function () {
      const target: SDKOptions = {client_id: 'aaa'};
      const result = deepMerge(
        target,
        {tracking: {utm_source: 'app'}},
        {tracking: {utm_medium: 'web'}},
      );
      expect(result.tracking).toEqual({utm_source: 'app', utm_medium: 'web'});
    });
  });

  describe('immutability', function () {
    it('does not mutate the target', function () {
      const target: SDKOptions = {
        client_id: 'aaa',
        tracking: {utm_source: 'app'},
      };
      deepMerge(target, {tracking: {utm_medium: 'web'}});
      expect(target.tracking).toEqual({utm_source: 'app'});
    });
  });
});

describe('helpers/omitBy', function () {
  it('omits properties where predicate returns true', function () {
    expect(omitBy({a: '', b: 'hello', c: ''}, (v) => v === '')).toEqual({
      b: 'hello',
    });
  });

  it('keeps all properties when predicate always returns false', function () {
    expect(omitBy({a: 1, b: 2}, () => false)).toEqual({a: 1, b: 2});
  });

  it('returns an empty object when predicate always returns true', function () {
    expect(omitBy({a: 1, b: 2}, () => true)).toEqual({});
  });

  it('does not mutate the source object', function () {
    const src = {a: '', b: 'hello'};
    omitBy(src, (v) => v === '');
    expect(src).toEqual({a: '', b: 'hello'});
  });

  it('returns an empty object for an empty input', function () {
    expect(omitBy({}, () => true)).toEqual({});
  });
});

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
