import { useEffect, useRef, useState } from 'react'

import { useNavStore } from './store'
import type { NavLayer } from './types'

/**
 * 退场动画的最长时长。
 *
 * ⚠️ 必须 ≥ 所有层的动画时长，否则层会在动画播完前被卸载
 *    （表现为「滑到一半突然消失」）。
 *
 * 当前取 push 页的 --slide-duration（350ms）：抽屉的 --drawer-duration
 * 已缩短至 160ms，不再是最大值。任何一层的时长变更后，此处都要重新取最大值。
 */
const EXIT_MS = 350

export interface LayerTransition {
  /** 待渲染的层，**包含**正在播放退场动画的层 */
  rendered: NavLayer[]
  /** 正在退场的层 key 集合 */
  exitingKeys: ReadonlySet<string>
}

/**
 * 将导航栈映射为待渲染的层列表。
 *
 * 退场动画需要延迟卸载：React 卸载 DOM 是同步的，而动画需要时间。因此被移除的
 * 层先标记为 exiting 并保留 EXIT_MS，计时结束后才真正移除。
 *
 * 进场无需特殊处理：使用 CSS animation 而非 transition，元素挂载即自动播放，
 * 无需「先渲染一帧再追加 class」。
 *
 * 计时器实现说明：使用 setTimeout 而非 transitionend。后者在元素被提前卸载、
 * transition 被中断或丢帧时不会触发，一旦遗漏将永久残留一层 DOM，且不产生任何报错。
 */
export function useLayerTransition(): LayerTransition {
  const stack = useNavStore((s) => s.stack)

  const [rendered, setRendered] = useState<NavLayer[]>(stack)
  const [exitingKeys, setExitingKeys] = useState<ReadonlySet<string>>(new Set())

  const prevStackRef = useRef<NavLayer[]>(stack)
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const prevStack = prevStackRef.current
    prevStackRef.current = stack

    const nextKeys = new Set(stack.map((l) => l.key))
    const prevKeys = new Set(prevStack.map((l) => l.key))

    const added = stack.filter((l) => !prevKeys.has(l.key))
    const removed = prevStack.filter((l) => !nextKeys.has(l.key))

    if (added.length === 0 && removed.length === 0) return

    // 新层追加至末尾 —— 数组末尾即视觉最上层
    if (added.length > 0) {
      setRendered((prev) => [...prev, ...added])
    }

    // 被移除的层保留至动画播完
    if (removed.length > 0) {
      setExitingKeys((s) => new Set([...s, ...removed.map((l) => l.key)]))

      for (const layer of removed) {
        const t = setTimeout(() => {
          timersRef.current.delete(layer.key)
          setRendered((r) => r.filter((l) => l.key !== layer.key))
          setExitingKeys((s) => {
            const n = new Set(s)
            n.delete(layer.key)
            return n
          })
        }, EXIT_MS)

        timersRef.current.set(layer.key, t)
      }
    }
  }, [stack])

  // 卸载时清除所有未触发的计时器
  useEffect(() => {
    const map = timersRef.current
    return () => {
      for (const t of map.values()) clearTimeout(t)
      map.clear()
    }
  }, [])

  return { rendered, exitingKeys }
}
