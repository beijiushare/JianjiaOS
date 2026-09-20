import { Fragment, type ComponentType } from 'react'

import { AppDrawer } from '@/overlays/AppDrawer'
import { ChatBackgroundPage } from '@/pages/ChatBackgroundPage'
import { ChatPage } from '@/pages/ChatPage'
import { CreditsPage } from '@/pages/CreditsPage'
import { EntriesPage } from '@/pages/EntriesPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SteamPriceAboutPage } from '@/pages/SteamPriceAboutPage'
import { SteamPricePage } from '@/pages/SteamPricePage'
import { World60sPage } from '@/pages/World60sPage'
import { World60sAboutPage } from '@/pages/World60sAboutPage'

import type { DrawerId, NavLayer, PageId } from './types'

const PAGES: Record<PageId, ComponentType> = {
  messages: MessagesPage,
  chat: ChatPage,
  settings: SettingsPage,
  chatBackground: ChatBackgroundPage,
  steamPrice: SteamPricePage,
  steamPriceAbout: SteamPriceAboutPage,
  entries: EntriesPage,
  credits: CreditsPage,
  world60s: World60sPage,
  world60sAbout: World60sAboutPage,
}

const DRAWERS: Record<DrawerId, ComponentType> = {
  appDrawer: AppDrawer,
}

interface LayerHostProps {
  layers: NavLayer[]
  exitingKeys: ReadonlySet<string>
}

/**
 * 渲染导航栈中的全部层。
 *
 * 每层之前插入一个 `scrim`（转场遮罩）。DOM 顺序决定了它位于对应层之下、
 * 更下层之上，因此新层滑入时，露出的下层恰好处于「模糊 + 变暗」状态。
 * 遮罩必须独立于层本体 —— 层带 translate 动画，附着的遮罩会跟着滑走。
 *
 * 定位方式：`position: absolute`，相对 `.app-root`（其自身为 `position: fixed`）。
 * **不使用 `position: fixed`** —— fixed 元素若存在 overflow 祖先，
 * Android WebView 真机将完全不渲染（PC 浏览器正常显示，故该问题仅在真机暴露）。
 *
 * 附带收益：安全区由 `.app-root` 统一处理，各层无需重复计算 env(safe-area-inset-*)。
 *
 * 需要 Portal 至 `#layer-root` 的是 Toast、弹窗等脱离文档流的浮层，不含导航层。
 * 参见 `components/Toast.tsx`。
 */
export function LayerHost({ layers, exitingKeys }: LayerHostProps) {
  return (
    <>
      {layers.map((layer) => {
        const Cmp =
          layer.kind === 'push' ? PAGES[layer.page] : DRAWERS[layer.drawer]

        const exiting = exitingKeys.has(layer.key)
        const exitClass = exiting ? ' is-exiting' : ''

        // 只有 push 页有横向方向之分，抽屉固定纵向
        const layerClass = [
          'layer',
          `layer--${layer.kind}`,
          layer.kind === 'push' && layer.enterFrom === 'left'
            ? 'layer--from-left'
            : '',
          exiting ? 'is-exiting' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <Fragment key={layer.key}>
            <div
              className={`scrim scrim--${layer.kind}${exitClass}`}
              aria-hidden="true"
            />
            <div className={layerClass}>
              <Cmp />
            </div>
          </Fragment>
        )
      })}
    </>
  )
}
