import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import pkg from './package.json';

module.exports = {
  input: 'src/index.js',
  output: {
    // need to pass in format, file (and name if format == umd) via cmd line
    sourcemap: true,
  },
  preserveSymlinks: true,
  plugins: [
    eslint(),
    babel({
      exclude: 'node_modules/**',
    }),
    resolve({
      browser: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __skillsClientVersion__: `${pkg.name}-${pkg.version}`,
    }),
    commonjs(),
    terser(), // comment out to remove minimization
  ],
};
