import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Google style guide rules
      'arrow-parens': ['error', 'always'],
      'constructor-super': 'error',
      'generator-star-spacing': ['error', 'after'],
      'no-new-symbol': 'error',
      'no-this-before-super': 'error',
      'no-var': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'rest-spread-spacing': 'error',
      'yield-star-spacing': ['error', 'after'],

      // Custom rules from original config
      'max-len': ['error', {code: 120, comments: 160}],
      'indent': 'off',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],

      // Turn off JSDoc requirement (legacy code has inline disables)
      'jsdoc/require-jsdoc': 'warn',
    },
  },
  {
    // Jest globals for test files
    files: ['src/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    // Relax rules for vendor files
    files: ['src/vendor/**/*.js'],
    rules: {
      'no-var': 'off',
      'no-redeclare': 'off',
      'no-unused-vars': 'off',
    },
  },
];
