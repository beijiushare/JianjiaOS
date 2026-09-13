import { App as CapacitorApp } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import { useEffect } from 'react'

import { showToast } from '@/components/toastStore'

import { useNavStore } from './store'

/** 双击退出的时间窗口（ms） */
const QUIT_WINDOW = 2000

const QUIT_HINT = '再按一次退出应用'

/**
 * 双击退出的计时基准。
 *
 * 使用模块级变量：该值不参与渲染，且需在非 React 上下文（backButton 回调）读写。
 */
let quitArmedAt = 0

function resetQuitArm(): void {
  quitArmedAt = 0
}

/**
 * 返回手势入口。消费顺序（LIFO）：
 *   ① 栈非空 → 弹出栈顶
 *   ② 栈空（主屏）→ 双击退出
 *
 * 实现约束：所有状态必须经 `getState()` 现取，不得引用闭包变量。
 *
 * 原因：`addListener` 仅注册一次，回调捕获的闭包变量不随后续渲染更新。
 * 若此处引用闭包中的 `stack`，其值恒为初始值 `[]`，将导致每次返回
 * 都被判定为「位于主屏」，子页面无法返回。
 *
 * 参见知识库 `capacitor/interactive-back-gesture-lightstack.md`。
 */
export function handleBack(): void {
  const { stack, pop } = useNavStore.getState()

  if (stack.length > 0) {
    pop()
    resetQuitArm()
    return
  }

  const now = Date.now()
  if (now - quitArmedAt < QUIT_WINDOW) {
    void CapacitorApp.exitApp()
    return
  }

  quitArmedAt = now
  showToast(QUIT_HINT)
}

/**
 * 挂载返回手势监听。整个应用仅调用一次（App 根组件）。
 *
 * 依赖数组为空是正确且必要的：`handleBack` 不引用闭包变量，
 * 无需随状态变化重新注册；若改为依赖状态，将引入注册/注销与事件到达的竞态，
 * 且无任何收益。
 */
export function useBackHandler(): void {
  useEffect(() => {
    let handle: PluginListenerHandle | null = null
    let cancelled = false

    void CapacitorApp.addListener('backButton', () => {
      handleBack()
    }).then((h) => {
      // StrictMode 下 effect 执行 mount → unmount → mount。
      // 若卸载先于 promise settle，此处需自行清理。
      if (cancelled) void h.remove()
      else handle = h
    })

    // backButton 仅在原生环境触发；开发期使用 Esc 替代
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleBack()
    }
    if (import.meta.env.DEV) {
      window.addEventListener('keydown', onKeyDown)
    }

    return () => {
      cancelled = true
      if (handle) void handle.remove()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])
}
