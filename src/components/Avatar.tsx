interface AvatarProps {
  /** 显示在头像中央的初字 */
  text: string
}

/**
 * 圆形头像。
 *
 * 初字字号约为直径的一半（my_telegram_taste 的 Avatar 规则），
 * 具体尺寸在 CSS 中按 `--avatar-size` 推导。
 */
export function Avatar({ text }: AvatarProps) {
  return (
    <span className="avatar" aria-hidden="true">
      {text}
    </span>
  )
}
