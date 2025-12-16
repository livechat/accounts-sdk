import expect from 'expect.js';
import random from '../src/helpers/random';

describe('helpers/random', function () {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~';
  let originalCryptoDescriptor;
  let originalMsCryptoDescriptor;
  let originalMathRandom;

  beforeEach(function () {
    originalCryptoDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'crypto'
    );
    originalMsCryptoDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'msCrypto'
    );
    originalMathRandom = Math.random;
  });

  afterEach(function () {
    Math.random = originalMathRandom;

    if (originalCryptoDescriptor) {
      Object.defineProperty(window, 'crypto', originalCryptoDescriptor);
    } else {
      delete window.crypto;
    }

    if (originalMsCryptoDescriptor) {
      Object.defineProperty(window, 'msCrypto', originalMsCryptoDescriptor);
    } else {
      delete window.msCrypto;
    }
  });

  
  it('uses window.crypto without introducing modulo bias', function () {
    const sequence = [0, 196, 64, 250, 120, 194];
    let cursor = 0;
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      writable: true,
      value: {
        getRandomValues: function (array) {
          for (let i = 0; i < array.length; i++) {
            const value = sequence[cursor] !== undefined ? sequence[cursor] : 0;
            cursor += 1;
            array[i] = value;
          }
          return array;
        },
      },
    });
    Object.defineProperty(window, 'msCrypto', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const requestedLength = 4;
    const expected = '0~u~';
    const result = random.string(requestedLength);

    expect(result).to.be(expected);
  });

  it('requests extra crypto bytes when rejection happens repeatedly', function () {
    const sequence = [250, 255, 200, 195, 0, 64, 55, 129];
    let cursor = 0;
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      writable: true,
      value: {
        getRandomValues: function (array) {
          for (let i = 0; i < array.length; i++) {
            const value = sequence[cursor] !== undefined ? sequence[cursor] : 0;
            cursor += 1;
            array[i] = value;
          }
          return array;
        },
      },
    });
    Object.defineProperty(window, 'msCrypto', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const expected = '0~u~';
    const result = random.string(expected.length);

    expect(cursor).to.be.greaterThan(expected.length);
    expect(result).to.be(expected);
  });

  it('falls back to Math.random when crypto is unavailable', function () {
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'msCrypto', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    const samples = [0, 0.02, 0.04, 0.07, 0.1];
    let index = 0;
    Math.random = function () {
      const value = samples[index] || 0;
      index += 1;
      return value;
    };

    const expected = '01246';
    const result = random.string(samples.length);

    expect(result).to.be(expected);
  });
});
