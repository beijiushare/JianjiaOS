import type { Message } from './types'

/** 会话列表用的时间戳：当天只显示时分，跨天显示日期 */
export function formatListTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()

  return sameDay ? formatClock(ts) : `${d.getMonth() + 1}/${d.getDate()}`
}

/** 气泡内的时间戳，只要时分 */
export function formatClock(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/** 会话列表的摘要文字 */
export function previewOf(message: Message | undefined): string {
  if (!message) return ''

  switch (message.kind.type) {
    case 'text':
      return message.kind.text

    case 'update-card':
      return `发现新版本 ${message.kind.card.versionName}`

    case 'download':
      switch (message.kind.state.status) {
        case 'downloading':
          return '正在下载中…'
        case 'downloaded':
          return '下载完成，可以安装了'
        case 'failed':
          return '下载失败'
      }
  }
}
