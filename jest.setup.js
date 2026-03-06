const originalConsoleError = console.error;
console.error = function (...args) {
  if (args[0]?.message === 'Not implemented: navigation (except hash changes)') return;
  originalConsoleError.apply(console, args);
};
