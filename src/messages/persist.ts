import { Preferences } from '@capacitor/preferences'

import { useMessagesStore } from './store'
import type { Message } from './types'

/**
 * 消息持久化。规格见设计文档 §5.1。
 *
 * 只存「会变的部分」：消息列表与已通知版本集合。
 * chats 是常量、canReply 等由代码决定，存了反而会与代码版本冲突。
 */

const KEY = 'messages.v1'

interface Persisted {
  messages: Message[]
  notifiedVersions: string[]
}

/**
 * 从持久化存储恢复消息。
 *
 * ⚠️ 必须在首次渲染前完成，否则会先渲染空列表再跳变。
 *    main.tsx 里 await 它之后才 createRoot。
 */
export async function hydrateMessages(): Promise<void> {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value === null || value === '') return

    const data = JSON.parse(value) as Partial<Persisted>
    useMessagesStore.setState({
      messages: (data.messages ?? []).map(migrateMessage),
      notifiedVersions: data.notifiedVersions ?? [],
    })
  } catch (e) {
    // 数据损坏时宁可丢弃也不能让应用起不来
    console.warn('[messages] 恢复失败，将从空状态开始', e)
  }
}

/**
 * 把旧版本存下来的消息补齐到当前结构。
 *
 * 持久化的数据是「跨版本存活」的，而结构会随开发演进 —— 新增字段后，
 * 旧数据里就没有它，读出来是 undefined。渲染层若不防御就会崩，
 * 且表现为整页白屏、原因难查（本项目已踩过一次）。
 *
 * 约定：**每次给消息结构加字段，都要在这里补一次默认值**。
 * 若将来改动大到无法逐字段兼容，就换 KEY 的版本号（messages.v2）直接丢弃旧数据。
 */
function migrateMessage(message: Message): Message {
  if (message.kind.type !== 'update-card') return message

  return {
    ...message,
    kind: {
      type: 'update-card',
      card: {
        ...message.kind.card,
        notes:
          typeof message.kind.card.notes === 'string'
            ? message.kind.card.notes
            : '',
      },
    },
  }
}

/**
 * 订阅 store 变更并写回。
 *
 * 全量覆盖写入而非增量 —— 消息量级很小（个位数），
 * 换成增量同步的复杂度远大于收益。
 */
export function persistMessages(): void {
  useMessagesStore.subscribe((s) => {
    const data: Persisted = {
      messages: s.messages,
      notifiedVersions: s.notifiedVersions,
    }
    void Preferences.set({ key: KEY, value: JSON.stringify(data) }).catch(
      (e: unknown) => {
        console.warn('[messages] 写入失败', e)
      },
    )
  })
}
