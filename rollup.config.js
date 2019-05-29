import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import VuePlugin from 'rollup-plugin-vue';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.umd.min.js',
    name: 'VSkillsReporter',
    format: 'umd',
    sourceMap: 'inline',
  },
  plugins: [
    peerDepsExternal(),
    eslint(),
    resolve({
      jsnext: true,
      preferBuiltins: true,
      browser: true }),
    json(),
    commonjs(),
    VuePlugin(),
    terser(),
  ],
};

