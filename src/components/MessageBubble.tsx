import { formatClock } from '@/messages/format'
import type { Message } from '@/messages/types'

import { UpdateCard } from './UpdateCard'

interface MessageBubbleProps {
  message: Message
  /** 本机当前版本名，供更新卡片显示。仅对 update-card 类型有意义 */
  currentVersion?: string
  /** 以下三个回调仅对 update-card 类型的消息有意义 */
  onUpdate?: () => void
  onCancel?: () => void
  onInstall?: () => void
}

/**
 * 消息气泡。
 *
 * 当前所有消息都由系统发出，故一律靠左。我方气泡的样式变量
 * （`--color-background-own`）已备好，待出现用户发言场景再启用。
 */
export function MessageBubble({
  message,
  currentVersion,
  onUpdate,
  onCancel,
  onInstall,
}: MessageBubbleProps) {
  return (
    <div className="bubble-row">
      <div className="bubble">
        {message.kind.type === 'text' ? (
          <p className="bubble__text selectable">{message.kind.text}</p>
        ) : (
          <UpdateCard
            card={message.kind.card}
            currentVersion={currentVersion}
            onUpdate={onUpdate}
            onCancel={onCancel}
            onInstall={onInstall}
          />
        )}
        <span className="bubble__time">{formatClock(message.ts)}</span>
      </div>
    </div>
  )
}
