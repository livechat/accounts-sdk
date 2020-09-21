module.exports = {
  extends: 'google',
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  rules: {
    'max-len': [2, {code: 80, comments: 160}],
    // eslint-disable-next-line quote-props
    indent: 0,
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
  },
};
