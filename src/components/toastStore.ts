import { create } from 'zustand'

interface ToastState {
  /** 当前显示的文案；null 表示不显示 */
  text: string | null
  show: (text: string, durationMs?: number) => void
  hide: () => void
}

let timer: ReturnType<typeof setTimeout> | null = null

/**
 * Toast 状态。
 *
 * 置于组件树之外，使非 React 上下文（如返回键回调）可直接触发提示。
 */
export const useToastStore = create<ToastState>((set) => ({
  text: null,

  show: (text, durationMs = 1500) => {
    if (timer) clearTimeout(timer)
    set({ text })
    timer = setTimeout(() => {
      timer = null
      set({ text: null })
    }, durationMs)
  },

  hide: () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    set({ text: null })
  },
}))

/** 命令式调用入口，供非 React 上下文使用 */
export const showToast = (text: string, durationMs?: number): void => {
  useToastStore.getState().show(text, durationMs)
}
