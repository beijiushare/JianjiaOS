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

export interface SteamScreenshot {
  id: number
  path_thumbnail: string
  path_full: string
}

/** filters=price_overview */
export interface SteamPriceResponse {
  success: boolean
  data?: {
    price_overview?: SteamPriceData
  }
}

/** 无 filters（取名字） */
export interface SteamAppDetailResponse {
  success: boolean
  data?: {
    name: string
  }
}

/** filters=screenshots（取截图） */
export interface SteamScreenshotsResponse {
  success: boolean
  data?: {
    screenshots: SteamScreenshot[]
  }
}
