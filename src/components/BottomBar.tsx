import ChatIcon from '@/assets/icons/chat-1-line.svg?react'
import FingerprintIcon from '@/assets/icons/fingerprint-line.svg?react'
import SettingsIcon from '@/assets/icons/settings-3-line.svg?react'
import { useNavStore } from '@/nav/store'

/**
 * 底部导航栏。**仅主屏渲染**。
 *
 * ⚠️ 它不是 tab 栏。三个图标是三个页面的入口，彼此之间没有「当前选中」关系；
 *    主屏本身不属于这三项，所以主屏时也不高亮任何一项。
 *    **不要引入 activeTab 之类的状态** —— 详见设计文档 §4.2、§13.10。
 */
export function BottomBar() {
  const push = useNavStore((s) => s.push)
  const openDrawer = useNavStore((s) => s.openDrawer)

  return (
    <nav className="bottom-bar">
      {/* 中间的圆形凸起，纯装饰。尺寸与位置见 styles/index.css */}
      <div className="bottom-bar__notch" aria-hidden="true" />

      <button
        type="button"
        className="bottom-bar__btn"
        aria-label="消息"
        onClick={() => push('messages', 'left')}
      >
        <ChatIcon className="bottom-bar__icon" />
      </button>

      <button
        type="button"
        className="bottom-bar__btn bottom-bar__btn--primary"
        aria-label="应用"
        onClick={() => openDrawer('appDrawer')}
      >
        <FingerprintIcon className="bottom-bar__icon" />
      </button>

      <button
        type="button"
        className="bottom-bar__btn"
        aria-label="设置"
        onClick={() => push('settings')}
      >
        <SettingsIcon className="bottom-bar__icon" />
      </button>
    </nav>
  )
}
