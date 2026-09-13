import CloseIcon from '@/assets/icons/close-line.svg?react'
import SearchIcon from '@/assets/icons/search-line.svg?react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 输入框获得焦点。移动端等同于键盘弹起 */
  onFocus?: () => void
  /** 输入框失去焦点 */
  onBlur?: () => void
}

/**
 * 搜索框。
 *
 * 规格取自 my_telegram_taste 的 SearchInput：高 2.5rem、胶囊圆角 1.375rem、
 * 底色 chat-hover、**无边框**、内含 1.5rem 放大镜图标。
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
}: SearchInputProps) {
  return (
    <div className="search-input">
      <SearchIcon className="search-input__icon" aria-hidden="true" />

      <input
        className="search-input__field"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {value !== '' && (
        <button
          type="button"
          className="search-input__clear"
          aria-label="清除"
          onClick={() => onChange('')}
        >
          <CloseIcon className="search-input__icon" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
