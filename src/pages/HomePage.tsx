import { useEffect, useState } from 'react'

import { BottomBar } from '@/components/BottomBar'
import Orb from '@/components/Orb'
import { SearchInput } from '@/components/SearchInput'
import { selectUnreadCount, useMessagesStore } from '@/messages/store'
import { useNavStore } from '@/nav/store'

/**
 * 读取 CSS 变量的计算值。
 *
 * 用于 Orb 的 backgroundColor —— 该参数的语义是「容器底色是什么」，
 * 是向组件**描述现状**，而非设定颜色。着色器据它计算 bgLuminance，
 * 在「亮底画法」与「暗底画法」之间取值（见 Orb.tsx）。
 * 因此它必须与实际背景一致，否则画法用错。
 *
 * ⚠️ 不能直接传 `var(--x)`：该字符串会被传入着色器，组件内部按
 *    hex/rgb/hsl 解析，解析失败会退化为纯黑。故此处读出实际值再传。
 *
 * 用 getComputedStyle 而非硬编码：tokens.css 是颜色的唯一真相，
 * 改主题色时自动跟随，不会出现两份定义。
 *
 * useState 的惰性初始化在首次渲染前同步执行，此时样式已由 Vite 注入完毕，
 * 首帧即可拿到正确值，不会先黑一下。
 */
function useCssColor(varName: string, fallback: string): string {
  const read = (): string =>
    getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
    fallback

  const [color, setColor] = useState(read)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    // 系统主题切换时 CSS 变量会变，需重新读取
    const onChange = (): void => {
      setColor(
        getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim() || fallback,
      )
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [varName, fallback])

  return color
}

/**
 * 主屏 · 应用搜索页。
 *
 * 布局：Orb 背景层铺满 → 内容层（搜索框 + 未读提示） → 底部导航栏。
 * 主屏不占栈位，恒为底层；栈空等价于「位于主屏」。
 *
 * ⚠️ Orb 是常驻的 WebGL 渲染循环。主屏始终挂载（它是导航栈的底层），
 *    因此进入子页面后它仍在后台逐帧渲染。若真机出现发热或掉帧，
 *    应改为在栈非空时暂停渲染或卸载 —— 见设计文档 §14。
 *
 * 规格见设计文档 §4.1。
 */
export function HomePage() {
  const [query, setQuery] = useState('')
  /** 搜索框聚焦时激活 Orb 的扭曲/旋转动效 */
  const [searchFocused, setSearchFocused] = useState(false)
  // 未读数由 messages 派生，不单独存储
  const unreadCount = useMessagesStore(selectUnreadCount)
  const push = useNavStore((s) => s.push)

  // 传给 Orb 的容器底色。hue 等参数保持文档示例原值，仅此项按实际背景适配。
  const orbBackground = useCssColor('--color-background', '#ffffff')

  return (
    <div className="screen screen--home">
      <div className="home-body">
        <div className="home-orb">
          <Orb
            hue={275}
            hoverIntensity={1.5}
            rotateOnHover
            forceHoverState={searchFocused}
            backgroundColor={orbBackground}
          />
        </div>

        <div className="home-content">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="搜索应用"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />

          <button
            type="button"
            className="home-unread"
            onClick={() => push('messages')}
          >
            {unreadCount > 0 ? `${unreadCount} 条未读消息` : '没有未读消息'}
          </button>
        </div>
      </div>

      <BottomBar />
    </div>
  )
}
