import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default {
  input: './index.js',
  output: {
    file: './three-default-cube.module.js',
    format: 'es'
  },
  plugins: [
    json(),
    babel({ babelHelpers: 'bundled' })
  ]
};
