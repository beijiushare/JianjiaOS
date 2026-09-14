import { Avatar } from '@/components/Avatar'
import { Badge } from '@/components/Badge'
import { ScreenShell } from '@/components/ScreenShell'
import { formatListTime, previewOf } from '@/messages/format'
import { selectChatMessages, useMessagesStore } from '@/messages/store'
import type { ChatId } from '@/messages/types'
import { useNavStore } from '@/nav/store'

/**
 * 消息列表页（会话列表）。
 *
 * 采用 Telegram 会话列表范式：头像 + 两行文本 + 右侧时间与未读角标。
 * 规格见设计文档 §4.4。
 */
export function MessagesPage() {
  const chats = useMessagesStore((s) => s.chats)
  const messages = useMessagesStore((s) => s.messages)
  const markChatRead = useMessagesStore((s) => s.markChatRead)
  const push = useNavStore((s) => s.push)

  const openChat = (chatId: ChatId): void => {
    markChatRead(chatId)
    push('chat')
  }

  return (
    <ScreenShell title="消息" bodyClassName="screen-body--flush">
      <div className="chat-list">
        {chats.map((chat) => {
          const list = selectChatMessages(messages, chat.id)
          const last = list[list.length - 1]
          const unread = list.reduce((n, m) => (m.read ? n : n + 1), 0)

          return (
            <button
              key={chat.id}
              type="button"
              className="chat-list__row"
              onClick={() => openChat(chat.id)}
            >
              <Avatar icon={chat.icon} text={chat.avatarText} />

              <span className="chat-list__main">
                <span className="chat-list__title">{chat.title}</span>
                <span className="chat-list__preview">{previewOf(last)}</span>
              </span>

              <span className="chat-list__meta">
                <span className="chat-list__time">
                  {last === undefined ? '' : formatListTime(last.ts)}
                </span>
                {unread > 0 && <Badge count={unread} />}
              </span>
            </button>
          )
        })}
      </div>
    </ScreenShell>
  )
}
