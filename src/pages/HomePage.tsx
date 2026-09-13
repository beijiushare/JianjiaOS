import { useNavStore } from '@/nav/store'

/**
 * 主屏 · 应用搜索页。
 *
 * 当前为骨架验证版本，仅含导航入口，无实际界面。
 * 正式实现见 `.claude_dist/设计文档/app-shell/README.md` §4.1。
 *
 * 主屏不占栈位，恒为底层；栈空等价于「位于主屏」。
 */
export function HomePage() {
  const push = useNavStore((s) => s.push)
  const openDrawer = useNavStore((s) => s.openDrawer)

  return (
    <div className="screen screen--home">
      <div className="dev-panel">
        <p className="dev-note">主屏 · 骨架验证</p>

        <button
          type="button"
          className="dev-btn"
          onClick={() => push('messages')}
        >
          push 消息列表页（横向）
        </button>

        <button type="button" className="dev-btn" onClick={() => push('chat')}>
          push 聊天页（横向）
        </button>

        <button
          type="button"
          className="dev-btn"
          onClick={() => push('settings')}
        >
          push 设置页（横向）
        </button>

        <button
          type="button"
          className="dev-btn dev-btn--accent"
          onClick={() => openDrawer('appDrawer')}
        >
          打开应用抽屉（纵向）
        </button>

        <p className="dev-note dev-note--sm">
          真机：返回键 / 返回手势；浏览器：Esc
        </p>
      </div>
    </div>
  )
}
