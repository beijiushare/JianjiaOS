import { ScreenShell } from '@/components/ScreenShell'

/**
 * 消息列表页（骨架）。
 * 正式实现见 `.claude_dist/设计文档/app-shell/README.md` §4.4。
 */
export function MessagesPage() {
  return (
    <ScreenShell title="消息">
      <p className="placeholder">消息列表页</p>
      <p className="placeholder placeholder--sm">
        Telegram 会话列表，当前仅有「系统消息」一条
      </p>
    </ScreenShell>
  )
}
