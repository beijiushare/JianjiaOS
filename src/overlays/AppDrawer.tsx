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
        <p className="dev-note">应用抽屉（纵向转场）</p>
        <p className="dev-note dev-note--sm">
          返回键 / Esc 应关闭本层并回到主屏
        </p>
      </div>
    </div>
  )
}
