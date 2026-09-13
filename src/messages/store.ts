import { create } from 'zustand'

interface MessagesState {
  /** 未读消息数，供主屏的未读提示展示 */
  unreadCount: number
}

/**
 * 消息状态。
 *
 * 当前为占位实现，仅提供未读数。完整的消息 / 会话模型（含持久化、
 * 更新卡片状态机、触发与去重）见设计文档 §5。
 */
export const useMessagesStore = create<MessagesState>(() => ({
  unreadCount: 0,
}))
