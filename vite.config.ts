import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // SVG 可直接作为 React 组件导入：
    //   import Fingerprint from '@/assets/icons/fingerprint-line.svg?react'
    // RemixIcon 的 svg 根节点为 fill="currentColor"，颜色随 CSS color 变化
    svgr(),
  ],
  resolve: {
    // 与 tsconfig.app.json 的 compilerOptions.paths 保持一致
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
