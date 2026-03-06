const NOT_IMPLEMENTED_NAVIGATION = 'Not implemented: navigation (except hash changes)';

const originalConsoleError = console.error;
console.error = function (...args) {
  const msg = args[0];
  const text = msg instanceof Error ? msg.message : String(msg ?? '');
  if (text.includes(NOT_IMPLEMENTED_NAVIGATION)) return;
  originalConsoleError.apply(console, args);
};

afterAll(function () {
  console.error = originalConsoleError;
});