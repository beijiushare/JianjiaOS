/**
 * 消息与会话模型。规格见设计文档 §5.1。
 */

import type { ComponentType } from 'react'

export type ChatId = 'system'

/**
 * 更新卡片的状态机（设计文档 §5.2）。
 *
 * idle → downloading → downloaded → installing
 *   └→ cancelled / failed
 */
export type UpdateCardState =
  | { status: 'idle' }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded' }
  | { status: 'installing' }
  | { status: 'cancelled' }
  | { status: 'failed'; reason: string }

export interface UpdateCard {
  /** 目标版本名，如 0.2.0 */
  versionName: string
  /**
   * 更新说明，Markdown 原文。
   * 来源是 GitHub Release 的 body —— 发布时在 workflow 的 notes 输入框里填的内容。
   */
  notes: string
  state: UpdateCardState
}

export type MessageKind =
  | { type: 'text'; text: string }
  | { type: 'update-card'; card: UpdateCard }

export interface Message {
  id: string
  chatId: ChatId
  /** 当前只由系统发出 */
  from: 'system'
  kind: MessageKind
  /** 毫秒时间戳 */
  ts: number
  read: boolean
}

export interface Chat {
  id: ChatId
  title: string
  /** 头像图标。设置后不再显示初字 */
  icon?: ComponentType<{ className?: string }>
  /** 头像上的初字。icon 缺省时使用 */
  avatarText?: string
  /** 是否允许输入。系统消息为 false，Composer 渲染为禁用态（§4.5） */
  canReply: boolean
}
