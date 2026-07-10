import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import {defineConfig} from 'eslint/config';
import type {ESLint} from 'eslint';

export default defineConfig([
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  {
    files: ['**/*.js', '**/*.mjs'],
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
      'generator-star-spacing': ['error', 'after'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'rest-spread-spacing': 'error',
      'yield-star-spacing': ['error', 'after'],

      // Custom rules from original config
      eqeqeq: ['error', 'always', {null: 'ignore'}],
      'max-len': ['error', {code: 120, comments: 160}],
      indent: 'off',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always',
        },
      ],

      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    // TypeScript files
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      // The plugin ships its own `configs` typing that predates eslint core's
      // flat-config Plugin type — structurally fine at runtime, so bridge it.
      '@typescript-eslint': tsPlugin as unknown as ESLint.Plugin,
    },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],
      'no-var': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'max-len': ['error', {code: 120, comments: 160}],
      indent: 'off',
      'jsdoc/require-jsdoc': 'off',
      // TypeScript types make JSDoc type annotations redundant
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns-type': 'off',
      'jsdoc/check-param-names': 'off',
      eqeqeq: ['error', 'always', {null: 'ignore'}],
      'prefer-const': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
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
  {
    // Plain global <script> loaded by the e2e sample app pages, not an ES module
    files: ['e2e/app/**/*.js'],
    languageOptions: {
      sourceType: 'script',
    },
  },
]);
