import { create } from 'zustand'

import type { DrawerId, NavLayer, PageId } from './types'

interface NavState {
  /** 导航栈。空数组等价于「位于主屏」 */
  stack: NavLayer[]

  push: (page: PageId) => void
  openDrawer: (drawer: DrawerId) => void

  /** 弹出栈顶。push 页与抽屉页不做区分 */
  pop: () => void
}

/** 层的 key 由自增序列生成，保证可读、可复现，便于在 React DevTools 中定位层 */
let layerSeq = 0
const nextKey = (): string => `layer-${++layerSeq}`

export const useNavStore = create<NavState>((set) => ({
  stack: [],

  push: (page) =>
    set((s) => ({
      stack: [...s.stack, { key: nextKey(), kind: 'push', page }],
    })),

  openDrawer: (drawer) =>
    set((s) => ({
      stack: [...s.stack, { key: nextKey(), kind: 'drawer', drawer }],
    })),

  pop: () => set((s) => ({ stack: s.stack.slice(0, -1) })),
}))
