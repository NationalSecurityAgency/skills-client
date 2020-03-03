import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';

const baseConfig = {
  input: 'src/index.js',
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
    }),
    commonjs(),
    terser(), // comment out to remove minimization
  ],
};

const umdConfig = {
  external: ['@skills/skills-client-configuration'],
  output: {
    file: 'dist/skills-client-js.umd.min.js',
    name: 'SkillsClientJS',
    format: 'umd',
    sourcemap: true,
    globals: {
      '@skills/skills-client-configuration': 'SkillsConfiguration',
    },
  },
};
const esmConfig = {
  output: {
    file: 'dist/skills-client-js.esm.min.js',
    format: 'esm',
    sourcemap: true,
  },
};

module.exports = [
  { ...umdConfig, ...baseConfig },
  { ...esmConfig, ...baseConfig },
];
