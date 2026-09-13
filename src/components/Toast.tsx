import { createPortal } from 'react-dom'

import { useToastStore } from './toastStore'

/**
 * 全局轻提示。
 *
 * 必须 Portal 至 `#layer-root`（`#root` 的兄弟节点）。本体为 `position: fixed`，
 * 而 fixed 元素不可存在 overflow / transform 祖先，否则 Android WebView 真机不渲染。
 */
export function Toast() {
  const text = useToastStore((s) => s.text)

  const root = document.getElementById('layer-root')
  if (!text || !root) return null

  return createPortal(
    <div className="toast" role="status" aria-live="polite">
      {text}
    </div>,
    root,
  )
}
