/**
 * 更新模块与消息系统的桥接层。
 *
 * `client.ts` 只负责「怎么检查 / 怎么下载」，不知道 UI 长什么样；
 * 本文件负责「什么时候发消息、发什么内容」，以及把卡片上的按钮动作
 * 接回更新流程。规格见设计文档 §5。
 */

import { useMessagesStore } from '@/messages/store'
import type { UpdateCardState } from '@/messages/types'

import {
  UpdateError,
  cancelUpdate,
  checkForUpdate,
  downloadUpdate,
  installUpdate,
} from './client'

/** 消息 id 自增序列。不用随机数 —— id 要可读、可复现，便于排查 */
let messageSeq = 0
const nextMessageId = (): string =>
  `msg-${String(Date.now())}-${String(++messageSeq)}`

function setCard(messageId: string, state: UpdateCardState): void {
  useMessagesStore.getState().setCardState(messageId, state)
}

function reasonOf(e: unknown, fallback: string): string {
  return e instanceof UpdateError ? e.message : fallback
}

/**
 * 冷启动检查更新。
 *
 * 静默执行：
 *   · 无更新 / 检查失败 → 什么都不做，不打扰用户
 *   · 有更新 → 往「系统消息」插一条更新卡片（未读）
 *
 * ⚠️ 必须按版本名去重，否则每次冷启动都会插一条重复消息，
 *    用户一打开应用就看到十几条「发现新版本」。
 */
export async function autoCheckOnStartup(): Promise<void> {
  const result = await checkForUpdate()
  if (result.kind !== 'update') return

  const { versionName } = result.info
  const store = useMessagesStore.getState()

  if (store.notifiedVersions.includes(versionName)) return

  store.appendMessage({
    id: nextMessageId(),
    chatId: 'system',
    from: 'system',
    ts: Date.now(),
    read: false,
    kind: {
      type: 'update-card',
      card: { versionName, state: { status: 'idle' } },
    },
  })
  store.markNotified(versionName)
}

/**
 * 用户点「更新」：开始下载。
 *
 * 重新执行一次检查以获取完整的 ReleaseInfo —— 消息里只存了版本名，
 * 而下载需要 asset 列表与 versionCode。
 */
export async function startDownload(messageId: string): Promise<void> {
  setCard(messageId, { status: 'downloading', percent: 0 })

  try {
    const result = await checkForUpdate()
    if (result.kind !== 'update') {
      setCard(messageId, { status: 'failed', reason: '未找到可用的更新包' })
      return
    }

    await downloadUpdate(result.info, (percent) => {
      setCard(messageId, { status: 'downloading', percent })
    })
    setCard(messageId, { status: 'downloaded' })
  } catch (e) {
    setCard(messageId, { status: 'failed', reason: reasonOf(e, '下载失败') })
  }
}

/** 用户点「取消」：中止下载并删除已落盘的文件 */
export async function abortDownload(messageId: string): Promise<void> {
  try {
    await cancelUpdate()
  } catch (e) {
    console.warn('[update] 取消下载失败', e)
  }
  setCard(messageId, { status: 'cancelled' })
}

/** 用户点「安装」：拉起系统安装器 */
export async function installDownloaded(messageId: string): Promise<void> {
  setCard(messageId, { status: 'installing' })
  try {
    await installUpdate()
  } catch (e) {
    setCard(messageId, { status: 'failed', reason: reasonOf(e, '安装失败') })
  }
}

/**
 * 开发环境注入的模拟更新消息。
 *
 * ⚠️ 仅 DEV 构建调用，生产会被 Vite 静态剔除。
 *    用途：没有 Android 工程时无法真实检查更新，靠它查看更新卡片与气泡的 UI。
 *    版本名带「（模拟）」标记，避免与真实更新混淆。
 */
export function injectDevFixture(): void {
  const store = useMessagesStore.getState()
  if (store.messages.length > 0) return

  store.appendMessage({
    id: nextMessageId(),
    chatId: 'system',
    from: 'system',
    ts: Date.now(),
    read: false,
    kind: {
      type: 'update-card',
      card: { versionName: '0.2.0（模拟）', state: { status: 'idle' } },
    },
  })
}
