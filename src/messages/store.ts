import { create } from 'zustand'

import type { Chat, ChatId, Message, UpdateCardState } from './types'

/**
 * 「系统消息」会话常驻：即使一条消息都没有，它也显示在会话列表里。
 * 设计文档 §5.1。
 */
const SYSTEM_CHAT: Chat = {
  id: 'system',
  title: '系统消息',
  avatarText: '系',
  canReply: false,
}

interface MessagesState {
  chats: Chat[]
  messages: Message[]
  /** 已经就哪些版本发过更新消息。用于去重，避免每次冷启动重复插入（§5.3） */
  notifiedVersions: string[]

  /** 追加一条消息 */
  appendMessage: (message: Message) => void
  /** 更新消息携带的更新卡片。仅对 update-card 类型的消息生效 */
  setCardState: (messageId: string, state: UpdateCardState) => void
  /** 记录「已就某版本发过更新消息」 */
  markNotified: (versionName: string) => void
  /** 把某会话的消息全部标记为已读 */
  markChatRead: (chatId: ChatId) => void
}

export const useMessagesStore = create<MessagesState>((set) => ({
  chats: [SYSTEM_CHAT],
  messages: [],
  notifiedVersions: [],

  appendMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  setCardState: (messageId, state) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId && m.kind.type === 'update-card'
          ? { ...m, kind: { type: 'update-card', card: { ...m.kind.card, state } } }
          : m,
      ),
    })),

  markNotified: (versionName) =>
    set((s) =>
      s.notifiedVersions.includes(versionName)
        ? s
        : { notifiedVersions: [...s.notifiedVersions, versionName] },
    ),

  markChatRead: (chatId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.chatId === chatId && !m.read ? { ...m, read: true } : m,
      ),
    })),
}))

/** 取某会话的消息，按时间升序 */
export function selectChatMessages(
  messages: Message[],
  chatId: ChatId,
): Message[] {
  return messages
    .filter((m) => m.chatId === chatId)
    .sort((a, b) => a.ts - b.ts)
}

/**
 * 未读总数。
 *
 * 由 messages 派生而非单独存储 —— 存两份必然会出现不同步。
 */
export const selectUnreadCount = (s: MessagesState): number =>
  s.messages.reduce((n, m) => (m.read ? n : n + 1), 0)
