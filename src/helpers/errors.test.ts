import errors from './errors';

describe('helpers/errors', function () {
  describe('extend — oauth_exception', function () {
    it('adds description for a known oauth_exception code', function () {
      const error = {oauth_exception: 'invalid_request'};
      const result = errors.extend(error);
      expect(result.description).toBe(
        'You may be loading accounts-sdk on a domain that is not whitelisted.'
      );
    });

    it('mutates and returns the same error object', function () {
      const error = {oauth_exception: 'access_denied'};
      const result = errors.extend(error);
      expect(result).toBe(error);
    });

    it('does not add description for an unknown oauth_exception code', function () {
      const error = {oauth_exception: 'unknown_code'};
      const result = errors.extend(error);
      expect(result.description).toBeUndefined();
    });
  });

  describe('extend — identity_exception', function () {
    it('adds description for a known identity_exception code', function () {
      const error = {identity_exception: 'unauthorized'};
      const result = errors.extend(error);
      expect(result.description).toBe(
        'Resource owner identity is not known or consent is missing.'
      );
    });

    it('does not add description for an unknown identity_exception code', function () {
      const error = {identity_exception: 'unknown_code'};
      const result = errors.extend(error);
      expect(result.description).toBeUndefined();
    });
  });

  describe('extend — no matching exception', function () {
    it('returns error unchanged when no exception field is present', function () {
      const error = {message: 'something went wrong'};
      const result = errors.extend(error);
      expect(result).toBe(error);
      expect(result.description).toBeUndefined();
    });
  });
});
