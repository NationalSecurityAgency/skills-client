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
    file: 'dist/skills-client-vue.umd.min.js',
    name: 'SkillsClientVue',
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
    commonjs({
      namedExports: {
        '@skills/skills-client-reporter': [
          'SkillsReporter',
          'SUCCESS_EVENT',
          'FAILURE_EVENT'
        ],
      },
    }),
    VuePlugin(),
    terser(),
  ],
};

