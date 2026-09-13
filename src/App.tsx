import { Toast } from '@/components/Toast'
import { LayerHost } from '@/nav/LayerHost'
import { useBackHandler } from '@/nav/useBackHandler'
import { useLayerTransition } from '@/nav/useLayerTransition'
import { HomePage } from '@/pages/HomePage'

/**
 * 应用根组件。
 *
 * DOM 结构：
 *   .app-root
 *     ├─ HomePage    主屏，不占栈位，恒为底层
 *     ├─ LayerHost   导航层（push / drawer），自带转场遮罩
 *     └─ Toast       Portal 至 #layer-root
 */
export function App() {
  // 返回手势监听：整个应用仅挂载一次
  useBackHandler()

  const { rendered, exitingKeys } = useLayerTransition()

  return (
    <div className="app-root">
      <HomePage />
      <LayerHost layers={rendered} exitingKeys={exitingKeys} />
      <Toast />
    </div>
  )
}
