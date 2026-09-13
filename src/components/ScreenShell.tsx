import type { CSSProperties, ReactNode } from 'react'

import ArrowLeftIcon from '@/assets/icons/arrow-left-line.svg?react'
import { handleBack } from '@/nav/useBackHandler'

interface ScreenShellProps {
  title: string
  /** 追加到最外层 `.screen` 上的修饰类 */
  screenClassName?: string
  /** 最外层 `.screen` 的行内样式。用于传入 CSS 变量（如聊天背景图 URL） */
  screenStyle?: CSSProperties
  /** 追加到顶部栏 `.screen-header` 上的修饰类。聊天页用它换成更矮的头部 */
  headerClassName?: string
  /** 追加到内容区 `.screen-body` 上的修饰类，用于按页面调整背景等 */
  bodyClassName?: string
  /** 固定在内容区下方的元素，如聊天输入条 */
  footer?: ReactNode
  children: ReactNode
}

/**
 * 子页面外壳：顶部栏（返回按钮 + 标题）+ 内容区 + 可选底栏。
 *
 * 顶部栏默认取 `--column-header-height`（4rem，Telegram 的栏目头尺寸）。
 * 聊天页需传 `headerClassName="screen-header--chat"` 换成 3rem ——
 * telegram-tt 中聊天头比栏目头矮一档。
 *
 * 背景类装饰（如聊天背景图案）挂在最外层 `.screen` 上而非滚动的内容区，
 * 这样图案不随内容滚动。
 */
export function ScreenShell({
  title,
  screenClassName,
  screenStyle,
  headerClassName,
  bodyClassName,
  footer,
  children,
}: ScreenShellProps) {
  return (
    <div
      className={
        screenClassName === undefined ? 'screen' : `screen ${screenClassName}`
      }
      style={screenStyle}
    >
      <header
        className={
          headerClassName === undefined
            ? 'screen-header'
            : `screen-header ${headerClassName}`
        }
      >
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

      <div
        className={
          bodyClassName === undefined
            ? 'screen-body'
            : `screen-body ${bodyClassName}`
        }
      >
        {children}
      </div>

      {footer !== undefined && <div className="screen-footer">{footer}</div>}
    </div>
  )
}
