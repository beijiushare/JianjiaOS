/* ==========================================================================
 * sources.ts —— 源管理 + 原生插件接口 + ABI 分包匹配
 * ========================================================================== */

import { registerPlugin } from '@capacitor/core'

import type { ApkAsset, GitHubAsset, MirrorPrefix, ReleaseInfo } from './types'

/* ==========================================================================
 * 原生插件接口
 * ========================================================================== */

interface ApkUpdaterPlugin {
  download(options: { url: string }): Promise<{ id: number }>
  status(options: { id: number }): Promise<{
    status: string
    bytesDownloaded: number
    totalBytes: number
    progress: number
    reason?: number
  }>
  cancel(options: { id: number }): Promise<void>
  getAbi(): Promise<{ abi: string }>
  checkInstallPermission(): Promise<{ granted: boolean }>
  requestInstallPermission(): Promise<void>
  install(): Promise<void>
  cleanup(options: { id?: number }): Promise<void>
}

export const ApkUpdater = registerPlugin<ApkUpdaterPlugin>('ApkUpdater')

/* ==========================================================================
 * 镜像前缀
 * ========================================================================== */

/**
 * 顺序 = 优先级，串行尝试，第一个成功的就停。
 * 必须至少含一个 { prefix: '' } —— 代理全挂时的唯一兜底。
 */
export const BOOTSTRAP_PREFIXES: MirrorPrefix[] = [
  { name: 'xmly', prefix: 'https://gh.xmly.dev/' },
  { name: 'gitwarp', prefix: 'https://proxy.gitwarp.com/' },
  { name: 'direct', prefix: '' },
]

/** 把 origin 展开成候选 URL 列表 */
export function candidateUrls(origin: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of BOOTSTRAP_PREFIXES) {
    const url = p.prefix + origin
    if (!seen.has(url)) {
      seen.add(url)
      out.push(url)
    }
  }
  return out
}

/* ==========================================================================
 * ABI 分包匹配
 * ========================================================================== */

/**
 * 从 Release 的 assets 里选出与本机架构匹配的分包。
 * 匹配顺序：精确匹配 → armeabi-v7a 兜底 → 单 asset 直接用。
 */
export async function pickApk(info: ReleaseInfo): Promise<ApkAsset | null> {
  const toApk = (a: GitHubAsset): ApkAsset => ({
    abi: a.name,
    url: a.browser_download_url,
    size: a.size,
  })

  let abi = 'arm64-v8a'
  try {
    abi = (await ApkUpdater.getAbi()).abi
  } catch {
    // getAbi 失败 —— 用默认值
  }

  const exact = info.assets.find((a) => a.name.includes(abi))
  if (exact) return toApk(exact)

  const v7a = info.assets.find((a) => a.name.includes('armeabi-v7a'))
  if (v7a) return toApk(v7a)

  if (info.assets.length === 1) return toApk(info.assets[0])

  return null
}
