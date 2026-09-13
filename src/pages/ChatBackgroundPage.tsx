import type { CSSProperties } from 'react'

import { ScreenShell } from '@/components/ScreenShell'
import { CHAT_BACKGROUNDS } from '@/settings/backgrounds'
import { useSettingsStore } from '@/settings/store'

/**
 * 聊天背景选择页。
 *
 * 缩略图与聊天页用同一套 mask 方案（见 index.css 的 .chat-preview），
 * 因此预览色会跟随深浅主题，与真实效果一致。
 */
export function ChatBackgroundPage() {
  const currentId = useSettingsStore((s) => s.chatBackgroundId)
  const setChatBackground = useSettingsStore((s) => s.setChatBackground)

  return (
    <ScreenShell title="聊天背景" bodyClassName="screen-body--muted">
      <div className="chat-bg-grid">
        {CHAT_BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            type="button"
            className={
              bg.id === currentId
                ? 'chat-bg-grid__item is-selected'
                : 'chat-bg-grid__item'
            }
            aria-pressed={bg.id === currentId}
            onClick={() => setChatBackground(bg.id)}
          >
            <span
              className="chat-bg-grid__preview"
              style={{ '--chat-bg': `url(${bg.url})` } as CSSProperties}
            />
            <span className="chat-bg-grid__name">{bg.name}</span>
          </button>
        ))}
      </div>
    </ScreenShell>
  )
}
