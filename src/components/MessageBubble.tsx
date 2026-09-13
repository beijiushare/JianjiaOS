import { formatClock } from '@/messages/format'
import type { Message } from '@/messages/types'

import { UpdateCard } from './UpdateCard'

interface MessageBubbleProps {
  message: Message
}

/**
 * 消息气泡。
 *
 * 当前所有消息都由系统发出，故一律靠左。我方气泡的样式变量
 * （`--color-background-own`）已备好，待出现用户发言场景再启用。
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className="bubble-row">
      <div className="bubble">
        {message.kind.type === 'text' ? (
          <p className="bubble__text selectable">{message.kind.text}</p>
        ) : (
          <UpdateCard card={message.kind.card} />
        )}
        <span className="bubble__time">{formatClock(message.ts)}</span>
      </div>
    </div>
  )
}
