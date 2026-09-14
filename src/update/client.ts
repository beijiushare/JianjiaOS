/* ==========================================================================
 * client.ts —— 应用内更新 · Web 侧完整实现
 *
 * 配套文档: ./README.md
 *
 * 依赖:
 *   @capacitor/core
 *   @capacitor/app          (读本机 versionCode)
 *   @capacitor/browser      (兜底跳转 Release 页面)
 *   @capacitor/preferences  (持久化下载状态)
 *
 * 原生侧: ApkUpdaterPlugin.kt
 *
 * 设计要点（详见 README）:
 *   · 检查更新【只走直连 api.github.com】—— TLS 端到端，不需要签名
 *   · 版本号从 tag_name 解析，不用 created_at（避开时序缺陷）
 *   · APK 下载走「代理优先 + 直连兜底」
 *   · 不维护任何 version.json / manifest 文件
 * ========================================================================== */

import { App } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { registerPlugin } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

/* ==========================================================================
 * 配置
 * ========================================================================== */

/**
 * GitHub 仓库，格式 owner/repo。
 *
 * ⚠️ 仓库【必须是 public】—— 客户端请求不带任何认证，
 *    私有仓库的 api.github.com 会返回 404，导致永远检查不了更新。
 */
export const GITHUB_REPO = 'beijiushare/JianjiaOS'

/** 兜底页面：匹配不到分包、或反复失败时把用户送到这里 */
export const RECENT_RELEASES_URL = `https://github.com/${GITHUB_REPO}/releases/latest`

/**
 * 镜像访问前缀。"" 表示直连。
 *
 * ★ 顺序 = 优先级，串行尝试，第一个成功的就停。
 *   实测（2026-09-13，2.16MB 文件）:
 *     gh.xmly.dev  329 KB/s
 *     gitwarp      221 KB/s
 *     直连         失败/极慢（"慢失败"，放前面纯浪费）
 *
 * ⚠️ 顺序写死在这里，改要发新 APK。多测几轮不同时段再定。
 * ⚠️ 必须至少含一个 { prefix: '' } —— 代理全挂时的唯一兜底。
 * ⚠️ 列表别超过 4 个 —— 串行换源，每多一个，"全部失败"就多等一次超时。
 */
export interface MirrorPrefix {
  name: string
  prefix: string
}

export const BOOTSTRAP_PREFIXES: MirrorPrefix[] = [
  { name: 'xmly', prefix: 'https://gh.xmly.dev/' },
  { name: 'gitwarp', prefix: 'https://proxy.gitwarp.com/' },
  { name: 'direct', prefix: '' },
]

export const API_TIMEOUT_MS = 5000
export const POLL_INTERVAL_MS = 800

/** 持久化「正在下载」状态的 key —— 让 App 被杀后重启仍能接管 */
const KEY_PENDING = 'update.pending'

/* ==========================================================================
 * 类型定义
 * ========================================================================== */

/**
 * GitHub Release 附件的原始结构（只列用到的字段）。
 *
 * 完整响应里还有其他字段，其中两个可能有用:
 *   digest        "sha256:b1c2217..."  ← GitHub 算好的官方哈希，可省去自己维护
 *   content_type  "application/octet-stream"
 * 详见 README §12 待定表。
 */
export interface GitHubAsset {
  name: string
  size: number
  browser_download_url: string
  digest?: string
}

interface GitHubRelease {
  tag_name: string
  /** Release 标题 —— 放给用户看的版本名，如 "0.5.0" */
  name?: string
  body?: string
  published_at?: string
  assets?: GitHubAsset[]
}

/** 归一化后的版本信息 */
export interface ReleaseInfo {
  /** ★ 从 tag_name 解析出的整数版本号 */
  versionCode: number
  /** 展示用，来自 Release 标题 */
  versionName: string
  tagName: string
  notes: string
  publishedAt: string
  assets: GitHubAsset[]
}

/** 选中的、与本机 ABI 匹配的分包 */
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
  /** 0-100，-1 表示总大小未知 */
  progress: number
  reason?: number
}

/**
 * 检查更新的结果。
 *
 * 刻意做成返回值而不是"内部直接弹窗" —— 让 UI 层决定怎么呈现。
 * 这样"自动检查静默失败、手动检查给反馈"只需由调用方区分，
 * 本文件不需要知道是自动还是手动。
 */
export type UpdateCheckResult =
  | { kind: 'update'; info: ReleaseInfo }
  | { kind: 'up-to-date' }
  | { kind: 'failed'; reason: string }

interface PendingDownload {
  id: number
  versionCode: number
  versionName: string
  size: number
  startedAt: number
}

/* ==========================================================================
 * 原生插件接口
 * ========================================================================== */

interface ApkUpdaterPlugin {
  download(options: { url: string }): Promise<{ id: number }>
  status(options: { id: number }): Promise<DownloadStatus>
  cancel(options: { id: number }): Promise<void>
  getAbi(): Promise<{ abi: string }>
  checkInstallPermission(): Promise<{ granted: boolean }>
  requestInstallPermission(): Promise<void>
  install(): Promise<void>
  cleanup(options: { id?: number }): Promise<void>
}

export const ApkUpdater = registerPlugin<ApkUpdaterPlugin>('ApkUpdater')

/* ==========================================================================
 * 1. 版本检测
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

/**
 * tag 格式约定: v{VERSION_NAME}-build{VERSION_CODE}
 *
 * 例: "v1.20.0-build1789000000"
 *      ↑ 人能看    ↑ 机器解析（客户端只取这一段与本机 versionCode 比对）
 *
 * 同时带版本名和 build 号的理由:
 *   · 只放版本名 → 忘了递增就重复，会让 GitHub Release 被静默覆盖，
 *                  老用户永远收不到更新（隐身能力极强的 bug）
 *   · 只放时间戳 → tag 不可读
 */
const TAG_RE = /^v[\d.]+-build(\d+)$/

/**
 * 拉取最新 Release。
 *
 * ★ 必须用 /releases/latest，不要用 /releases
 *   列表端点会返回 30 个 release，每个含完整 assets/user 对象，响应体几十 KB。
 *
 * ★ 直连，不走代理
 *   代理是中间人，能看到并修改响应。走直连时 TLS 端到端保证内容不可篡改，
 *   因此本方案不需要签名（详见 README §4.2）。
 *
 * ★ 版本号从 tag_name 解析，不用 created_at
 *   created_at 与编译时烧进 APK 的时间戳比较存在时序缺陷：
 *   Release 总在构建之后创建，会导致装了最新版的用户被反复提示"有新版本"。
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
      // 不静默吞掉 —— 这个失败在开发期很难发现（表现就是"永远说已是最新"）
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
 * 检查更新。**本函数不碰任何 UI**，由调用方根据返回值决定怎么呈现。
 *
 * 典型用法（区分自动/手动）:
 *   const r = await checkForUpdate()
 *   if (r.kind === 'update')  showUpdateDialog(r.info)
 *   else if (!isAuto)         toast(r.kind === 'up-to-date' ? '已是最新版本' : '检查更新失败：' + r.reason)
 *   // ↑ 自动检查失败时这一行不执行 —— 静默，不打扰用户
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
 * 2. ABI 分包匹配
 * ========================================================================== */

/**
 * 从 Release 的 assets 里选出与本机架构匹配的分包。
 *
 * 匹配顺序（顺序很重要，不要调换）:
 *   ① 精确匹配设备首选 ABI
 *   ② 兜底到 armeabi-v7a —— 32 位包在 64 位设备上【也能装】（跑 32 位模式）
 *      ⚠️ 反过来不行：arm64 的包装不到 32 位设备上，
 *         会 INSTALL_FAILED_NO_MATCHING_ABIS
 *   ③ 只有一个 asset 时直接用（兼容没做分包的简单情况）
 *
 * 返回 null 表示找不到可用的 —— 调用方应跳 Release 页面兜底。
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
    // getAbi 失败（理论上不会）—— 用最保守的默认值继续
  }

  const exact = info.assets.find((a) => a.name.includes(abi))
  if (exact) return toApk(exact)

  const v7a = info.assets.find((a) => a.name.includes('armeabi-v7a'))
  if (v7a) return toApk(v7a)

  if (info.assets.length === 1) return toApk(info.assets[0])

  return null
}

/* ==========================================================================
 * 3. 源管理 —— origin + prefix 模型
 * ========================================================================== */

/**
 * 把 origin 展开成候选 URL 列表。
 *
 * origin 是 API 返回的 asset.browser_download_url（GitHub Release 地址），
 * 前缀直接拼在它前面。同一个函数也用于将来任何需要多源的场景。
 */
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
 * 4. 下载 + 安装
 * ========================================================================== */

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function savePending(p: PendingDownload | null): Promise<void> {
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

async function loadPending(): Promise<PendingDownload | null> {
  try {
    const { value } = await Preferences.get({ key: KEY_PENDING })
    return value ? (JSON.parse(value) as PendingDownload) : null
  } catch {
    return null
  }
}

/**
 * 把未知类型的异常转成可读字符串。
 *
 * ⚠️ 日志必须拼成**单个字符串**再输出。
 *    Capacitor 会把 console 的参数序列化后转发到 logcat，传对象进去只会得到
 *    `[object Object]`、传 undefined 得到 `undefined` —— 真正的错误信息全丢。
 *    本项目为此白抓过两次日志，务必遵守。
 */
function errText(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`
  return String(e)
}

/** 单次下载 + 轮询到完成，不换源 */
async function downloadOnce(
  url: string,
  expectedSize: number,
  versionCode: number,
  versionName: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  // 入队（插件内部会先删掉上次的残留文件）
  console.log(`[update] 入队下载 url=${url}`)
  const { id } = await ApkUpdater.download({ url })
  console.log(`[update] 入队成功 id=${String(id)}`)

  // 持久化 —— App 被杀后重启仍能接管这次下载
  await savePending({
    id,
    versionCode,
    versionName,
    size: expectedSize,
    startedAt: Date.now(),
  })

  // 轮询进度。切后台时轮询暂停，但下载继续（DownloadManager 在系统进程里）
  let status = await ApkUpdater.status({ id })
  let round = 0
  while (
    status.status === 'pending' ||
    status.status === 'running' ||
    status.status === 'paused'
  ) {
    // 每轮都打全字段：卡住时能直接看出 DownloadManager 报的是什么
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

  // 完整性校验 —— 只比对字节数，不做 SHA256（见 README §6.5）
  // 篡改由 Android 的 APK 签名校验兜底，这里只需挡住"断流导致的半个包"
  if (expectedSize > 0 && status.bytesDownloaded !== expectedSize) {
    await ApkUpdater.cleanup({ id })
    throw new UpdateError(
      'INCOMPLETE',
      `下载不完整（${status.bytesDownloaded}/${expectedSize} 字节）`,
    )
  }
}

/**
 * 按候选前缀**依次尝试**下载 APK，任一成功即止。
 *
 * 为什么是串行而不是并发:
 *   · 20MB 并发下载会互相抢带宽
 *   · 成功后还要清理另一个下载，状态管理复杂
 *   · 串行的代价只是第一个源失败时等一次超时
 *
 * ⚠️ 换源只在【失败】时触发，"慢"不会触发 —— 这就是顺序重要的原因。
 *    DownloadManager.enqueue() 一次只接受一个 URL，没有自动切换能力。
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
      // ⚠️ 必须用 errText 拼成字符串 —— 直接传对象会变成 [object Object]
      console.warn(
        `[update] 源 ${String(i + 1)}/${String(urls.length)} 失败: ${errText(e)}`,
      )
      // downloadOnce 内部已 cleanup，半包不会残留到下一次尝试
    }
  }

  console.warn(`[update] 全部源均失败，最后一个错误: ${errText(lastErr)}`)

  throw lastErr instanceof UpdateError
    ? lastErr
    : new UpdateError('DOWNLOAD_FAILED', '所有下载源都失败了')
}

/**
 * 下载新版本，**不安装**。
 *
 * 下载与安装拆成两步，因为 UI 需要在两者之间插入用户确认
 * （设计文档 §4.5：下载完成后提示「是否开始安装」）。
 * 上游初版把两步合在一个 startUpdate 里，无法支持这个交互。
 *
 * @param onProgress 进度回调（0-100，-1 表示未知）。切后台时轮询暂停，
 *                   但下载继续（DownloadManager 在系统进程里）。
 */
export async function downloadUpdate(
  info: ReleaseInfo,
  onProgress?: (pct: number) => void,
): Promise<void> {
  // ① 选匹配本机架构的分包
  const apk = await pickApk(info)
  if (!apk) {
    // 兜底：不让用户卡死，送到 Release 页面自己挑
    await Browser.open({ url: RECENT_RELEASES_URL })
    throw new UpdateError(
      'NO_MATCHING_APK',
      '没有适配本机架构的安装包，已为你打开下载页面',
    )
  }

  // ② 安装权限检查 —— 提前做，别等下载完 20MB 才发现装不了
  const { granted } = await ApkUpdater.checkInstallPermission()
  if (!granted) {
    await ApkUpdater.requestInstallPermission()
    throw new UpdateError(
      'NEED_INSTALL_PERMISSION',
      '请先允许本应用安装未知来源的应用，然后重试',
    )
  }

  // ③ 下载（代理优先，直连兜底）
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

/**
 * 拉起系统安装器，安装已下载的包。
 *
 * ⚠️ 最后一步必须由用户手动确认 —— Android 不允许静默安装，平台硬约束。
 */
export async function installUpdate(): Promise<void> {
  await ApkUpdater.install()
  await savePending(null)
}

/** 接管结果：上次未完成的下载最终处于什么状态 */
export interface ResumedDownload {
  /** 已下载完成、等待安装的版本名 */
  versionName: string
}

/**
 * 启动时调用：接管上次没下完 / 下完没装的更新。
 *
 * 场景：用户下载到一半把 App 划掉了。DownloadManager 仍在后台下，
 *       但 JS 侧的轮询循环已经没了。下次启动时靠这个接管。
 *
 * 返回「已下载完成待安装」的信息，由调用方决定何时安装 ——
 * 本函数不主动拉安装器（安装需要用户确认，见设计文档 §4.5）。
 */
export async function resumePendingDownload(): Promise<ResumedDownload | null> {
  const pending = await loadPending()
  if (!pending) return null

  try {
    const status = await ApkUpdater.status({ id: pending.id })

    if (status.status === 'successful') {
      const complete = pending.size > 0 && status.bytesDownloaded === pending.size
      if (!complete) {
        // 半包：删掉重来，别让用户装到损坏的包
        await ApkUpdater.cleanup({ id: pending.id })
      }
      await savePending(null)
      return complete ? { versionName: pending.versionName } : null
    }

    if (status.status === 'failed' || status.status === 'unknown') {
      // download id 已失效（App 被杀太久、用户手动清了下载记录）
      await savePending(null)
    }
    // pending / running / paused → 什么都不做，等用户下次主动触发更新
    return null
  } catch (e) {
    console.warn('[update] 接管未完成下载失败', e)
    await savePending(null)
    return null
  }
}

/** 取消进行中的下载 */
export async function cancelUpdate(): Promise<void> {
  const pending = await loadPending()
  if (pending) {
    await ApkUpdater.cancel({ id: pending.id })
    await savePending(null)
  }
}

/** 手动打开 Release 页面（设置页「去 GitHub 下载」用） */
export async function openReleasesPage(): Promise<void> {
  await Browser.open({ url: RECENT_RELEASES_URL })
}

/* ==========================================================================
 * 5. 错误类型
 * ========================================================================== */

export type UpdateErrorCode =
  | 'NEED_INSTALL_PERMISSION'
  | 'NO_MATCHING_APK'
  | 'DOWNLOAD_FAILED'
  | 'INCOMPLETE'
  | 'APK_NOT_FOUND'
  | 'INSTALL_FAILED'

/**
 * 更新流程的错误。
 *
 * ⚠️ code 用显式字段 + 构造函数赋值，不用 TypeScript 的「构造函数参数属性」
 *    （`constructor(public code: ...)`）—— 后者在本项目的 erasableSyntaxOnly
 *    下被禁止。
 */
export class UpdateError extends Error {
  readonly code: UpdateErrorCode

  constructor(code: UpdateErrorCode, message: string) {
    super(message)
    this.name = 'UpdateError'
    this.code = code
  }
}
