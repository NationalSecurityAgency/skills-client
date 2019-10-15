import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

module.exports = {
  input: 'src/SkillsReporter.js',
  output: {
    file: 'dist/SkillsReporter.umd.min.js',
    name: 'SkillsReporter',
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
    terser(),
  ],
};

