/**
 * 60s 知世界 — 类型定义
 */

// ── 新闻 Tab ──────────────────────────────────────────────────────

export interface Day60sData {
  date: string
  news: string[]
  image: string
  tip: string
  cover: string
  day_of_week: string
  lunar_date: string
}

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

export interface ItNewsItem {
  title: string
  description: string
  link: string
  created: string
  created_at: number
}

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

// ── 热门 Tab ──────────────────────────────────────────────────────

/** toutiao / weibo / zhihu 结构统一 */
export interface HotItem {
  title: string
  hot_value: number
  link: string
  cover?: string
}

export interface ZhihuItem {
  title: string
  detail: string
  cover: string
  hot_value_desc: string
  answer_cnt: number
  follower_cnt: number
  link: string
}

/** bili: 有 title, link, 没有 hot_value */
export interface BiliItem {
  title: string
  link: string
}

/** douyin: 有 title, hot_value, cover, link */
export interface DouyinItem {
  title: string
  hot_value: number
  cover: string
  link: string
}

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

/** quark: 有 id, title, summary, content, 没有 hot_value/link */
export interface QuarkItem {
  id: string
  title: string
  summary: string
  content: string
}

/** rednote: score 是字符串如 "947.5w" */
export interface RednoteItem {
  rank: number
  title: string
  score: string
  word_type: string
  work_type_icon: string
  link: string
}

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
