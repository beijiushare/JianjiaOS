import { Capacitor, CapacitorHttp } from '@capacitor/core'

import type { SteamAppDetailResponse } from './types'

const WORKER_API = 'https://steam-api.beijiu.top/api/appdetails'
const IS_NATIVE = Capacitor.isNativePlatform()

export async function fetchSteamDetail(appId: string): Promise<Record<string, SteamAppDetailResponse>> {
  if (IS_NATIVE) {
    const resp = await CapacitorHttp.get({
      url: WORKER_API,
      params: { appids: appId, cc: 'CN' },
    })
    return resp.data as Record<string, SteamAppDetailResponse>
  }
  const resp = await fetch(`${WORKER_API}?appids=${appId}&cc=CN`)
  return resp.json() as Promise<Record<string, SteamAppDetailResponse>>
}

export function formatPrice(cents: number): string {
  return `¥ ${(cents / 100).toFixed(2)}`
}
