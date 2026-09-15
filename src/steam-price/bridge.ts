/**
 * Steam 价格追踪与消息系统的桥接层。
 *
 * 核心约定：达到目标价时往「系统消息」发一条文本消息。
 * 用 notifiedApps 去重，同一款游戏只通知一次（除非用户删除后重新添加）。
 */

import { useMessagesStore } from '@/messages/store'

import { useSteamPriceStore } from './store'

let messageSeq = 0
const nextMessageId = (): string =>
  `msg-steam-${String(Date.now())}-${String(++messageSeq)}`

interface PriceResult {
  appId: string
  name: string
  currentCents: number
  current: string
  original: string
  discount: number
}

/**
 * 检查价格并发送达标通知。
 *
 * 在每次价格查询完成后调用，将所有新达标的ゲーム合并为一条消息。
 */
export function checkAndNotify(prices: Record<string, PriceResult>): void {
  const steamStore = useSteamPriceStore.getState()
  const games = steamStore.games
  const notified = steamStore.notifiedApps

  const qualified: Array<{ game: (typeof games)[number]; price: PriceResult }> = []

  for (const game of games) {
    if (notified.includes(game.appId)) continue
    const p = prices[game.appId]
    if (!p) continue
    if (p.currentCents / 100 <= game.targetPrice) {
      qualified.push({ game, price: p })
    }
  }

  if (qualified.length === 0) return

  const lines = qualified.map(
    ({ game, price }, i) =>
      `${i + 1}、${game.name ?? game.appId}，原价${price.original}，现价${price.current}，折扣${price.discount}%，满足目标价¥ ${game.targetPrice.toFixed(2)}`,
  )
  const text = `有${qualified.length}款游戏达到目标价格\n${lines.join('\n')}`

  useMessagesStore.getState().appendMessage({
    id: nextMessageId(),
    chatId: 'system',
    from: 'system',
    ts: Date.now(),
    read: false,
    kind: { type: 'text', text },
  })

  steamStore.markNotified(qualified.map(({ game }) => game.appId))
}
