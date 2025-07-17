/*
Copyright 2025 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import eslint from '@rollup/plugin-eslint';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { readFileSync } from 'fs';

// import pkg from './package.json';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
console.log(`running version ${pkg.version}`);

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
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
    }),
    resolve({
      browser: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __skillsClientVersion__: `${pkg.name}-${pkg.version}`,
      preventAssignment: true,
    }),
    commonjs(),
    terser(), // comment out to remove minimization
  ],
};
