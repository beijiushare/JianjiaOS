import { useState } from 'react'
import { APP_REGISTRY, type AppInfo } from '@/apps/registry'
import { useNavStore } from '@/nav/store'

const GROUPS = ['全部', '系统', '工具', '信息'] as const

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
  const [activeGroup, setActiveGroup] = useState<string>('全部')

  const openApp = (app: AppInfo): void => {
    pop()
    if (app.entry.kind === 'push') {
      push(app.entry.page)
    }
  }

  const filteredApps = activeGroup === '全部'
    ? APP_REGISTRY
    : APP_REGISTRY.filter((app) => app.group === activeGroup)

  return (
    <div className="drawer">
      <div className="drawer-handle" aria-hidden="true" />

      <div className="drawer-filter">
        {GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            className={`drawer-filter__tab ${activeGroup === group ? 'drawer-filter__tab--active' : ''}`}
            onClick={() => setActiveGroup(group)}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="drawer-body">
        <div className="app-grid">
          {filteredApps.map((app) => {
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
