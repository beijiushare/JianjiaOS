import { Capacitor } from '@capacitor/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { hydrateMessages, persistMessages } from './messages/persist'
import { hydrateSettings, persistSettings } from './settings/store'
import './styles/index.css'
import {
  autoCheckOnStartup,
  injectDevFixture,
  resumeOnStartup,
} from './update/bridge'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('缺少 #root 容器')

/**
 * 启动流程。
 *
 * 顺序有讲究：
 *   ① 恢复持久化状态（消息 + 设置）—— 必须早于首次渲染，
 *      否则列表会先空后跳、聊天背景会先渲染默认值再跳变
 *   ② 订阅写回
 *   ③ 渲染
 *   ④ 冷启动任务（检查更新 / 接管未完成下载）—— 放到渲染之后，
 *      不跟首屏抢资源
 */
void Promise.all([hydrateMessages(), hydrateSettings()])
  .then(() => {
    persistMessages()
    persistSettings()

    if (import.meta.env.DEV && !Capacitor.isNativePlatform()) {
      // 预览环境注入模拟更新消息，便于查看卡片与气泡的 UI。
      // 生产构建会被 Vite 静态剔除。
      injectDevFixture()
    }

    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )

    if (Capacitor.isNativePlatform()) {
      // 以下两项都静默执行：无更新、无待接管下载、或失败，都不打扰用户
      void resumeOnStartup()
      void autoCheckOnStartup()
    }
  })
  .catch((e: unknown) => {
    // 恢复失败已在 hydrateMessages 内部兜住，这里只可能是渲染前的意外
    console.error('[startup] 启动失败', e)
  })
