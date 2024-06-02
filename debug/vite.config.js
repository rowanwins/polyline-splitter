import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import geojson from './gj.js'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/polyline-splitter/debug/dist/',
  plugins: [
    vue(),
    geojson()
  ]
})
