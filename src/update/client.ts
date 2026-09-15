/* ==========================================================================
 * client.ts —— 版本检测 + 检查更新
 * ========================================================================== */

import { App } from '@capacitor/app'

import {
  API_TIMEOUT_MS,
  GITHUB_REPO,
  type GitHubRelease,
  type ReleaseInfo,
  type UpdateCheckResult,
} from './types'

/* ==========================================================================
 * 版本检测
 * ========================================================================== */

/** 读本机 versionCode（来自 build.gradle，CI 注入的 UNIX 时间戳） */
export async function getLocalVersionCode(): Promise<number> {
  try {
    const info = await App.getInfo()
    return Number(info.build) || 0
  } catch {
    return 0
  }
}

async function fetchWithTimeout(
  url: string,
  ms: number,
  headers?: Record<string, string>,
): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      cache: 'no-store',
      headers,
    })
  } finally {
    clearTimeout(timer)
  }
}

const TAG_RE = /^v[\d.]+-build(\d+)$/

/**
 * 拉取最新 Release。
 *
 * ★ 直连，不走代理 —— TLS 端到端保证内容不可篡改。
 * ★ 版本号从 tag_name 解析，不用 created_at —— 避免时序缺陷。
 */
export async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const res = await fetchWithTimeout(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      API_TIMEOUT_MS,
      { Accept: 'application/vnd.github+json' },
    )
    if (!res.ok) return null

    const r = (await res.json()) as GitHubRelease

    const m = TAG_RE.exec(r.tag_name ?? '')
    if (!m) {
      console.warn(
        `[update] tag 格式不符，无法解析版本号: ${JSON.stringify(r.tag_name)}；` +
          `期望形如 "v1.20.0-build1789000000"`,
      )
      return null
    }

    return {
      versionCode: Number(m[1]),
      versionName: r.name?.trim() || r.tag_name,
      tagName: r.tag_name,
      notes: r.body ?? '',
      publishedAt: r.published_at ?? '',
      assets: r.assets ?? [],
    }
  } catch {
    return null
  }
}

/**
 * 检查更新。本函数不碰任何 UI，由调用方根据返回值决定怎么呈现。
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  const local = await getLocalVersionCode()
  const info = await fetchLatestRelease()

  if (!info) {
    return { kind: 'failed', reason: '无法连接 GitHub，请检查网络' }
  }
  if (info.versionCode <= local) {
    return { kind: 'up-to-date' }
  }
  return { kind: 'update', info }
}

/* ==========================================================================
 * 公共 re-export —— 从子模块合并导出，调用方无需关心内部拆分
 * ========================================================================== */

export {
  type ApkAsset,
  type GitHubAsset,
  type MirrorPrefix,
  type ReleaseInfo,
  type ResumedDownload,
  type UpdateErrorCode,
  UpdateError,
  RECENT_RELEASES_URL,
  POLL_INTERVAL_MS,
} from './types'

export {
  ApkUpdater,
  BOOTSTRAP_PREFIXES,
  candidateUrls,
  pickApk,
} from './sources'

export {
  downloadUpdate,
  downloadWithFallback,
  installUpdate,
  resumePendingDownload,
  cancelUpdate,
  savePending,
  loadPending,
} from './download'
