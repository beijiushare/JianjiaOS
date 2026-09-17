/**
 * 60s 知世界 — API 层
 *
 * 多实例轮询降级：对每个接口，依次尝试公共实例，超时或失败就换下一个。
 * 主站 60s.viki.moe 压力大，不在列表中。
 */

const INSTANCES = [
  'https://60s.crystelf.top',
  'https://api.elysiayanyu.top',
  'https://60s.7se.cn',
  'https://60s.mizhoubaobei.top',
  'https://api.cczo.cc/60s',
  'https://60s.zellon.top',
  'https://60s.superjeason.qzz.io',
]

const TIMEOUT_MS = 8000

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * 对单个接口路径，在多个实例间轮询降级。
 * 返回解析后的 data 字段，失败返回 null。
 */
export async function fetchJson<T>(path: string): Promise<T | null> {
  for (const base of INSTANCES) {
    try {
      const resp = await fetchWithTimeout(`${base}${path}`, TIMEOUT_MS)
      if (!resp.ok) continue
      const json = await resp.json() as { code: number; data: T }
      if (json.code === 200 && json.data != null) return json.data
    } catch {
      // 超时或网络错误，尝试下一个实例
    }
  }
  return null
}

// ── 资讯 Tab ──────────────────────────────────────────────────────

export interface Day60sData {
  date: string
  news: string[]
  image: string
  tip: string
  cover: string
  day_of_week: string
  lunar_date: string
}

export const fetchDay60s = (date?: string) =>
  fetchJson<Day60sData>(`/v2/60s?encoding=json${date ? `&date=${date}` : ''}`)

export interface HistoryItem {
  title: string
  year: string
  description: string
  event_type: string
  link: string
}

export interface TodayInHistoryData {
  date: string
  month: number
  day: number
  items: HistoryItem[]
}

export const fetchTodayInHistory = () =>
  fetchJson<TodayInHistoryData>('/v2/today-in-history?encoding=json')

export interface ItNewsItem {
  title: string
  description: string
  link: string
  created: string
  created_at: number
}

export const fetchItNews = () =>
  fetchJson<ItNewsItem[]>('/v2/it-news?encoding=json')

export interface EpicGame {
  id: string
  title: string
  cover: string
  original_price: number
  original_price_desc: string
  description: string
  seller: string
  is_free_now: boolean
  free_start: string
  free_start_at: number
  free_end: string
  free_end_at: number
  link: string
}

export const fetchEpicFree = () =>
  fetchJson<EpicGame[]>('/v2/epic?encoding=json')

export interface AiNewsItem {
  title: string
  description: string
  link: string
  created: string
  created_at: number
}

export const fetchAiNews = () =>
  fetchJson<AiNewsItem[]>('/v2/ai-news?encoding=json')

// ── 热门 Tab ──────────────────────────────────────────────────────

export interface HotItem {
  title: string
  hot_value: number
  link: string
  cover?: string
}

export const fetchBiliHot = () =>
  fetchJson<HotItem[]>('/v2/bili?encoding=json')

export const fetchToutiaoHot = () =>
  fetchJson<HotItem[]>('/v2/toutiao?encoding=json')

export const fetchQuarkHot = () =>
  fetchJson<HotItem[]>('/v2/quark?encoding=json')

export const fetchBaiduHot = () =>
  fetchJson<HotItem[]>('/v2/baidu/hot?encoding=json')

export const fetchTiebaHot = () =>
  fetchJson<HotItem[]>('/v2/baidu/tieba?encoding=json')

export const fetchWeiboHot = () =>
  fetchJson<HotItem[]>('/v2/weibo?encoding=json')

export const fetchRednoteHot = () =>
  fetchJson<HotItem[]>('/v2/rednote?encoding=json')

export interface ZhihuItem {
  title: string
  detail: string
  cover: string
  hot_value_desc: string
  answer_cnt: number
  follower_cnt: number
  link: string
}

export const fetchZhihuHot = () =>
  fetchJson<ZhihuItem[]>('/v2/zhihu?encoding=json')

// ── 实用 Tab ──────────────────────────────────────────────────────

export interface GoldPriceData {
  price: string
  change: string
  time: string
}

export const fetchGoldPrice = () =>
  fetchJson<GoldPriceData>('/v2/gold-price?encoding=json')

export interface FuelPriceData {
  data: Record<string, Record<string, string>>
  time: string
}

export const fetchFuelPrice = () =>
  fetchJson<FuelPriceData>('/v2/fuel-price?encoding=json')

export interface ExchangeRateData {
  data: Record<string, string>
  time: string
}

export const fetchExchangeRate = () =>
  fetchJson<ExchangeRateData>('/v2/exchange-rate?encoding=json')

export interface MaoyanMovie {
  title: string
  score: string
  cover: string
  link: string
}

export const fetchMaoyanMovies = () =>
  fetchJson<MaoyanMovie[]>('/v2/maoyan/all/movie?encoding=json')

export interface DoubanItem {
  title: string
  score: string
  cover: string
  link: string
}

export const fetchDoubanMovie = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/movie?encoding=json')

export const fetchDoubanTv = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/tv_global?encoding=json')

export const fetchDoubanShow = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/show_global?encoding=json')

export interface BaikeItem {
  title: string
  description: string
  link: string
}

export const fetchBaike = () =>
  fetchJson<BaikeItem[]>('/v2/baike?encoding=json')
