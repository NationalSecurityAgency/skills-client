import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import VuePlugin from 'rollup-plugin-vue';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import path from 'path';

const projectRootDir = path.resolve(__dirname);
module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/skills-client-vue.umd.min.js',
    name: 'SkillsClientVue',
    format: 'umd',
    sourcemap: true,
    globals: {
      '@skills/skills-client-configuration': 'SkillsConfiguration' ,
    },
  },
  external: ['@skills/skills-client-configuration'],
  plugins: [
    peerDepsExternal(),
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
        '@skills/skills-client-js': [ 'SkillsDisplayJS', ],
      },
    }),
    VuePlugin(),
    terser(),
  ],
};

