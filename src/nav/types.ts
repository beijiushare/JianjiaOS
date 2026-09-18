/**
 * 导航层类型定义。
 *
 * 不变量：主屏不占栈位 —— `stack.length === 0` 等价于「位于主屏」。
 */

export type PageId = 'messages' | 'chat' | 'settings' | 'chatBackground' | 'steamPrice' | 'steamPriceAbout' | 'entries' | 'credits' | 'world60s'

export type DrawerId = 'appDrawer'

/**
 * push 页的入场方向。
 * - `right`：自右侧滑入（默认，表示「前进」）
 * - `left` ：自左侧滑入（用于反向入口，如底栏最左侧的消息按钮）
 * 退场时沿原路返回。
 */
export type EnterFrom = 'right' | 'left'

/** 横向转场（translateX） */
export interface PushLayer {
  key: string
  kind: 'push'
  page: PageId
  enterFrom: EnterFrom
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
