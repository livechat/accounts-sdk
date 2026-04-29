import sjcl from './sjcl';

describe('custom sjcl build', function () {
  it('should compute sha256 compatible with sjcl', function () {
    const hash = sjcl.hash.sha256.hash(
      'A wizard is never late, nor is he early. He arrives precisely when he means to.'
    );
    expect(hash).toEqual([
      -43044241, -888194002, 1994754145, 1466278062, -1272963905, -1251215089,
      -1752691786, -1644439736,
    ]);
  });

  it('should compute sha256 for a second known input', function () {
    // SHA256("abc") as signed 32-bit words (verified against sjcl output)
    const hash = sjcl.hash.sha256.hash('abc');
    expect(hash).toEqual([
      -1166534977, -1895706646, 1094795486, 1571693091,
      -1341955677, -1776846180, -1273954463, -234875475,
    ]);
  });
});
