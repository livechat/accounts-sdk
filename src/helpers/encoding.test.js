import encoding from './encoding';

describe('helpers/encoding', function () {
  describe('base64URLEncode', function () {
    it('encodes a simple ASCII string correctly', function () {
      // base64("hello") = "aGVsbG8=" → base64url = "aGVsbG8"
      expect(encoding.base64URLEncode('hello')).toBe('aGVsbG8');
    });

    it('replaces + with - and / with _', function () {
      // Choose a string whose base64 contains + and /
      // base64("\xfb\xff") = "+/8=" → base64url = "-_8"
      expect(encoding.base64URLEncode('\xfb\xff')).toBe('-_8');
    });

    it('strips trailing = padding', function () {
      const result = encoding.base64URLEncode('hello');
      expect(result.endsWith('=')).toBe(false);
    });

    it('encodes empty string as empty string', function () {
      expect(encoding.base64URLEncode('')).toBe('');
    });

    it('encodes a known PKCE verifier to the expected challenge (plain method)', function () {
      // For plain method, code_challenge === code_verifier — just round-trips through base64url
      const verifier = 'abc123';
      // base64("abc123") = "YWJjMTIz" (no padding)
      expect(encoding.base64URLEncode('abc123')).toBe('YWJjMTIz');
    });
  });
});
