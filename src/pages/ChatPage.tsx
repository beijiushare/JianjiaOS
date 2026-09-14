import { type CSSProperties, useEffect, useState } from 'react'

import { Composer } from '@/components/Composer'
import { MessageBubble } from '@/components/MessageBubble'
import { ScreenShell } from '@/components/ScreenShell'
import { selectChatMessages, useMessagesStore } from '@/messages/store'
import { findBackground } from '@/settings/backgrounds'
import { useSettingsStore } from '@/settings/store'
import { getAppVersion } from '@/settings/version'
import { installDownloaded, startDownload } from '@/update/bridge'

/**
 * 聊天详情页。
 *
 * 气泡流 + 禁用态输入条。规格见设计文档 §4.5。
 *
 * ⚠️ 当前写死取 chats[0]（即「系统消息」），因为消息列表只有这一项。
 *    接入多会话时，导航层需要支持携带参数（NavLayer 增加 params），
 *    由消息列表把 chatId 传进来，不能继续用索引取。
 */
export function ChatPage() {
  const chat = useMessagesStore((s) => s.chats[0])
  const messages = useMessagesStore((s) => s.messages)
  const backgroundId = useSettingsStore((s) => s.chatBackgroundId)
  const removeMessage = useMessagesStore((s) => s.removeMessage)
  const markChatRead = useMessagesStore((s) => s.markChatRead)

  /*
    停留在这个会话期间持续标记已读。

    ⚠️ 只在「进入时标记一次」是不够的 —— 用户在这里点更新，会当场产生
       好几条新消息（正在下载中 / 下载完成 / 当前已是最新版本），
       而那些消息发出来时是未读的，没人标记。结果人明明看着，退出后
       会话列表却显示未读，要重新进来一次才消掉。

    markChatRead 内部做了「无未读则原样返回」的短路，所以这里可以安全地
    随 messages 变化反复调用，不会形成渲染循环。
  */
  useEffect(() => {
    markChatRead(chat.id)
  }, [messages, chat.id, markChatRead])

  // 更新卡片要显示「当前版本」，取自原生层的 App.getInfo()
  const [currentVersion, setCurrentVersion] = useState('')
  useEffect(() => {
    void getAppVersion().then(setCurrentVersion)
  }, [])

  const list = selectChatMessages(messages, chat.id)
  const background = findBackground(backgroundId)

  return (
    <ScreenShell
      title={chat.title}
      screenClassName="screen--chat"
      // 背景图案经 CSS 变量传给样式层。图案是单色线条画，只能当 mask 用
      screenStyle={{ '--chat-bg': `url(${background.url})` } as CSSProperties}
      headerClassName="screen-header--chat"
      bodyClassName="screen-body--chat"
      footer={
        <Composer
          disabled={!chat.canReply}
          placeholder={chat.canReply ? '输入消息' : '暂不支持输入'}
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
            currentVersion={currentVersion}
            onUpdate={() => void startDownload()}
            onInstall={() => void installDownloaded(m.id)}
            onDelete={() => removeMessage(m.id)}
          />
        ))
      )}
    </ScreenShell>
  )
}
