import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from "./package.json";

module.exports = {
  input: 'src/index.js',
  output: {
    // need to pass in format, file (and name if format == umd) via cmd line
    sourcemap: true,
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes'
    },
  },
  preserveSymlinks: true,
  plugins: [
    peerDepsExternal(),
    eslint(),
    resolve({
      browser: true,
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __skillsClientVersion__: `${pkg.name}-${pkg.version}`,
    }),
    commonjs({
      include: ["node_modules/**"],
      exclude: 'src/**',
      namedExports: {
        "node_modules/react/react.js": [
          "Children",
          "Component",
          "PropTypes",
          "createElement"
        ],
        "node_modules/react-dom/index.js": ["render"]
      }
    }),
    terser(),
  ],
};

