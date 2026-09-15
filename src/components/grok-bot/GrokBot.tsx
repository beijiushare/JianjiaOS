import { useEffect, useRef } from 'react'

import './vendor/index'

/**
 * waking 停留时长。
 *
 * 引擎的醒来动效按「进入状态后的秒数」分四段（pose.js:31-53）：
 *   0–0.5s 闭眼 → 0.5–1.2s 睁眼 + 粒子爆发 → 1.2–2.2s 复位 + 眨眼
 *   → 2.2s 起轻微晃动，并**一直停在这**（不会自动退出）
 * 所以取 2.2s —— 引擎自己最后一段的边界。想更利落可调小到 ~1.6s，
 * 代价是丢掉 1.2–1.4s 那一次眨眼。
 */
const WAKING_MS = 2200

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
 * 三个行为：
 *   · 未激活（默认）—— mode 'onboarding'，即登录轮换：idle 与特技交替，
 *     1200ms 一拍
 *   · 搜索框聚焦 —— 播一次「醒来」（睡眼 → 睁眼 + 眨一下），然后停在 idle
 *   · 点击 —— 转圈 + humming 同时开始，转圈落定后回到点击前的状态
 *
 * ⚠️ 状态切换的顺序和时机都不能随便动，三处约束：
 *   1. setState() 内部会 this.spinTurn = null（character.js:259），
 *      **会打断进行中的转圈** —— 所以必须先 setState('humming') 再 spinOnce()，
 *      反过来转圈会被立刻清掉
 *   2. onboarding 模式下 tick 每 1200ms 会自己 setState(onboardMood)
 *      （character.js:516），而转圈要约 2s 才落定 —— 所以转圈期间必须
 *      先 setMode('hold')，否则 humming 播到一半就被轮换冲掉
 *   3. waking 不会自动退出：tick 对 waking 既不推进眼型也不转场
 *      （character.js:606 显式排除了 waking）—— 必须自己指定下一站
 *
 * ⚠️「醒来」动效整套由引擎驱动（pose.js:31-53，见 WAKING_MS 的说明），
 *    宿主只需要进入 waking、过一会儿再送出去。不要试图写 ctx.wakeEye /
 *    ctx.wakeBlink —— 引擎每帧都在写它们，写了也会被当场覆盖。
 *
 * ⚠️ 墨色不需要 JS 跟随主题。loginWrap 模式下引擎把 --fg 写成
 *    `light-dark(#000, #fff)`，只要 svg 上声明了 color-scheme 就会自动跟随
 *    系统深浅色。眼睛的填充色走 --sand-bg-base，在 index.css 里按主题给。
 *
 * ⚠️ 引擎自己带一个常驻 rAF 循环，主屏又始终挂载（导航栈底层），
 *    所以卸载时必须 destroy()，否则循环会一直跑。
 */
export function GrokBot({ active = false }: GrokBotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const botRef = useRef<GrokCharacterHandle | null>(null)
  /** 点击后等待转圈落定的 rAF；聚焦 / 失焦 / 卸载都要取消，否则它会覆盖新状态 */
  const settleRaf = useRef(0)
  /** waking 的收尾定时器，同上 */
  const wakingTimer = useRef(0)
  /** 供 rAF 回调读最新值，避免闭包读到旧值 */
  const activeRef = useRef(active)
  activeRef.current = active

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
      cancelAnimationFrame(settleRaf.current)
      clearTimeout(wakingTimer.current)
      bot.destroy()
    }
  }, [])

  useEffect(() => {
    const bot = botRef.current
    if (!bot) return

    // 上一轮遗留的收尾会覆盖这里设的状态，先取消
    cancelAnimationFrame(settleRaf.current)
    clearTimeout(wakingTimer.current)

    if (!active) {
      // setMode('onboarding') 会把 moodN 归零，即从头重播登录轮换
      bot.setMode('onboarding')
      return
    }

    bot.setMode('hold')

    // 醒来动效整套由引擎驱动（含闭眼、粒子爆发、眨眼），宿主只负责
    // 进入 waking、过一会儿再送出去 —— 不要去写 ctx.wakeEye，
    // 引擎每帧都在写它，写了也会被覆盖。
    bot.setState('waking')
    wakingTimer.current = window.setTimeout(() => {
      botRef.current?.setState('idle')
    }, WAKING_MS)
  }, [active])

  const handleClick = (): void => {
    const bot = botRef.current
    // 已有转圈在进行就忽略：这时再 setState 会把那个转圈打断（character.js:259）
    if (!bot || bot.spinTurn) return

    bot.setMode('hold')
    bot.setState('humming')
    bot.spinOnce(1)

    // 引擎在转圈落定时把 spinTurn 置回 null（character.js:600），据此收尾。
    // 注：开了 prefers-reduced-motion 时 _pn 直接返回、转圈不会开始，
    // 这里会立刻判定「已落定」，humming 一闪而过 —— 符合减少动效的预期。
    const settle = (): void => {
      const b = botRef.current
      if (!b) return
      if (b.spinTurn) {
        settleRaf.current = requestAnimationFrame(settle)
        return
      }
      if (activeRef.current) b.setState('idle')
      else b.setMode('onboarding')
    }
    settleRaf.current = requestAnimationFrame(settle)
  }

  return (
    <button
      type="button"
      className="grok-bot"
      aria-label="Grok Bot"
      onClick={handleClick}
    >
      <svg ref={svgRef} aria-hidden="true" />
    </button>
  )
}
