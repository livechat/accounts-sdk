import StorageHandler from './handler';
import CookieStorage from './cookie';
import DummyStorage from './dummy';

describe('helpers/storage/StorageHandler', function () {
  describe('constructor', function () {
    it('defaults to CookieStorage when force_local_storage is not set', function () {
      const handler = new StorageHandler({});
      expect(handler.storage).toBeInstanceOf(CookieStorage);
    });

    it('uses localStorage when force_local_storage is true and localStorage is available', function () {
      const handler = new StorageHandler({force_local_storage: true});
      expect(handler.storage).toBe(window.localStorage);
    });

    it('falls back to CookieStorage when localStorage is null (falsy)', function () {
      const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          return null;
        },
      });

      const handler = new StorageHandler({force_local_storage: true});
      expect(handler.storage).toBeInstanceOf(CookieStorage);

      Object.defineProperty(window, 'localStorage', originalDescriptor);
    });

    it('falls back to CookieStorage when force_local_storage is true but localStorage throws', function () {
      const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');

      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new Error('localStorage disabled');
        },
      });

      const handler = new StorageHandler({force_local_storage: true});
      expect(handler.storage).toBeInstanceOf(CookieStorage);

      if (originalDescriptor) {
        Object.defineProperty(window, 'localStorage', originalDescriptor);
      }
    });
  });

  describe('failover', function () {
    it('falls over from CookieStorage to DummyStorage', function () {
      const handler = new StorageHandler({});
      expect(handler.storage).toBeInstanceOf(CookieStorage);

      handler.failover();
      expect(handler.storage).toBeInstanceOf(DummyStorage);
    });

    it('does not change storage when already at DummyStorage', function () {
      const handler = new StorageHandler({});
      handler.storage = new DummyStorage();

      handler.failover();
      expect(handler.storage).toBeInstanceOf(DummyStorage);
    });

    it('falls over from localStorage to CookieStorage', function () {
      const handler = new StorageHandler({force_local_storage: true});
      expect(handler.storage).toBe(window.localStorage);

      handler.failover();
      expect(handler.storage).toBeInstanceOf(CookieStorage);
    });
  });

  describe('getItem / setItem / removeItem roundtrip', function () {
    // Use force_local_storage: true so tests use localStorage, which works reliably in jsdom
    // (CookieStorage sets Secure:true which is silently rejected in an HTTP jsdom context)

    it('stores and retrieves a string value', function () {
      const handler = new StorageHandler({force_local_storage: true});
      handler.setItem('roundtrip-key', 'roundtrip-value');
      expect(handler.getItem('roundtrip-key')).toBe('roundtrip-value');
    });

    it('returns null for a key that was never set', function () {
      const handler = new StorageHandler({force_local_storage: true});
      expect(handler.getItem('nonexistent-xyz')).toBeNull();
    });

    it('removeItem makes the key unreadable', function () {
      const handler = new StorageHandler({force_local_storage: true});
      handler.setItem('del-key', 'del-value');
      handler.removeItem('del-key');
      expect(handler.getItem('del-key')).toBeNull();
    });
  });

  describe('failover triggered by errors', function () {
    it('fails over from localStorage to CookieStorage when getItem throws', function () {
      const handler = new StorageHandler({force_local_storage: true});
      // Replace with a throwing shim that is not instanceof CookieStorage or DummyStorage
      // (simulates localStorage) — failover() will go to CookieStorage
      handler.storage = {
        getItem: () => { throw new Error('ls error'); },
        removeItem: () => {},
        setItem: () => {},
      };

      // Should not throw; failover happens silently
      expect(() => handler.getItem('k')).not.toThrow();
      expect(handler.storage).toBeInstanceOf(CookieStorage);
    });

    it('fails over from CookieStorage to DummyStorage when getItem throws', function () {
      const handler = new StorageHandler({});
      // Replace CookieStorage with a throwing prototype-compatible instance
      const broken = Object.create(CookieStorage.prototype) as CookieStorage;
      broken.getItem = () => { throw new Error('cookie error'); };
      handler.storage = broken;

      expect(() => handler.getItem('k')).not.toThrow();
      expect(handler.storage).toBeInstanceOf(DummyStorage);
    });

    it('fails over from CookieStorage to DummyStorage when setItem throws', function () {
      const handler = new StorageHandler({});
      const broken = Object.create(CookieStorage.prototype) as CookieStorage;
      broken.setItem = () => { throw new Error('cookie write error'); };
      handler.storage = broken;

      expect(() => handler.setItem('k', 'v')).not.toThrow();
      expect(handler.storage).toBeInstanceOf(DummyStorage);
    });

    it('fails over from CookieStorage to DummyStorage when removeItem throws', function () {
      const handler = new StorageHandler({});
      const broken = Object.create(CookieStorage.prototype) as CookieStorage;
      broken.removeItem = () => { throw new Error('cookie remove error'); };
      handler.storage = broken;

      expect(() => handler.removeItem('k')).not.toThrow();
      expect(handler.storage).toBeInstanceOf(DummyStorage);
    });

    it('does not fail over further when already at DummyStorage', function () {
      const handler = new StorageHandler({});
      handler.storage = new DummyStorage();

      // DummyStorage never throws — just returns null/void
      expect(() => handler.getItem('k')).not.toThrow();
      expect(() => handler.setItem('k', 'v')).not.toThrow();
      expect(() => handler.removeItem('k')).not.toThrow();
      expect(handler.storage).toBeInstanceOf(DummyStorage);
    });
  });
});
