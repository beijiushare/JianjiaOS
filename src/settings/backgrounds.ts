import catUrl from '@/assets/backgrounds/tt-cat.svg'
import cat2Url from '@/assets/backgrounds/tt-cat2.svg'
import fishUrl from '@/assets/backgrounds/tt-fish.svg'
import foodUrl from '@/assets/backgrounds/tt-food.svg'
import mathUrl from '@/assets/backgrounds/tt-math.svg'
import planetUrl from '@/assets/backgrounds/tt-planet.svg'
import sportUrl from '@/assets/backgrounds/tt-sport.svg'
import toolUrl from '@/assets/backgrounds/tt-tool.svg'

export interface ChatBackground {
  id: string
  name: string
  /** Vite 处理后的资源 URL */
  url: string
}

/**
 * 聊天背景图案。
 *
 * 这些 SVG 是**单色线条画**（`fill:none` + `stroke:#000000`），颜色写死在文件里
 * 且无法从外部 CSS 覆盖。因此使用时把它们当 **CSS mask**、颜色由 CSS 给
 * —— 这样深浅两套主题各用一个色，不必准备两份文件。
 * 具体见 index.css 的 .chat-background。
 */
export const CHAT_BACKGROUNDS: ChatBackground[] = [
  { id: 'planet', name: '星球', url: planetUrl },
  { id: 'cat', name: '猫', url: catUrl },
  { id: 'cat2', name: '猫（二）', url: cat2Url },
  { id: 'fish', name: '鱼', url: fishUrl },
  { id: 'food', name: '食物', url: foodUrl },
  { id: 'math', name: '数学', url: mathUrl },
  { id: 'sport', name: '运动', url: sportUrl },
  { id: 'tool', name: '工具', url: toolUrl },
]

export const DEFAULT_BACKGROUND_ID = 'planet'

/** 按 id 取背景，找不到时回落到默认 —— 避免持久化的旧 id 导致空白 */
export function findBackground(id: string): ChatBackground {
  return (
    CHAT_BACKGROUNDS.find((b) => b.id === id) ??
    CHAT_BACKGROUNDS.find((b) => b.id === DEFAULT_BACKGROUND_ID) ??
    CHAT_BACKGROUNDS[0]
  )
}
