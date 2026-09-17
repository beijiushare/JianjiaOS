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

/** ai-news 返回 { date, news: [...] } 不是数组 */
export interface AiNewsData {
  date: string
  news: AiNewsItem[]
}

export interface AiNewsItem {
  title: string
  detail: string
  link: string
  source: string
  date: string
}

export const fetchAiNews = () =>
  fetchJson<AiNewsData>('/v2/ai-news?encoding=json')

// ── 热门 Tab ──────────────────────────────────────────────────────

/** toutiao / weibo / zhihu 结构统一 */
export interface HotItem {
  title: string
  hot_value: number
  link: string
  cover?: string
}

export const fetchToutiaoHot = () =>
  fetchJson<HotItem[]>('/v2/toutiao?encoding=json')

export const fetchWeiboHot = () =>
  fetchJson<HotItem[]>('/v2/weibo?encoding=json')

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

/** baidu/hot: 有 rank, score, score_desc, cover, 没有 hot_value/link */
export interface BaiduHotItem {
  rank: number
  title: string
  desc: string
  score: string
  score_desc: string
  cover: string
  type: string
  type_desc: string
}

export const fetchBaiduHot = () =>
  fetchJson<BaiduHotItem[]>('/v2/baidu/hot?encoding=json')

/** baidu/tieba: 有 rank, score, score_desc, avatar, 没有 hot_value/link */
export interface TiebaItem {
  rank: number
  title: string
  desc: string
  abstract: string
  score: number
  score_desc: string
  avatar: string
}

export const fetchTiebaHot = () =>
  fetchJson<TiebaItem[]>('/v2/baidu/tieba?encoding=json')

/** quark: 有 id, title, summary, content, 没有 hot_value/link */
export interface QuarkItem {
  id: string
  title: string
  summary: string
  content: string
}

export const fetchQuarkHot = () =>
  fetchJson<QuarkItem[]>('/v2/quark?encoding=json')

/** rednote: score 是字符串如 "947.5w" */
export interface RednoteItem {
  rank: number
  title: string
  score: string
  word_type: string
  work_type_icon: string
  link: string
}

export const fetchRednoteHot = () =>
  fetchJson<RednoteItem[]>('/v2/rednote?encoding=json')

// ── 实用 Tab ──────────────────────────────────────────────────────

/** gold-price: 返回 { date, metals: [...] } */
export interface GoldPriceData {
  date: string
  metals: GoldMetal[]
}

export interface GoldMetal {
  name: string
  sell_price: string
  today_price: string
  high_price: string
  low_price: string
  unit: string
  updated: string
  updated_at: number
}

export const fetchGoldPrice = () =>
  fetchJson<GoldPriceData>('/v2/gold-price?encoding=json')

/** fuel-price: 返回 { region, trend, items: [...] } */
export interface FuelPriceData {
  region: string
  trend: {
    next_adjustment_date: string
    direction: string
    change_liter_desc: string
    description: string
  }
  items: FuelItem[]
  link: string
}

export interface FuelItem {
  name: string
  price: number
  price_desc: string
}

export const fetchFuelPrice = () =>
  fetchJson<FuelPriceData>('/v2/fuel-price?encoding=json')

/** exchange-rate: 返回 { base_code, updated, rates: [{currency, rate}] } */
export interface ExchangeRateData {
  base_code: string
  updated: string
  updated_at: number
  rates: ExchangeRate[]
}

export interface ExchangeRate {
  currency: string
  rate: number
}

export const fetchExchangeRate = () =>
  fetchJson<ExchangeRateData>('/v2/exchange-rate?encoding=json')

/** maoyan: 返回 { list: [...] } */
export interface MaoyanData {
  list: MaoyanMovie[]
}

export interface MaoyanMovie {
  rank: number
  maoyan_id: number
  movie_name: string
  release_year: string
  box_office: number
  box_office_desc: string
}

export const fetchMaoyanMovies = () =>
  fetchJson<MaoyanData>('/v2/maoyan/all/movie?encoding=json')

/** douban: 有 url 没有 link, 有 cover, rating */
export interface DoubanItem {
  rank: number
  title: string
  id: string
  rating: number
  rating_count: number
  good_rate: number
  trend: string
  rank_change: number
  card_subtitle: string
  description: string
  cover: string
  cover_proxy: string
  url: string
  tags: string[]
}

export const fetchDoubanMovie = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/movie?encoding=json')

export const fetchDoubanTv = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/tv_global?encoding=json')

export const fetchDoubanShow = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/show_global?encoding=json')
