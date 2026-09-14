import type { UpdateCard as UpdateCardData } from '@/messages/types'

import { Markdown } from './Markdown'

interface UpdateCardProps {
  card: UpdateCardData
  /** 本机当前版本名，显示在卡片第一行 */
  currentVersion?: string
  onUpdate?: () => void
}

/**
 * 更新卡片，嵌在消息气泡内。
 *
 * ⚠️ 这张卡片**没有状态、全程不变形** —— 它表达的是「某版本发布过」这一个事实。
 *    下载 / 安装的过程状态各自发一条新消息（见 DownloadMessage）；
 *    「忽略本次更新」也去掉了 —— notifiedVersions 按版本名去重，
 *    同一版本只会发一次卡片，重启也不会重发，没有要忽略的东西。
 *
 * 内容自上而下：标题 → 当前版本 → 更新说明（Markdown）→ 更新按钮
 */
export function UpdateCard({
  card,
  currentVersion,
  onUpdate,
}: UpdateCardProps) {
  const { versionName, notes } = card

  return (
    <div className="update-card">
      <p className="update-card__title">发现新版本 {versionName}</p>

      {currentVersion !== undefined && currentVersion !== '' && (
        <p className="update-card__current">当前版本 {currentVersion}</p>
      )}

      {typeof notes === 'string' && notes !== '' && <Markdown text={notes} />}

      <div className="update-card__actions">
        <button type="button" className="btn btn--primary" onClick={onUpdate}>
          更新
        </button>
      </div>
    </div>
  )
}
