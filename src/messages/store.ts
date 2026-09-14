import { create } from 'zustand'

import SettingsIcon from '@/assets/icons/settings-3-line.svg?react'

import type {
  Chat,
  ChatId,
  DownloadMessageState,
  Message,
} from './types'

/**
 * 「系统消息」会话常驻：即使一条消息都没有，它也显示在会话列表里。
 * 设计文档 §5.1。
 *
 * 头像用设置图标 —— 系统消息承载的是全应用级的通知，设置图标是最贴近的语义。
 */
const SYSTEM_CHAT: Chat = {
  id: 'system',
  title: '系统消息',
  icon: SettingsIcon,
  canReply: false,
}

interface MessagesState {
  chats: Chat[]
  messages: Message[]
  /** 已经就哪些版本发过更新消息。用于去重，避免每次冷启动重复插入（§5.3） */
  notifiedVersions: string[]

  /** 追加一条消息 */
  appendMessage: (message: Message) => void
  /** 删除一条消息（用户长按删除） */
  removeMessage: (messageId: string) => void
  /** 更新下载消息的状态。仅对 download 类型的消息生效 */
  setDownloadState: (messageId: string, state: DownloadMessageState) => void
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

  removeMessage: (messageId) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== messageId) })),

  setDownloadState: (messageId, state) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId && m.kind.type === 'download'
          ? { ...m, kind: { type: 'download', state } }
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
    set((s) => {
      // ⚠️ 没有未读时返回原 state 对象，不产生新数组。
      //    否则每次调用都会触发订阅者重渲染，而 ChatPage 会在停留期间
      //    持续调用本方法，形成「渲染 → 标记 → 再渲染」的死循环。
      if (!s.messages.some((m) => m.chatId === chatId && !m.read)) return s

      return {
        messages: s.messages.map((m) =>
          m.chatId === chatId ? { ...m, read: true } : m,
        ),
      }
    }),
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
