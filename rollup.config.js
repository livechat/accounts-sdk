import {createRequire} from 'module';
import resolve from '@rollup/plugin-node-resolve';
import {babel} from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const external = Object.keys(pkg.dependencies || {});

export default [
  {
    input: 'src/sdk.js',
    output: [
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
  {
    input: 'src/sdk.js',
    external: external,
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
  },
];
