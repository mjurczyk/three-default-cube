import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.js',
  output: {
    file: './three-default-cube.js',
    format: 'cjs'
  },
  plugins: [
    json(),
    babel({ babelHelpers: 'bundled' })
  ]
};
