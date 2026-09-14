/**
 * 消息与会话模型。规格见设计文档 §5.1。
 */

import type { ComponentType } from 'react'

export type ChatId = 'system'

/**
 * 更新卡片**没有状态**。
 *
 * 卡片表达的是「某版本发布过」这一个事实，是历史记录：
 *   · 下载 / 安装这些过程状态 → 各自发一条新消息（见 DownloadMessageState）
 *   · 「忽略本次更新」也不做 —— notifiedVersions 已按版本名去重，
 *     同一版本只会发一次卡片，重启也不会重发，没有要忽略的东西
 *
 * 设计文档 §5.2 描述的「卡片状态机」是旧设计，已作废。
 */

export interface UpdateCard {
  /** 目标版本名，如 0.2.0 */
  versionName: string
  /**
   * 更新说明，Markdown 原文。
   * 来源是 GitHub Release 的 body —— 发布时在 workflow 的 notes 输入框里填的内容。
   */
  notes: string
}

/**
 * 下载进度消息的状态。
 *
 * ⚠️ 与 UpdateCard.state 的区别：那是「一张卡片随流程变形」的旧设计，
 *    现在改为「每件事发一条新消息」，卡片本身不再变更。
 *    本状态只描述「这一条下载消息」当前处于哪个阶段。
 */
export type DownloadMessageState =
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded' }
  | { status: 'failed'; reason: string }

export type MessageKind =
  | { type: 'text'; text: string }
  | { type: 'update-card'; card: UpdateCard }
  | { type: 'download'; state: DownloadMessageState }

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
