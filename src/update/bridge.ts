/**
 * 更新模块与消息系统的桥接层。
 *
 * `client.ts` 只负责「怎么检查 / 怎么下载」，不知道 UI 长什么样；
 * 本文件负责「什么时候发消息、发什么内容」。
 *
 * 核心约定：**状态变化一律以「发新消息」表达，不改写已有消息。**
 * 更新卡片是「某版本发布过」的历史记录，下载、安装这些过程状态各自成条 ——
 * 这样消息列表读起来就是一条完整的时间线。唯一的例外是「正在下载中」那条，
 * 它的百分比需要原地刷新（它本身就是当前进度的载体，不是历史）。
 */

import { useMessagesStore } from '@/messages/store'
import type { DownloadMessageState } from '@/messages/types'
import { errText, nextMessageId } from '@/utils'

import {
  type ReleaseInfo,
  UpdateError,
  checkForUpdate,
  downloadUpdate,
  installUpdate,
  resumePendingDownload,
} from './client'

function reasonOf(e: unknown, fallback: string): string {
  return e instanceof UpdateError ? e.message : fallback
}

function setDownloadState(messageId: string, state: DownloadMessageState): void {
  useMessagesStore.getState().setDownloadState(messageId, state)
}

/** 追加一条纯文本消息 */
function pushText(text: string): void {
  useMessagesStore.getState().appendMessage({
    id: nextMessageId(),
    chatId: 'system',
    from: 'system',
    ts: Date.now(),
    read: false,
    kind: { type: 'text', text },
  })
}

/** 追加一条下载消息，返回它的 id 供后续原地刷新进度 */
function pushDownloadMessage(): string {
  const id = nextMessageId()
  useMessagesStore.getState().appendMessage({
    id,
    chatId: 'system',
    from: 'system',
    ts: Date.now(),
    read: false,
    kind: { type: 'download', state: { status: 'downloading' } },
  })
  return id
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
      card: { versionName: info.versionName, notes: info.notes },
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
  console.log(
    `[update] 冷启动检查结果 kind=${result.kind}` +
      (result.kind === 'failed' ? ` reason=${result.reason}` : '') +
      (result.kind === 'update' ? ` version=${result.info.versionName}` : ''),
  )
  if (result.kind !== 'update') return
  notifyUpdate(result.info)
}

/**
 * 冷启动接管未完成的下载。
 *
 * 场景：用户下载到一半把 App 划掉。DownloadManager 仍在系统进程里下，
 * 但 JS 侧的轮询已消失。重启后靠这个把状态接回来。
 *
 * 若上次已经下完只差安装，发一条「下载完成」消息 —— 但**不主动拉安装器**，
 * 安装必须由用户确认（设计文档 §4.5）。
 */
export async function resumeOnStartup(): Promise<void> {
  try {
    const resumed = await resumePendingDownload()
    if (!resumed) return

    console.log(`[update] 接管到已下载完成的版本 ${resumed.versionName}`)

    const id = nextMessageId()
    useMessagesStore.getState().appendMessage({
      id,
      chatId: 'system',
      from: 'system',
      ts: Date.now(),
      read: false,
      kind: { type: 'download', state: { status: 'downloaded' } },
    })
  } catch (e) {
    console.warn(`[update] 接管未完成下载失败: ${errText(e)}`)
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
 * 与冷启动的区别：**要反馈**（设计文档 §9.2）。
 * 本函数只返回结果，不直接弹 Toast —— 提示方式留给调用方。
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
 * 用户点更新卡片上的「更新」。
 *
 * 分三步：
 *   ① 先重新检查 —— 缓存的那条卡片可能已经过期（用户手动装过新版、
 *      或对应 Release 被删了）。已是最新就**发条消息告知**，
 *      而不是默默什么都不做。
 *   ② 发一条「正在下载中」消息，后续原地刷新它的百分比
 *   ③ 结束时就地改写**这条下载消息**为「下载完成」或「下载失败」
 *
 * ⚠️ 更新卡片本身全程不变 —— 它是历史记录，不该被下载流程改写。
 */
export async function startDownload(): Promise<void> {
  console.log('[update] 用户点更新')

  const result = await checkForUpdate()
  console.log(
    `[update] 重新检查完成 kind=${result.kind}` +
      (result.kind === 'failed' ? ` reason=${result.reason}` : '') +
      (result.kind === 'update'
        ? ` version=${result.info.versionName} assets=${String(result.info.assets.length)}`
        : ''),
  )

  if (result.kind === 'up-to-date') {
    pushText('当前已是最新版本')
    return
  }
  if (result.kind === 'failed') {
    pushText(`检查更新失败：${result.reason}`)
    return
  }

  const downloadId = pushDownloadMessage()

  try {
    // 不订阅进度 —— 见 DownloadMessageState 的说明：代理转发常拿不到
    // Content-Length，进度算出来是 -1，显示出来反而误导
    await downloadUpdate(result.info)
    console.log('[update] 下载完成')
    setDownloadState(downloadId, { status: 'downloaded' })
  } catch (e) {
    const reason = reasonOf(e, '下载失败')
    console.warn(`[update] 下载流程抛错: ${reason}`)
    setDownloadState(downloadId, { status: 'failed', reason })
  }
}

/** 用户点下载消息上的「安装」：拉起系统安装器 */
export async function installDownloaded(downloadId: string): Promise<void> {
  try {
    await installUpdate()
  } catch (e) {
    const reason = reasonOf(e, '安装失败')
    console.warn(`[update] 安装失败: ${reason}`)
    setDownloadState(downloadId, { status: 'failed', reason })
  }
}

/**
 * 开发环境注入的模拟消息。
 *
 * ⚠️ 仅 DEV 构建调用，生产会被 Vite 静态剔除。
 *    用途：没有 Android 工程时无法真实检查更新，靠它查看卡片与下载消息的 UI。
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
      },
    },
  })

  pushDownloadMessage()
}
