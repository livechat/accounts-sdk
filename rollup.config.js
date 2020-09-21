import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import {babel} from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';

export default [
  {
    input: 'src/sdk.js',
    external: ['crypto'],
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
      {
        name: 'AccountsSDK',
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        name: 'AccountsSDK',
        file: pkg.unpkg,
        format: 'umd',
        sourcemap: true,
        plugins: [terser()],
        globals: {
          crypto: 'crypto',
        },
      },
      {
        name: 'AccountsSDK',
        file: './dist/accounts-sdk.js',
        format: 'umd',
        sourcemap: true,
        globals: {
          crypto: 'crypto',
        },
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      babel({presets: ['@babel/preset-env'], babelHelpers: 'bundled'}),
      process.env.ROLLUP_WATCH && serve('dist'),
    ],
  },
];
