import type { UpdateCard as UpdateCardData } from '@/messages/types'

interface UpdateCardProps {
  card: UpdateCardData
  onUpdate?: () => void
  onCancel?: () => void
  onInstall?: () => void
}

/**
 * 更新卡片，嵌在消息气泡内。
 *
 * 状态机见设计文档 §5.2：
 *   idle → downloading → downloaded → installing
 *     └→ cancelled / failed
 *
 * TODO: 按钮动作尚未接入更新模块
 *       （见 .claude_dist/设计文档/capacitor-android-update/），
 *       当前仅展示状态，点按不产生下载行为。
 */
export function UpdateCard({
  card,
  onUpdate,
  onCancel,
  onInstall,
}: UpdateCardProps) {
  const { state, versionName } = card

  return (
    <div className="update-card">
      <p className="update-card__title">发现新版本 {versionName}</p>

      {state.status === 'downloading' && (
        <div className="update-card__progress">
          <div
            className="update-card__bar"
            style={{ width: `${String(state.percent)}%` }}
          />
        </div>
      )}

      <p className="update-card__status">{statusText(card)}</p>

      <div className="update-card__actions">{renderActions()}</div>
    </div>
  )

  function renderActions() {
    switch (state.status) {
      case 'idle':
        return (
          <>
            <button
              type="button"
              className="btn btn--plain"
              onClick={onCancel}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onUpdate}
            >
              更新
            </button>
          </>
        )
      case 'downloading':
        return (
          <button type="button" className="btn btn--plain" onClick={onCancel}>
            取消
          </button>
        )
      case 'downloaded':
        return (
          <button
            type="button"
            className="btn btn--primary"
            onClick={onInstall}
          >
            安装
          </button>
        )
      case 'installing':
        return null
      case 'cancelled':
        return (
          <button type="button" className="btn btn--primary" onClick={onUpdate}>
            重新下载
          </button>
        )
      case 'failed':
        return (
          <button type="button" className="btn btn--primary" onClick={onUpdate}>
            重试
          </button>
        )
    }
  }
}

function statusText(card: UpdateCardData): string {
  switch (card.state.status) {
    case 'idle':
      return '可以更新到最新版本'
    case 'downloading':
      return `正在下载… ${String(card.state.percent)}%`
    case 'downloaded':
      return '下载完成，可以安装了'
    case 'installing':
      return '正在打开安装器…'
    case 'cancelled':
      return '已忽略本次更新'
    case 'failed':
      return `下载失败：${card.state.reason}`
  }
}
