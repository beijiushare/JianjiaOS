/* ==========================================================================
 * types.ts —— 更新模块的类型定义 + 错误类
 * ========================================================================== */

export const GITHUB_REPO = 'beijiushare/JianjiaOS'

/** 兜底页面：匹配不到分包、或反复失败时把用户送到这里 */
export const RECENT_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases/latest`

export const API_TIMEOUT_MS = 5000
export const POLL_INTERVAL_MS = 800

export interface MirrorPrefix {
  name: string
  prefix: string
}

export interface GitHubAsset {
  name: string
  size: number
  browser_download_url: string
  digest?: string
}

export interface GitHubRelease {
  tag_name: string
  name?: string
  body?: string
  published_at?: string
  assets?: GitHubAsset[]
}

export interface ReleaseInfo {
  versionCode: number
  versionName: string
  tagName: string
  notes: string
  publishedAt: string
  assets: GitHubAsset[]
}

export interface ApkAsset {
  abi: string
  url: string
  size: number
}

export type DownloadState =
  | 'pending'
  | 'running'
  | 'paused'
  | 'successful'
  | 'failed'
  | 'unknown'

export interface DownloadStatus {
  status: DownloadState
  bytesDownloaded: number
  totalBytes: number
  progress: number
  reason?: number
}

export type UpdateCheckResult =
  | { kind: 'update'; info: ReleaseInfo }
  | { kind: 'up-to-date' }
  | { kind: 'failed'; reason: string }

export interface PendingDownload {
  id: number
  versionCode: number
  versionName: string
  size: number
  startedAt: number
}

export interface ResumedDownload {
  versionName: string
}

export type UpdateErrorCode =
  | 'NEED_INSTALL_PERMISSION'
  | 'NO_MATCHING_APK'
  | 'DOWNLOAD_FAILED'
  | 'INCOMPLETE'
  | 'APK_NOT_FOUND'
  | 'INSTALL_FAILED'

export class UpdateError extends Error {
  readonly code: UpdateErrorCode

  constructor(code: UpdateErrorCode, message: string) {
    super(message)
    this.name = 'UpdateError'
    this.code = code
  }
}
