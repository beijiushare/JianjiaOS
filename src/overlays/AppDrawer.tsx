import { APP_REGISTRY, type AppInfo } from '@/apps/registry'
import { useNavStore } from '@/nav/store'

/**
 * 应用抽屉页。
 *
 * 转场为纵向（`layer--drawer`），导航语义与其他页面一致，无特殊分支。
 * 规格见设计文档 §4.3。
 *
 * 抽屉里不放搜索框 —— 主屏已有搜索，且读的是同一份 APP_REGISTRY，
 * 再放一个是重复入口。
 */
export function AppDrawer() {
  const push = useNavStore((s) => s.push)
  const pop = useNavStore((s) => s.pop)

  const openApp = (app: AppInfo): void => {
    // 先关闭抽屉再进入目标页：两次状态更新会被 React 批处理为同一帧，
    // 表现为抽屉下滑与新页滑入同时进行。
    pop()
    if (app.entry.kind === 'push') {
      push(app.entry.page)
    }
  }

  return (
    <div className="drawer">
      <div className="drawer-handle" aria-hidden="true" />

      <div className="drawer-body">
        <div className="app-grid">
          {APP_REGISTRY.map((app) => {
            const Icon = app.icon
            return (
              <button
                key={app.id}
                type="button"
                className="app-grid__item"
                onClick={() => openApp(app)}
              >
                <span className="app-grid__icon">
                  <Icon />
                </span>
                <span className="app-grid__name">{app.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
