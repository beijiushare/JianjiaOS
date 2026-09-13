import type { ReactNode } from 'react'

import { handleBack } from '@/nav/useBackHandler'

interface ScreenShellProps {
  title: string
  children: ReactNode
}

/**
 * 子页面外壳：顶部栏（返回按钮 + 标题）+ 内容区。
 *
 * 顶部栏高度取 `--column-header-height`（4rem），与 Telegram 栏目头尺寸一致。
 */
export function ScreenShell({ title, children }: ScreenShellProps) {
  return (
    <div className="screen">
      <header className="screen-header">
        <button
          type="button"
          className="icon-btn"
          aria-label="返回"
          onClick={handleBack}
        >
          {/* TODO(骨架): 替换为 RemixIcon Arrows/arrow-left-line.svg */}
          <span className="icon-btn__glyph">←</span>
        </button>
        <h1 className="screen-title">{title}</h1>
      </header>

      <div className="screen-body">{children}</div>
    </div>
  )
}
