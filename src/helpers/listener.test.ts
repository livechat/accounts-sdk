import Listener from './listener';

const SERVER_URL = 'https://accounts.livechat.com';

function makeEvent(origin: string, data: unknown): MessageEvent {
  return new MessageEvent('message', {origin, data});
}

describe('helpers/Listener', function () {
  let listener: Listener;

  beforeEach(function () {
    jest.useFakeTimers();
    listener = new Listener({server_url: SERVER_URL});
  });

  afterEach(function () {
    listener.stop();
    jest.useRealTimers();
  });

  describe('start / stop', function () {
    it('registers a message event listener on start', function () {
      const spy = jest.spyOn(window, 'addEventListener');
      listener.start(null, () => {});
      expect(spy).toHaveBeenCalledWith('message', expect.any(Function));
      spy.mockRestore();
    });

    it('removes the message event listener on stop', function () {
      const spy = jest.spyOn(window, 'removeEventListener');
      listener.start(null, () => {});
      listener.stop();
      expect(spy).toHaveBeenCalledWith('message', expect.any(Function), false);
      spy.mockRestore();
    });

    it('sets listening to true after start and false after stop', function () {
      listener.start(null, () => {});
      expect(listener.listening).toBe(true);
      listener.stop();
      expect(listener.listening).toBe(false);
    });

    it('does not register listener twice if start called again', function () {
      const spy = jest.spyOn(window, 'addEventListener');
      listener.start(null, () => {});
      expect(listener.listening).toBe(true);
      listener.start(null, () => {});
      const calls = spy.mock.calls.filter(([evt]) => evt === 'message');
      expect(calls.length).toBe(1);
      spy.mockRestore();
    });
  });

  describe('timeout', function () {
    it('calls callback with timeout error after specified time', function () {
      const callback = jest.fn();
      listener.start(1000, callback);

      jest.advanceTimersByTime(999);
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledWith('timeout', null);
    });

    it('stops listening after timeout fires', function () {
      listener.start(500, () => {});
      jest.advanceTimersByTime(500);
      expect(listener.listening).toBe(false);
    });

    it('does not fire timeout when null is passed', function () {
      const callback = jest.fn();
      listener.start(null, callback);
      jest.advanceTimersByTime(60000);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('receiveMessage — origin validation', function () {
    it('ignores messages from unknown origins', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(
        makeEvent('https://evil.com', {data: {access_token: 'x'}}),
      );

      expect(callback).not.toHaveBeenCalled();
    });

    it('accepts messages from the configured server_url origin', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(
        makeEvent(SERVER_URL, {
          data: {access_token: 'tok', token_type: 'Bearer', scope: 'read'},
        }),
      );

      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({access_token: 'tok'}),
      );
    });

    it('accepts messages from the livechatinc.com variant of the origin', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(
        makeEvent('https://accounts.livechatinc.com', {
          data: {access_token: 'tok2', token_type: 'Bearer'},
        }),
      );

      expect(callback).toHaveBeenCalledWith(
        null,
        expect.objectContaining({access_token: 'tok2'}),
      );
    });
  });

  describe('receiveMessage — data handling', function () {
    it('ignores messages with no data and no error fields', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(makeEvent(SERVER_URL, {something_else: true}));

      expect(callback).not.toHaveBeenCalled();
    });

    it('calls callback with error when event.data.error is present', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(
        makeEvent(SERVER_URL, {error: {identity_exception: 'unauthorized'}}),
      );

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({identity_exception: 'unauthorized'}),
        null,
      );
    });

    it('normalizes scopes → scope in success data', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(
        makeEvent(SERVER_URL, {
          data: {access_token: 'tok', scopes: 'read write'},
        }),
      );

      const [, result] = callback.mock.calls[0];
      expect(result.scope).toBe('read write');
      expect(result.scopes).toBeUndefined();
    });

    it('converts expires_in to integer', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(
        makeEvent(SERVER_URL, {
          data: {access_token: 'tok', expires_in: '28800'},
        }),
      );

      const [, result] = callback.mock.calls[0];
      expect(result.expires_in).toBe(28800);
      expect(typeof result.expires_in).toBe('number');
    });

    it('converts invalid expires_in to 0', function () {
      const callback = jest.fn();
      listener.start(null, callback);

      listener.receiveMessage(
        makeEvent(SERVER_URL, {
          data: {access_token: 'tok', expires_in: 'not-a-number'},
        }),
      );

      const [, result] = callback.mock.calls[0];
      expect(result.expires_in).toBe(0);
    });

    it('stops listening after a valid message is received', function () {
      listener.start(null, () => {});

      listener.receiveMessage(
        makeEvent(SERVER_URL, {data: {access_token: 'tok'}}),
      );

      expect(listener.listening).toBe(false);
    });

    it('throws when receiveMessage is called without start', function () {
      const bare = new Listener({server_url: SERVER_URL});
      const event = makeEvent(SERVER_URL, {data: {access_token: 'x'}});
      expect(() => bare.receiveMessage(event)).toThrow(
        'Listener callback is not set',
      );
    });
  });
});
