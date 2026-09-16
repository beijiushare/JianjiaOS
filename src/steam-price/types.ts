export interface Game {
  appId: string
  name?: string
  image?: string
  addedAt: number
}

export interface SteamPriceData {
  currency: string
  initial: number
  final: number
  discount_percent: number
  initial_formatted: string
  final_formatted: string
}

/** 无 filters — 同时包含 name、header_image、price_overview */
export interface SteamAppDetailResponse {
  success: boolean
  data?: {
    name: string
    header_image: string
    price_overview?: SteamPriceData
  }
}
