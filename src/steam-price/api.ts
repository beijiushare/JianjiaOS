import { Capacitor, CapacitorHttp } from '@capacitor/core'

import type {
  SteamAppDetailResponse,
  SteamPriceResponse,
  SteamScreenshotsResponse,
} from './types'

const STEAM_API = 'https://store.steampowered.com/api/appdetails'
const IS_NATIVE = Capacitor.isNativePlatform()

async function httpGet<T>(params: Record<string, string>): Promise<T> {
  if (!IS_NATIVE) {
    const resp = await fetch(`/steam-api/api/appdetails?${new URLSearchParams(params)}`)
    return resp.json() as Promise<T>
  }
  const resp = await CapacitorHttp.get({
    url: STEAM_API,
    params,
  })
  return resp.data as T
}

export function fetchSteamPrice(appId: string): Promise<SteamPriceResponse> {
  return httpGet({ appids: appId, cc: 'CN', filters: 'price_overview' })
}

export function fetchSteamDetail(appId: string): Promise<SteamAppDetailResponse> {
  return httpGet({ appids: appId, cc: 'CN' })
}

export function fetchSteamScreenshots(appId: string): Promise<SteamScreenshotsResponse> {
  return httpGet({ appids: appId, cc: 'CN', filters: 'screenshots' })
}

export function formatPrice(cents: number): string {
  return `¥ ${(cents / 100).toFixed(2)}`
}
