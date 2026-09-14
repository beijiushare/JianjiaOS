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
  type ReleaseInfo,
  UpdateError,
  cancelUpdate,
  checkForUpdate,
  downloadUpdate,
  installUpdate,
  resumePendingDownload,
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
 * 往「系统消息」插一条更新卡片。返回是否真的插入了。
 *
 * ⚠️ 按版本名去重：否则每次冷启动都会插一条重复消息，
 *    用户一打开应用就看到十几条「发现新版本」。
 */
function notifyUpdate(info: ReleaseInfo): boolean {
  const store = useMessagesStore.getState()
  if (store.notifiedVersions.includes(info.versionName)) return false

  store.appendMessage({
    id: nextMessageId(),
    chatId: 'system',
    from: 'system',
    ts: Date.now(),
    read: false,
    kind: {
      type: 'update-card',
      card: {
        versionName: info.versionName,
        notes: info.notes,
        state: { status: 'idle' },
      },
    },
  })
  store.markNotified(info.versionName)
  return true
}

/**
 * 冷启动检查更新。
 *
 * 静默执行：无更新、检查失败都不打扰用户；有更新才插一条更新卡片。
 */
export async function autoCheckOnStartup(): Promise<void> {
  const result = await checkForUpdate()
  if (result.kind !== 'update') return
  notifyUpdate(result.info)
}

/**
 * 冷启动接管未完成的下载。
 *
 * 场景：用户下载到一半把 App 划掉。DownloadManager 仍在系统进程里下，
 * 但 JS 侧的轮询已消失。重启后靠这个把状态接回来。
 *
 * 若上次已经下完只差安装，插一条「下载完成」的卡片 —— 但**不主动拉安装器**，
 * 安装必须由用户确认（设计文档 §4.5）。
 */
export async function resumeOnStartup(): Promise<void> {
  try {
    const resumed = await resumePendingDownload()
    if (!resumed) return

    // 已经就这个版本发过消息 → 把那条卡片的态改成「已下载完成」
    const store = useMessagesStore.getState()
    const existing = store.messages.find(
      (m) =>
        m.kind.type === 'update-card' &&
        m.kind.card.versionName === resumed.versionName,
    )

    if (existing) {
      setCard(existing.id, { status: 'downloaded' })
    } else {
      // 没有对应消息（消息被清过）→ 补一条，否则用户看不到可安装的入口
      store.appendMessage({
        id: nextMessageId(),
        chatId: 'system',
        from: 'system',
        ts: Date.now(),
        read: false,
        kind: {
          type: 'update-card',
          card: {
            versionName: resumed.versionName,
            // 接管场景拿不到 Release 说明（它来自 GitHub API），留空
            notes: '',
            state: { status: 'downloaded' },
          },
        },
      })
      store.markNotified(resumed.versionName)
    }
  } catch (e) {
    console.warn('[update] 接管未完成下载失败', e)
  }
}

/** 手动检查更新的结果，供 UI 决定怎么提示 */
export type ManualCheckResult =
  | { kind: 'update' }
  | { kind: 'up-to-date' }
  | { kind: 'failed'; reason: string }

/**
 * 手动检查更新（设置页入口）。
 *
 * 与冷启动的区别：**要反馈**。设计文档 §9.2 的约定是
 * 「自动检查静默，手动检查给提示」。
 *
 * 本函数只返回结果，不直接弹 Toast —— 提示方式留给调用方，
 * 与 client.ts 的 UpdateCheckResult 是同样的分工。
 */
export async function manualCheckForUpdate(): Promise<ManualCheckResult> {
  const result = await checkForUpdate()

  switch (result.kind) {
    case 'up-to-date':
      return { kind: 'up-to-date' }
    case 'failed':
      return { kind: 'failed', reason: result.reason }
    case 'update':
      notifyUpdate(result.info)
      return { kind: 'update' }
  }
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
      card: {
        versionName: '0.2.0（模拟）',
        notes: [
          '## 本次更新',
          '',
          '- 修复了下载完成却提示失败的问题',
          '- 消息列表的系统消息改用设置图标',
          '- **重要**：升级后首次启动会重建缓存',
        ].join('\n'),
        state: { status: 'idle' },
      },
    },
  })
}
