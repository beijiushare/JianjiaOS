import type { ComponentType } from 'react'

interface AvatarProps {
  /** 头像图标。设置后不再显示初字 */
  icon?: ComponentType<{ className?: string }>
  /** 显示在头像中央的初字。icon 缺省时使用 */
  text?: string
}

/**
 * 圆形头像。
 *
 * 初字字号约为直径的一半（my_telegram_taste 的 Avatar 规则），
 * 具体尺寸在 CSS 中按 `--avatar-size` 推导。
 */
export function Avatar({ icon: Icon, text }: AvatarProps) {
  return (
    <span className="avatar" aria-hidden="true">
      {Icon !== undefined ? (
        <Icon className="avatar__icon" />
      ) : (
        (text ?? '')
      )}
    </span>
  )
}
