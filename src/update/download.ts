/* ==========================================================================
 * download.ts —— 下载 + 换源 + 安装
 * ========================================================================== */

import { Browser } from '@capacitor/browser'
import { Preferences } from '@capacitor/preferences'

import { errText } from '@/utils'

import {
  type ApkAsset,
  type PendingDownload,
  type ReleaseInfo,
  type ResumedDownload,
  POLL_INTERVAL_MS,
  RECENT_RELEASES_URL,
  UpdateError,
} from './types'
import { ApkUpdater, candidateUrls } from './sources'

const KEY_PENDING = 'update.pending'

/* ==========================================================================
 * 持久化
 * ========================================================================== */

export async function savePending(p: PendingDownload | null): Promise<void> {
  try {
    if (p) {
      await Preferences.set({ key: KEY_PENDING, value: JSON.stringify(p) })
    } else {
      await Preferences.remove({ key: KEY_PENDING })
    }
  } catch {
    /* ignore */
  }
}

export async function loadPending(): Promise<PendingDownload | null> {
  try {
    const { value } = await Preferences.get({ key: KEY_PENDING })
    return value ? (JSON.parse(value) as PendingDownload) : null
  } catch {
    return null
  }
}

/* ==========================================================================
 * 下载 + 轮询
 * ========================================================================== */

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** 单次下载 + 轮询到完成，不换源 */
async function downloadOnce(
  url: string,
  expectedSize: number,
  versionCode: number,
  versionName: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  console.log(`[update] 入队下载 url=${url}`)
  const { id } = await ApkUpdater.download({ url })
  console.log(`[update] 入队成功 id=${String(id)}`)

  await savePending({
    id,
    versionCode,
    versionName,
    size: expectedSize,
    startedAt: Date.now(),
  })

  let status = await ApkUpdater.status({ id })
  let round = 0
  while (
    status.status === 'pending' ||
    status.status === 'running' ||
    status.status === 'paused'
  ) {
    console.log(
      `[update] 轮询#${String(++round)} status=${status.status}` +
        ` bytes=${String(status.bytesDownloaded)}/${String(status.totalBytes)}` +
        ` progress=${String(status.progress)}`,
    )
    onProgress?.(status.progress)
    await sleep(POLL_INTERVAL_MS)
    status = await ApkUpdater.status({ id })
  }

  console.log(
    `[update] 轮询结束 status=${status.status}` +
      ` bytes=${String(status.bytesDownloaded)}/${String(status.totalBytes)}` +
      ` expected=${String(expectedSize)}` +
      ` reason=${String(status.reason ?? '')}`,
  )

  if (status.status !== 'successful') {
    await ApkUpdater.cleanup({ id })
    throw new UpdateError('DOWNLOAD_FAILED', `下载失败（${status.status}）`)
  }

  if (expectedSize > 0 && status.bytesDownloaded !== expectedSize) {
    await ApkUpdater.cleanup({ id })
    throw new UpdateError(
      'INCOMPLETE',
      `下载不完整（${status.bytesDownloaded}/${expectedSize} 字节）`,
    )
  }
}

/**
 * 按候选前缀依次尝试下载 APK，任一成功即止。
 * 换源只在【失败】时触发，"慢"不会触发。
 */
export async function downloadWithFallback(
  apk: ApkAsset,
  versionCode: number,
  versionName: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const urls = candidateUrls(apk.url)
  console.log(
    `[update] 开始下载，候选源 ${String(urls.length)} 个，期望大小 ${String(apk.size)} 字节`,
  )
  let lastErr: unknown = null

  for (let i = 0; i < urls.length; i++) {
    try {
      await downloadOnce(urls[i], apk.size, versionCode, versionName, onProgress)
      console.log(`[update] 下载成功（第 ${String(i + 1)}/${String(urls.length)} 个源）`)
      return
    } catch (e) {
      lastErr = e
      console.warn(
        `[update] 源 ${String(i + 1)}/${String(urls.length)} 失败: ${errText(e)}`,
      )
    }
  }

  console.warn(`[update] 全部源均失败，最后一个错误: ${errText(lastErr)}`)

  throw lastErr instanceof UpdateError
    ? lastErr
    : new UpdateError('DOWNLOAD_FAILED', '所有下载源都失败了')
}

/* ==========================================================================
 * 下载入口
 * ========================================================================== */

/**
 * 下载新版本，不安装。
 * 下载与安装拆成两步，因为 UI 需要在两者之间插入用户确认。
 */
export async function downloadUpdate(
  info: ReleaseInfo,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const { pickApk } = await import('./sources')

  const apk = await pickApk(info)
  if (!apk) {
    await Browser.open({ url: RECENT_RELEASES_URL })
    throw new UpdateError(
      'NO_MATCHING_APK',
      '没有适配本机架构的安装包，已为你打开下载页面',
    )
  }

  const { granted } = await ApkUpdater.checkInstallPermission()
  if (!granted) {
    await ApkUpdater.requestInstallPermission()
    throw new UpdateError(
      'NEED_INSTALL_PERMISSION',
      '请先允许本应用安装未知来源的应用，然后重试',
    )
  }

  try {
    await downloadWithFallback(
      apk,
      info.versionCode,
      info.versionName,
      onProgress,
    )
  } catch (e) {
    await savePending(null)
    throw e
  }
}

export async function installUpdate(): Promise<void> {
  await ApkUpdater.install()
  await savePending(null)
}

/* ==========================================================================
 * 接管未完成下载
 * ========================================================================== */

/**
 * 启动时调用：接管上次没下完 / 下完没装的更新。
 * 返回「已下载完成待安装」的信息，由调用方决定何时安装。
 */
export async function resumePendingDownload(): Promise<ResumedDownload | null> {
  const pending = await loadPending()
  if (!pending) return null

  try {
    const status = await ApkUpdater.status({ id: pending.id })

    if (status.status === 'successful') {
      const complete = pending.size > 0 && status.bytesDownloaded === pending.size
      if (!complete) {
        await ApkUpdater.cleanup({ id: pending.id })
      }
      await savePending(null)
      return complete ? { versionName: pending.versionName } : null
    }

    if (status.status === 'failed' || status.status === 'unknown') {
      await savePending(null)
    }
    return null
  } catch (e) {
    console.warn('[update] 接管未完成下载失败', e)
    await savePending(null)
    return null
  }
}

export async function cancelUpdate(): Promise<void> {
  const pending = await loadPending()
  if (pending) {
    await ApkUpdater.cancel({ id: pending.id })
    await savePending(null)
  }
}
