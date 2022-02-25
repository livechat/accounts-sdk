import expect from 'expect.js';
import sjcl from '../src/vendor/sjcl';

describe('custom sjcl build', function () {
  it('should compute sha256 compatible with sjcl', function () {
    const hash = sjcl.hash.sha256.hash(
      'A wizard is never late, nor is he early. He arrives precisely when he means to.'
    );
    expect(hash).to.eql([
      -43044241, -888194002, 1994754145, 1466278062, -1272963905, -1251215089,
      -1752691786, -1644439736,
    ]);
  });
});
