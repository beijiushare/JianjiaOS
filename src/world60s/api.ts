/**
 * 60s 知世界 — API 层
 *
 * 多实例轮询降级：对每个接口，依次尝试公共实例，超时或失败就换下一个。
 * 主站 60s.viki.moe 压力大，不在列表中。
 */

import { fetchWithTimeout } from '@/utils'
import type {
  Day60sData,
  TodayInHistoryData,
  ItNewsItem,
  EpicGame,
  AiNewsData,
  HotItem,
  ZhihuItem,
  BiliItem,
  DouyinItem,
  BaiduHotItem,
  TiebaItem,
  QuarkItem,
  RednoteItem,
  GoldPriceData,
  FuelPriceData,
  ExchangeRateData,
  MaoyanData,
  DoubanItem,
} from './types'

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

const cache = new Map<string, unknown>()

async function fetchJson<T>(path: string): Promise<T | null> {
  if (cache.has(path)) return cache.get(path) as T

  for (const base of INSTANCES) {
    try {
      const res = await fetchWithTimeout(`${base}${path}`, TIMEOUT_MS)
      if (!res.ok) continue
      const data = (await res.json()) as T
      cache.set(path, data)
      return data
    } catch {
      // 超时或网络错误，尝试下一个实例
    }
  }
  return null
}

// ── 新闻 Tab ──────────────────────────────────────────────────────

export const fetchDay60s = (date?: string) =>
  fetchJson<Day60sData>(`/v2/60s?encoding=json${date ? `&date=${date}` : ''}`)

export const fetchTodayInHistory = () =>
  fetchJson<TodayInHistoryData>('/v2/today-in-history?encoding=json')

export const fetchItNews = () =>
  fetchJson<ItNewsItem[]>('/v2/it-news?encoding=json')

export const fetchEpicFree = () =>
  fetchJson<EpicGame[]>('/v2/epic?encoding=json')

export const fetchAiNews = () =>
  fetchJson<AiNewsData>('/v2/ai-news?encoding=json')

// ── 热门 Tab ──────────────────────────────────────────────────────

export const fetchToutiaoHot = () =>
  fetchJson<HotItem[]>('/v2/toutiao?encoding=json')

export const fetchWeiboHot = () =>
  fetchJson<HotItem[]>('/v2/weibo?encoding=json')

export const fetchZhihuHot = () =>
  fetchJson<ZhihuItem[]>('/v2/zhihu?encoding=json')

export const fetchBiliHot = () =>
  fetchJson<BiliItem[]>('/v2/bili?encoding=json')

export const fetchDouyinHot = () =>
  fetchJson<DouyinItem[]>('/v2/douyin?encoding=json')

export const fetchBaiduHot = () =>
  fetchJson<BaiduHotItem[]>('/v2/baidu/hot?encoding=json')

export const fetchTiebaHot = () =>
  fetchJson<TiebaItem[]>('/v2/baidu/tieba?encoding=json')

export const fetchQuarkHot = () =>
  fetchJson<QuarkItem[]>('/v2/quark?encoding=json')

export const fetchRednoteHot = () =>
  fetchJson<RednoteItem[]>('/v2/rednote?encoding=json')

// ── 实用 Tab ──────────────────────────────────────────────────────

export const fetchGoldPrice = () =>
  fetchJson<GoldPriceData>('/v2/gold-price?encoding=json')

export const fetchFuelPrice = () =>
  fetchJson<FuelPriceData>('/v2/fuel-price?encoding=json')

export const fetchExchangeRate = () =>
  fetchJson<ExchangeRateData>('/v2/exchange-rate?encoding=json')

export const fetchMaoyanMovies = () =>
  fetchJson<MaoyanData>('/v2/maoyan/all/movie?encoding=json')

export const fetchDoubanMovie = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/movie?encoding=json')

export const fetchDoubanTv = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/tv_global?encoding=json')

export const fetchDoubanShow = () =>
  fetchJson<DoubanItem[]>('/v2/douban/weekly/show_global?encoding=json')
