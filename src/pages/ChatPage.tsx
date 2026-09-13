import { ScreenShell } from '@/components/ScreenShell'

/**
 * 聊天详情页（骨架）。
 * 正式实现见 `.claude_dist/设计文档/app-shell/README.md` §4.5。
 */
export function ChatPage() {
  return (
    <ScreenShell title="系统消息">
      <p className="placeholder">聊天详情页</p>
      <p className="placeholder placeholder--sm">
        消息气泡流 + 更新卡片 + 禁用态输入条
      </p>
    </ScreenShell>
  )
}
