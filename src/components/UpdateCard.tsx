import type { UpdateCard as UpdateCardData } from '@/messages/types'

import { Markdown } from './Markdown'

interface UpdateCardProps {
  card: UpdateCardData
  /** 本机当前版本名，显示在卡片第一行 */
  currentVersion?: string
  onUpdate?: () => void
  onDismiss?: () => void
}

/**
 * 更新卡片，嵌在消息气泡内。
 *
 * ⚠️ 这张卡片**全程不变形** —— 它是「某版本发布过」的历史记录。
 *    下载中 / 已下载 / 失败这些过程状态各自发一条新消息（见 DownloadMessage）。
 *
 * 内容自上而下：标题 → 当前版本 → 更新说明（Markdown）→ 按钮
 */
export function UpdateCard({
  card,
  currentVersion,
  onUpdate,
  onDismiss,
}: UpdateCardProps) {
  const { state, versionName, notes } = card

  return (
    <div className="update-card">
      <p className="update-card__title">发现新版本 {versionName}</p>

      {currentVersion !== undefined && currentVersion !== '' && (
        <p className="update-card__current">当前版本 {currentVersion}</p>
      )}

      {typeof notes === 'string' && notes !== '' && <Markdown text={notes} />}

      <div className="update-card__actions">
        {state.status === 'idle' ? (
          <>
            <button type="button" className="btn btn--plain" onClick={onDismiss}>
              忽略
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onUpdate}
            >
              更新
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onUpdate}>
            重新下载
          </button>
        )}
      </div>
    </div>
  )
}
