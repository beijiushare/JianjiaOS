interface ComposerProps {
  disabled?: boolean
  placeholder?: string
}

/**
 * 聊天输入条。
 *
 * ⚠️ 禁用态用 `<input disabled>` 而非 `readOnly` ——
 *    readOnly 仍可聚焦，会弹出光标和键盘；此处要的是彻底不接受输入。
 *
 * 禁用态不做半透明处理：降透明度看起来像「加载中」，
 * 而这里表达的是「此会话不接受输入」，应安静地灰着。
 */
export function Composer({ disabled = false, placeholder }: ComposerProps) {
  return (
    <div className="composer">
      <input
        className="composer__field"
        type="text"
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  )
}
