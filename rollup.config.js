import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import buble from '@rollup/plugin-buble'
import typescript from '@rollup/plugin-typescript';

const output = (file, format, plugins) => ({
  input: './src/index.ts',
  output: {
    name: 'polylineSplitter',
    file,
    format,
    exports: 'default'
  },
  plugins
})

export default [
  output('./dist/polylineSplitter.mjs', 'es', [typescript(), commonjs(), buble()]),
  output('./dist/polylineSplitter.js', 'umd', [typescript(), commonjs(), buble()]),
  output('./dist/polylineSplitter.min.js', 'umd', [typescript(), commonjs(), nodeResolve(), buble(), terser()])
]
