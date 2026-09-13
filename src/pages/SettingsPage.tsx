import { ScreenShell } from '@/components/ScreenShell'

/**
 * 设置页（骨架）。
 * 正式实现见 `.claude_dist/设计文档/app-shell/README.md` §4.6。
 */
export function SettingsPage() {
  return (
    <ScreenShell title="设置">
      <p className="placeholder">设置页</p>
      <p className="placeholder placeholder--sm">
        「关于」分组：版本号 + 检查更新
      </p>
    </ScreenShell>
  )
}
