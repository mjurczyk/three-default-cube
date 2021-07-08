import { babel } from '@rollup/plugin-babel';

export default {
  input: './index.js',
  output: {
    file: './three-default-cube.module.js',
    format: 'es'
  },
  plugins: [
    babel({ babelHelpers: 'bundled' })
  ]
};
