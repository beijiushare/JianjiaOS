import type { DownloadMessageState } from '@/messages/types'

interface DownloadMessageProps {
  state: DownloadMessageState
  onCancel?: () => void
  onInstall?: () => void
}

/**
 * 下载进度消息。
 *
 * 与更新卡片分开的原因：卡片是「某版本发布过」的历史记录，不该被下载流程改写；
 * 而下载是一个过程，有进度、有起止。拆成独立消息后，聊天记录读起来就是
 * 一条完整的时间线：「发现新版本」→「正在下载中 45%」→「下载完成」。
 *
 * 唯一会原地刷新的是 downloading 那条的百分比 —— 它本身就是进度的载体。
 */
export function DownloadMessage({
  state,
  onCancel,
  onInstall,
}: DownloadMessageProps) {
  switch (state.status) {
    case 'downloading':
      return (
        <>
          <p className="download__text">正在下载中… {state.percent}%</p>

          <div className="download__progress">
            <div
              className="download__bar"
              style={{ width: `${String(state.percent)}%` }}
            />
          </div>

          <div className="download__actions">
            <button type="button" className="btn btn--plain" onClick={onCancel}>
              取消
            </button>
          </div>
        </>
      )

    case 'downloaded':
      return (
        <>
          <p className="download__text">下载完成，可以安装了</p>

          <div className="download__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={onInstall}
            >
              安装
            </button>
          </div>
        </>
      )

    case 'failed':
      return (
        <>
          <p className="download__text">下载失败</p>
          <p className="download__reason">{state.reason}</p>
        </>
      )
  }
}
