import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import path from 'path';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import VuePlugin from 'rollup-plugin-vue';

const projectRootDir = path.resolve(__dirname);
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
    alias({
      resolve: ['.vue', '.js'],
      entries: [
        {
          find: /^@\/(.*)$/,
          replacement: path.resolve(projectRootDir, "src/$1")
        },
      ],
    }),
    resolve({
      browser: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    commonjs(),
    VuePlugin(),
    terser(),
  ],
};

