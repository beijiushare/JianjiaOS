/**
 * vendored 引擎（vendor/*.js）的全局类型。
 *
 * 引擎是 IIFE，没有 ESM 导出，只能通过 window 上的全局名字调用；
 * 这里只声明我们用到的部分，参数名与默认值照抄 src/character.js 的构造函数。
 */

export {}

declare global {
  interface GrokCharacterOptions {
    /** 'onboarding' = 登录轮换（idle ↔ 特技交替）；'hold' = 锁定状态 */
    mode?: 'onboarding' | 'hold'
    /** 身形 id，见 GROK_GEO.shapes：blob / dome / egg / … 共 18 种 */
    shape?: string
    /** 墨色 id，见 GROK_GEO.palette，默认 'black' */
    color?: string
    /** 'light' | 'dark'，仅在 loginWrap 为 false 时生效 */
    scheme?: 'light' | 'dark'
    /** 初始情绪状态名 */
    state?: string
    /** 登录页包装：pose 基线 / 眼睛拓扑 / 墨色改走 light-dark()。默认 true */
    loginWrap?: boolean
    /** 设了就写死 svg 的行内宽高（px）；不设则由外部 CSS 决定 */
    sizePx?: number | null
    /** 跟随指针；源码默认关，上游 playground 才开 */
    followPointer?: boolean
    /** 强调态 */
    emphasis?: boolean
    /** 暂停渲染循环 */
    paused?: boolean
    /** 不传则读 prefers-reduced-motion */
    reduceMotion?: boolean
    /** 每帧状态快照回调 */
    onChange?: (snap: unknown) => void
  }

  interface GrokCharacterHandle {
    setMode(mode: 'onboarding' | 'hold'): void
    setShape(name: string): void
    setState(name: string, opts?: { resetEyes?: boolean }): void
    setColor(id: string, scheme?: 'light' | 'dark'): void
    setInk(flat: string | null): void
    setEyeColor(color: string | null): void
    setFollowPointer(v: boolean): void
    setEmphasis(v: boolean): void
    /** 转圈，turns 为圈数 */
    spinOnce(turns?: number): void
    bounceOnce(): void
    burstOnce(): void
    snapshot(): unknown
    /** 停 rAF、解绑指针、清粒子 */
    destroy(): void

    /* ↓ 以下不是公开 API，是引擎内部字段。没有对应的公开方法才直接读写，
         用它们的每一处都注明了原因与行号。 */

    /**
     * 进行中的转圈弹簧。引擎在它落定时置回 null（character.js:600），
     * 所以轮询这个字段即可判断「转圈结束」。
     */
    spinTurn: unknown
  }

  interface Window {
    GrokCharacter: new (
      svg: SVGSVGElement,
      opts?: GrokCharacterOptions,
    ) => GrokCharacterHandle
  }
}
