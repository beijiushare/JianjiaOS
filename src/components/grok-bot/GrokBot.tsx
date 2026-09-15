import { useEffect, useRef } from 'react'

import './vendor/index'

interface GrokBotProps {
  /** 搜索框是否处于激活（聚焦）状态 */
  active?: boolean
}

/**
 * 主页搜索框上方的 Grok Bot。
 *
 * 引擎是 vendored 的上游代码（来源与授权见 vendor/index.ts），渲染目标是
 * 内联 SVG，不是 canvas。参数取自上游登录页，只把身形换成 dome。
 *
 * 两种状态：
 *   · 未激活（默认）—— mode 'onboarding'，即登录轮换：idle 与特技交替，
 *     1200ms 一拍
 *   · 已激活（搜索框聚焦）—— mode 'hold' 停住轮换，并让眼睛盯着下方
 *
 * ⚠️「往下看」用的是 setGazeTarget，它收**视口坐标**（与 getBoundingClientRect
 *    同一空间），引擎把它换算成眼睛偏移，同时把状态自带 gaze 的权重从 1 降到
 *    0.2（eyes.js:72）。正 y 是往下 —— 见 pose.js:357 nextGaze，sad / drowsy /
 *    bored 都是正值，thinking / proud 是负值。
 *
 *    目标点取在 bot 下方一个身位：引擎会把归一化后的偏移钳在 ±0.6，
 *    所以只要「明显在下方」就一律是最大下看角度，键盘弹起导致 bot 位移
 *    也不会让方向反过来。
 *
 * ⚠️ 墨色不需要 JS 跟随主题。loginWrap 模式下引擎把 --fg 写成
 *    `light-dark(#000, #fff)`（见 vendor/src/character.js 的 inkFg），
 *    只要 svg 上声明了 color-scheme，就会自动跟随系统深浅色。
 *    眼睛的填充色走 --sand-bg-base，在 index.css 里按主题给。
 *
 * ⚠️ 引擎自己带一个常驻 rAF 循环，主屏又始终挂载（导航栈底层），
 *    所以卸载时必须 destroy()，否则循环会一直跑。
 */
export function GrokBot({ active = false }: GrokBotProps) {
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

  useEffect(() => {
    const bot = botRef.current
    const svg = svgRef.current
    if (!bot || !svg) return

    if (!active) {
      // 解除注视并从头重播登录轮换（setMode('onboarding') 会把 moodN 归零）
      bot.setGazeTarget(null)
      bot.setMode('onboarding')
      return
    }

    bot.setMode('hold')
    const rect = svg.getBoundingClientRect()
    bot.setGazeTarget({
      x: rect.left + rect.width / 2,
      y: rect.bottom + rect.height,
    })
  }, [active])

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
