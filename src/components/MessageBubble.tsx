import { useRef, useState } from 'react'

import { formatClock } from '@/messages/format'
import type { Message } from '@/messages/types'

import { DownloadMessage } from './DownloadMessage'
import { UpdateCard } from './UpdateCard'

interface MessageBubbleProps {
  message: Message
  /** 本机当前版本名，供更新卡片显示 */
  currentVersion?: string
  onUpdate?: () => void
  onCancelDownload?: () => void
  onInstall?: () => void
  onDelete?: () => void
}

/**
 * 消息气泡。
 *
 * 当前所有消息都由系统发出，故一律靠左。
 *
 * 长按（移动端 500ms / 桌面端右键）在气泡旁显示删除按钮 ——
 * 学 Telegram 的长按删除，但省掉了它的操作菜单，只有「删除」一个动作。
 */
export function MessageBubble({
  message,
  currentVersion,
  onUpdate,
  onCancelDownload,
  onInstall,
  onDelete,
}: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startPress = (): void => {
    timerRef.current = setTimeout(() => setMenuOpen(true), 500)
  }
  const cancelPress = (): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return (
    <div className="bubble-row">
      <div
        className="bubble"
        {...{
          onTouchStart: startPress,
          onTouchEnd: cancelPress,
          onTouchMove: cancelPress,
          onContextMenu: (e: React.MouseEvent) => {
            e.preventDefault()
            setMenuOpen(true)
          },
        }}
      >
        {renderBody()}
        <span className="bubble__time">{formatClock(message.ts)}</span>
      </div>

      {menuOpen && onDelete !== undefined && (
        <button
          type="button"
          className="bubble__delete"
          onClick={() => {
            setMenuOpen(false)
            onDelete()
          }}
        >
          删除
        </button>
      )}
    </div>
  )

  function renderBody() {
    switch (message.kind.type) {
      case 'text':
        return <p className="bubble__text selectable">{message.kind.text}</p>

      case 'update-card':
        return (
          <UpdateCard
            card={message.kind.card}
            currentVersion={currentVersion}
            onUpdate={onUpdate}
          />
        )

      case 'download':
        return (
          <DownloadMessage
            state={message.kind.state}
            onCancel={onCancelDownload}
            onInstall={onInstall}
          />
        )
    }
  }
}
