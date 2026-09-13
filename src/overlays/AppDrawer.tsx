/**
 * 应用抽屉页。
 *
 * 转场方向为纵向（`layer--drawer`），导航语义与其他页面一致，无特殊分支。
 * 正式实现见 `.claude_dist/设计文档/app-shell/README.md` §4.3。
 */
export function AppDrawer() {
  return (
    <div className="drawer">
      <div className="drawer-handle" aria-hidden="true" />
      <div className="drawer-body">
        <p className="placeholder">应用抽屉</p>
        <p className="placeholder placeholder--sm">
          应用网格 + 搜索框，规格见设计文档 §4.3
        </p>
      </div>
    </div>
  )
}
