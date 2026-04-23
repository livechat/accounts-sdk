import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    files: ['**/*.js'],
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
    // TypeScript files
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
      'no-var': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'max-len': ['error', {code: 120, comments: 160}],
      'indent': 'off',
      'jsdoc/require-jsdoc': 'off',
      // TypeScript types make JSDoc type annotations redundant
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/check-param-names': 'off',
    },
  },
  {
    // Jest globals for test files
    files: ['src/**/*.test.js', 'src/**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'jsdoc/require-jsdoc': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
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
