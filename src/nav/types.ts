/**
 * 导航层类型定义。
 *
 * 不变量：主屏不占栈位 —— `stack.length === 0` 等价于「位于主屏」。
 */

export type PageId = 'messages' | 'chat' | 'settings'

export type DrawerId = 'appDrawer'

/** 横向转场（translateX）：自右侧滑入 */
export interface PushLayer {
  key: string
  kind: 'push'
  page: PageId
}

/**
 * 纵向转场（translateY）：自底部升起。
 *
 * 与 PushLayer 的唯一差异是转场方向。导航语义完全一致：进栈、pop 弹出、
 * 返回手势处理均无分支。
 *
 * 设计文档早期版本将其命名为 overlay 并赋予「覆盖层」语义，该命名已废弃；
 * 详见 `.claude_dist/设计文档/app-shell/README.md` §13.10。
 */
export interface DrawerLayer {
  key: string
  kind: 'drawer'
  drawer: DrawerId
}

export type NavLayer = PushLayer | DrawerLayer
