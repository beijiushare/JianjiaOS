/**
 * 消息与会话模型。规格见设计文档 §5.1。
 */

import type { ComponentType } from 'react'

export type ChatId = 'system'

/**
 * 更新卡片的状态。
 *
 * 只有两种 —— 卡片是「某版本发布过」的历史记录，不再随下载流程变形：
 *   idle       可更新（显示「取消 / 更新」按钮）
 *   cancelled  已忽略本次更新（显示「重新下载」）
 *
 * ⚠️ 下载中 / 已下载 / 安装中 / 失败这些**过程状态已迁出**，
 *    改为各自发一条新消息（见 DownloadMessageState）。
 *    设计文档 §5.2 描述的状态机是旧设计，已作废。
 */
export type UpdateCardState = { status: 'idle' } | { status: 'cancelled' }

export interface UpdateCard {
  /** 目标版本名，如 0.2.0 */
  versionName: string
  /**
   * 更新说明，Markdown 原文。
   * 来源是 GitHub Release 的 body —— 发布时在 workflow 的 notes 输入框里填的内容。
   */
  notes: string
  /**
   * 卡片自身的状态。
   *
   * ⚠️ 只保留 idle / cancelled 两种。
   *    下载、安装这些过程状态已改为「另发新消息」，卡片不再跟随变形 ——
   *    它是「某版本发布过」的历史记录，不该被后续操作改写。
   */
  state: UpdateCardState
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
