import { babel } from '@rollup/plugin-babel';

export default {
  input: './index.js',
  output: {
    file: './three-default-cube.js',
    format: 'cjs'
  },
  plugins: [
    babel({ babelHelpers: 'bundled' })
  ]
};
