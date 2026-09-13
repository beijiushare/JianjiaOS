import { Preferences } from '@capacitor/preferences'
import { create } from 'zustand'

import { DEFAULT_BACKGROUND_ID } from './backgrounds'

const KEY = 'settings.v1'

interface Persisted {
  chatBackgroundId: string
}

interface SettingsState {
  /** 聊天背景图案的 id，见 settings/backgrounds.ts */
  chatBackgroundId: string
  setChatBackground: (id: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  chatBackgroundId: DEFAULT_BACKGROUND_ID,
  setChatBackground: (id) => set({ chatBackgroundId: id }),
}))

/**
 * 从持久化存储恢复设置。
 *
 * ⚠️ 与 hydrateMessages 一样，须在首次渲染前完成，
 *    否则聊天背景会先按默认值渲染再跳变。
 */
export async function hydrateSettings(): Promise<void> {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value === null || value === '') return

    const data = JSON.parse(value) as Partial<Persisted>
    if (typeof data.chatBackgroundId === 'string') {
      useSettingsStore.setState({ chatBackgroundId: data.chatBackgroundId })
    }
  } catch (e) {
    console.warn('[settings] 恢复失败，将使用默认值', e)
  }
}

/** 订阅变更并写回 */
export function persistSettings(): void {
  useSettingsStore.subscribe((s) => {
    const data: Persisted = { chatBackgroundId: s.chatBackgroundId }
    void Preferences.set({ key: KEY, value: JSON.stringify(data) }).catch(
      (e: unknown) => {
        console.warn('[settings] 写入失败', e)
      },
    )
  })
}
