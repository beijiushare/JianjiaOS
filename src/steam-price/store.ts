import { Preferences } from '@capacitor/preferences'
import { create } from 'zustand'

import type { Game } from './types'

const KEY = 'steam-price.v1'

interface Persisted {
  games: Game[]
  notifiedApps: string[]
}

interface SteamPriceState {
  games: Game[]
  /** 已发送过达标通知的 appId 集合，避免重复通知 */
  notifiedApps: string[]
  addGame: (appId: string, targetPrice: number) => void
  removeGame: (appId: string) => void
  updateGame: (appId: string, patch: Partial<Pick<Game, 'name' | 'image'>>) => void
  markNotified: (appIds: string[]) => void
}

export const useSteamPriceStore = create<SteamPriceState>((set) => ({
  games: [],
  notifiedApps: [],
  addGame: (appId, targetPrice) =>
    set((s) => {
      if (s.games.some((g) => g.appId === appId)) return s
      return { games: [...s.games, { appId, targetPrice, addedAt: Date.now() }] }
    }),
  removeGame: (appId) =>
    set((s) => ({ games: s.games.filter((g) => g.appId !== appId) })),
  updateGame: (appId, patch) =>
    set((s) => ({
      games: s.games.map((g) => (g.appId === appId ? { ...g, ...patch } : g)),
    })),
  markNotified: (appIds) =>
    set((s) => ({
      notifiedApps: [
        ...s.notifiedApps,
        ...appIds.filter((id) => !s.notifiedApps.includes(id)),
      ],
    })),
}))

export async function hydrateSteamPrice(): Promise<void> {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value === null || value === '') return
    const data = JSON.parse(value) as Partial<Persisted>
    const patch: Partial<SteamPriceState> = {}
    if (Array.isArray(data.games)) patch.games = data.games
    if (Array.isArray(data.notifiedApps)) patch.notifiedApps = data.notifiedApps
    if (Object.keys(patch).length > 0) useSteamPriceStore.setState(patch)
  } catch (e) {
    console.warn('[steam-price] 恢复失败，将从空状态开始', e)
  }
}

export function persistSteamPrice(): void {
  useSteamPriceStore.subscribe((s) => {
    const data: Persisted = { games: s.games, notifiedApps: s.notifiedApps }
    void Preferences.set({ key: KEY, value: JSON.stringify(data) }).catch(
      (e: unknown) => {
        console.warn('[steam-price] 写入失败', e)
      },
    )
  })
}
