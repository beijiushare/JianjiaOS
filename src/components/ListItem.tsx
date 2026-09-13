import type { ReactNode } from 'react'

import ChevronIcon from '@/assets/icons/arrow-right-s-line.svg?react'

interface ListItemProps {
  /** 左侧图标 */
  icon?: ReactNode
  /** 主标题 */
  title: string
  /** 右侧值，显示为次要色文字 */
  value?: string
  /** 是否显示右侧箭头 */
  chevron?: boolean
  /** 点击回调。省略则为不可点击行 */
  onClick?: () => void
}

/**
 * 列表行。
 *
 * 范式取自 my_telegram_taste：满宽可点行 + 细分割线 + 右侧值灰色。
 * 设置页、菜单、会话列表共用这一套外观。
 *
 * 分割线由容器 `.list-group` 用 `::before` 绘制，行本身不画 ——
 * 这样最后一行下方不会多出一条线，且能控制左缩进避开图标。
 */
export function ListItem({
  icon,
  title,
  value,
  chevron,
  onClick,
}: ListItemProps) {
  const content = (
    <>
      {icon !== undefined && <span className="list-item__icon">{icon}</span>}
      <span className="list-item__title">{title}</span>
      {value !== undefined && <span className="list-item__value">{value}</span>}
      {chevron === true && <ChevronIcon className="list-item__chevron" />}
    </>
  )

  if (onClick === undefined) {
    return <div className="list-item">{content}</div>
  }

  return (
    <button
      type="button"
      className="list-item list-item--clickable"
      onClick={onClick}
    >
      {content}
    </button>
  )
}
