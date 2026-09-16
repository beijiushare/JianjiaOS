import { Preferences } from '@capacitor/preferences'
import { create } from 'zustand'

import type { Game } from './types'

const KEY = 'steam-price.v1'

interface SteamPriceState {
  games: Game[]
  addGame: (appId: string) => void
  removeGame: (appId: string) => void
  updateGame: (appId: string, patch: Partial<Pick<Game, 'name' | 'image'>>) => void
}

export const useSteamPriceStore = create<SteamPriceState>((set) => ({
  games: [],
  addGame: (appId) =>
    set((s) => {
      if (s.games.some((g) => g.appId === appId)) return s
      return { games: [...s.games, { appId, addedAt: Date.now() }] }
    }),
  removeGame: (appId) =>
    set((s) => ({ games: s.games.filter((g) => g.appId !== appId) })),
  updateGame: (appId, patch) =>
    set((s) => ({
      games: s.games.map((g) => (g.appId === appId ? { ...g, ...patch } : g)),
    })),
}))

export async function hydrateSteamPrice(): Promise<void> {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value === null || value === '') return
    const data = JSON.parse(value) as Partial<SteamPriceState>
    const patch: Partial<SteamPriceState> = {}
    if (Array.isArray(data.games)) patch.games = data.games
    if (Object.keys(patch).length > 0) useSteamPriceStore.setState(patch)
  } catch (e) {
    console.warn('[steam-price] 恢复失败，将从空状态开始', e)
  }
}

export function persistSteamPrice(): void {
  useSteamPriceStore.subscribe((s) => {
    const data = { games: s.games }
    void Preferences.set({ key: KEY, value: JSON.stringify(data) }).catch(
      (e: unknown) => {
        console.warn('[steam-price] 写入失败', e)
      },
    )
  })
}
