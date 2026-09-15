import { Capacitor } from '@capacitor/core'

import type {
  SteamAppDetailResponse,
  SteamPriceResponse,
  SteamScreenshotsResponse,
} from './types'

const STEAM_API = Capacitor.isNativePlatform()
  ? 'https://store.steampowered.com/api/appdetails'
  : '/steam-api/api/appdetails'

export async function fetchSteamPrice(appId: string): Promise<SteamPriceResponse> {
  const resp = await fetch(`${STEAM_API}?appids=${appId}&cc=CN&filters=price_overview`)
  return resp.json() as Promise<SteamPriceResponse>
}

export async function fetchSteamDetail(appId: string): Promise<SteamAppDetailResponse> {
  const resp = await fetch(`${STEAM_API}?appids=${appId}&cc=CN`)
  return resp.json() as Promise<SteamAppDetailResponse>
}

export async function fetchSteamScreenshots(appId: string): Promise<SteamScreenshotsResponse> {
  const resp = await fetch(`${STEAM_API}?appids=${appId}&cc=CN&filters=screenshots`)
  return resp.json() as Promise<SteamScreenshotsResponse>
}

export function formatPrice(cents: number): string {
  return `¥ ${(cents / 100).toFixed(2)}`
}
