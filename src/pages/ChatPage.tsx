import { Composer } from '@/components/Composer'
import { MessageBubble } from '@/components/MessageBubble'
import { ScreenShell } from '@/components/ScreenShell'
import { selectChatMessages, useMessagesStore } from '@/messages/store'
import {
  abortDownload,
  installDownloaded,
  startDownload,
} from '@/update/bridge'

/**
 * 聊天详情页。
 *
 * 气泡流 + 禁用态输入条。规格见设计文档 §4.5。
 * 当前固定展示「系统消息」会话 —— 消息列表也只有这一项。
 */
export function ChatPage() {
  const chat = useMessagesStore((s) => s.chats[0])
  const messages = useMessagesStore((s) => s.messages)

  const list = selectChatMessages(messages, chat.id)

  return (
    <ScreenShell
      title={chat.title}
      bodyClassName="screen-body--chat"
      footer={
        <Composer
          disabled={!chat.canReply}
          placeholder={chat.canReply ? '输入消息' : '系统消息，暂不支持回复'}
        />
      }
    >
      {list.length === 0 ? (
        <p className="chat-empty">暂无消息</p>
      ) : (
        list.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onUpdate={() => void startDownload(m.id)}
            onCancel={() => void abortDownload(m.id)}
            onInstall={() => void installDownloaded(m.id)}
          />
        ))
      )}
    </ScreenShell>
  )
}
