import { Capacitor } from '@capacitor/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './styles/index.css'
import { autoCheckOnStartup, injectDevFixture } from './update/bridge'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('缺少 #root 容器')

// 预览环境：注入模拟更新消息，便于查看更新卡片与气泡的 UI。
// 生产构建会被 Vite 静态剔除，见 update/bridge.ts 的 injectDevFixture。
if (import.meta.env.DEV && !Capacitor.isNativePlatform()) {
  injectDevFixture()
}

// 冷启动静默检查更新：无更新或失败都不打扰用户。
// 仅原生环境执行 —— 浏览器里 App.getInfo() 不可用，检查必然失败。
if (Capacitor.isNativePlatform()) {
  void autoCheckOnStartup()
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
