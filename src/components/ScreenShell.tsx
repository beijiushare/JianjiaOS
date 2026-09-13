import type { ReactNode } from 'react'

import ArrowLeftIcon from '@/assets/icons/arrow-left-line.svg?react'
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
          <ArrowLeftIcon className="icon-btn__icon" />
        </button>
        <h1 className="screen-title">{title}</h1>
      </header>

      <div className="screen-body">{children}</div>
    </div>
  )
}
