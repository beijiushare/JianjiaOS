import { useEffect, useRef } from 'react'

import './vendor/index'

/**
 * 主页搜索框上方的 Grok Bot。
 *
 * 引擎是 vendored 的上游代码（来源与授权见 vendor/index.ts），渲染目标是
 * 内联 SVG，不是 canvas。参数取自上游登录页，只把身形换成 dome。
 *
 * 状态：mode 'onboarding' 即登录轮换 —— idle 与特技交替，1200ms 一拍。
 * 点击触发一次 spinOnce。
 *
 * ⚠️ 墨色不需要 JS 跟随主题。loginWrap 模式下引擎把 --fg 写成
 *    `light-dark(#000, #fff)`（见 vendor/src/character.js:210 的 inkFg），
 *    只要 svg 上声明了 color-scheme，就会自动跟随系统深浅色。
 *    眼睛的填充色走 --sand-bg-base，在 index.css 里按主题给。
 *
 * ⚠️ 引擎自己带一个常驻 rAF 循环，主屏又始终挂载（导航栈底层），
 *    所以卸载时必须 destroy()，否则循环会一直跑。
 */
export function GrokBot() {
  const svgRef = useRef<SVGSVGElement>(null)
  const botRef = useRef<GrokCharacterHandle | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const bot = new window.GrokCharacter(svg, {
      mode: 'onboarding',
      shape: 'dome',
      color: 'black',
    })
    botRef.current = bot

    return () => {
      botRef.current = null
      bot.destroy()
    }
  }, [])

  return (
    <button
      type="button"
      className="grok-bot"
      aria-label="Grok Bot"
      onClick={() => botRef.current?.spinOnce(1)}
    >
      <svg ref={svgRef} aria-hidden="true" />
    </button>
  )
}
