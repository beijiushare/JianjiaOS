import { useEffect, useRef, useState } from 'react'

import { ScreenShell } from '@/components/ScreenShell'
import { Browser } from '@capacitor/browser'

import {
  fetchDay60s,
  fetchTodayInHistory,
  fetchItNews,
  fetchEpicFree,
  fetchAiNews,
  fetchBiliHot,
  fetchDouyinHot,
  fetchToutiaoHot,
  fetchQuarkHot,
  fetchBaiduHot,
  fetchTiebaHot,
  fetchWeiboHot,
  fetchRednoteHot,
  fetchZhihuHot,
  fetchGoldPrice,
  fetchFuelPrice,
  fetchExchangeRate,
  fetchMaoyanMovies,
  fetchDoubanMovie,
  fetchDoubanTv,
  fetchDoubanShow,
  type DoubanItem,
} from '../world60s/api'

type Tab = 'news' | 'trending' | 'utility'

// ── 卡片 Hook：每个卡片独立请求 ──────────────────────────────────

function useCard<T>(fetcher: () => Promise<T | null>): {
  data: T | null
  loading: boolean
  error: boolean
} {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: boolean
  }>({ data: null, loading: true, error: false })
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    let cancelled = false
    fetcher()
      .then((data) => {
        if (cancelled) return
        setState({ data, loading: false, error: data == null })
        fetchedRef.current = true
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, loading: false, error: true })
      })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}

function openUrl(url: string): void {
  void Browser.open({ url })
}

// ── 资讯 Cards ────────────────────────────────────────────────────

function Day60sCard() {
  const { data, loading, error } = useCard(fetchDay60s)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">加载失败</div>
  if (!data.image) return null
  return (
    <div className="w60-card">
      <img className="w60-card__image" src={data.image} alt="每天60秒读懂世界" />
    </div>
  )
}

function HistoryCard() {
  const { data, loading, error } = useCard(fetchTodayInHistory)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">加载失败</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">历史上的今天</span>
        <span className="w60-card__meta">{data.month}月{data.day}日</span>
      </div>
      <ul className="w60-card__list">
        {data.items.slice(0, 8).map((item, i) => (
          <li key={i} className="w60-card__item" onClick={() => openUrl(item.link)}>
            <span className="w60-card__year">{item.year}</span>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ItNewsCard() {
  const { data, loading, error } = useCard(fetchItNews)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">加载失败</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">实时IT资讯</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 6).map((item, i) => (
          <li key={i} className="w60-card__item" onClick={() => openUrl(item.link)}>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EpicCard() {
  const { data, loading, error } = useCard(fetchEpicFree)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">加载失败</div>
  const freeNow = data.filter((g) => g.is_free_now)
  const freeSoon = data.filter((g) => !g.is_free_now)
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">Epic每周免费游戏</span>
      </div>
      <div className="w60-epic-list">
        {freeNow.map((game) => (
          <div key={game.id} className="w60-epic-item" onClick={() => openUrl(game.link)}>
            <div className="w60-epic-info">
              <div className="w60-epic-name">{game.title}</div>
              <div className="w60-epic-desc">{game.description}</div>
              <div className="w60-epic-price">
                <span className="w60-epic-free">免费</span>
                <span className="w60-epic-original">{game.original_price_desc}</span>
              </div>
            </div>
          </div>
        ))}
        {freeSoon.map((game) => (
          <div key={game.id} className="w60-epic-item w60-epic-item--soon" onClick={() => openUrl(game.link)}>
            <div className="w60-epic-info">
              <div className="w60-epic-name">{game.title}</div>
              <div className="w60-epic-desc">{game.description}</div>
              <div className="w60-epic-price">
                <span className="w60-epic-soon">即将免费</span>
                <span className="w60-epic-original">{game.original_price_desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AiNewsCard() {
  const { data, loading, error } = useCard(fetchAiNews)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">加载失败</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">AI资讯快报</span>
        <span className="w60-card__meta">{data.date}</span>
      </div>
      <ul className="w60-card__list">
        {data.news.slice(0, 6).map((item, i) => (
          <li key={i} className="w60-card__item" onClick={() => openUrl(item.link)}>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── 热门 Cards ────────────────────────────────────────────────────

function BiliCard() {
  const { data, loading, error } = useCard(fetchBiliHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">哔哩哔哩热搜</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot" onClick={() => openUrl(item.link)}>
            <span className="w60-card__rank">{i + 1}</span>
            <span className="w60-card__hot-title">{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DouyinCard() {
  const { data, loading, error } = useCard(fetchDouyinHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">抖音热搜</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot" onClick={() => openUrl(item.link)}>
            <span className="w60-card__rank">{i + 1}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            {item.hot_value > 0 && (
              <span className="w60-card__hot-value">
                {item.hot_value >= 10000
                  ? `${(item.hot_value / 10000).toFixed(1)}万`
                  : item.hot_value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function QuarkCard() {
  const { data, loading, error } = useCard(fetchToutiaoHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">头条热搜榜</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot" onClick={() => openUrl(item.link)}>
            <span className="w60-card__rank">{i + 1}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            {item.hot_value > 0 && (
              <span className="w60-card__hot-value">
                {item.hot_value >= 10000
                  ? `${(item.hot_value / 10000).toFixed(1)}万`
                  : item.hot_value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function WeiboCard() {
  const { data, loading, error } = useCard(fetchWeiboHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">微博热搜</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot" onClick={() => openUrl(item.link)}>
            <span className="w60-card__rank">{i + 1}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            {item.hot_value > 0 && (
              <span className="w60-card__hot-value">
                {item.hot_value >= 10000
                  ? `${(item.hot_value / 10000).toFixed(1)}万`
                  : item.hot_value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ZhihuCard() {
  const { data, loading, error } = useCard(fetchZhihuHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">知乎话题榜</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot" onClick={() => openUrl(item.link)}>
            <span className="w60-card__rank">{i + 1}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            <span className="w60-card__hot-value">{item.hot_value_desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BaiduHotCard() {
  const { data, loading, error } = useCard(fetchBaiduHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">百度实时热搜</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot">
            <span className="w60-card__rank">{item.rank}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            <span className="w60-card__hot-value">{item.score_desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TiebaCard() {
  const { data, loading, error } = useCard(fetchTiebaHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">百度贴吧话题榜</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot">
            <span className="w60-card__rank">{item.rank}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            <span className="w60-card__hot-value">{item.score_desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function QuarkCard() {
  const { data, loading, error } = useCard(fetchQuarkHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">夸克热点</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot">
            <span className="w60-card__rank">{i + 1}</span>
            <span className="w60-card__hot-title">{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RednoteCard() {
  const { data, loading, error } = useCard(fetchRednoteHot)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">小红书热点</span>
      </div>
      <ul className="w60-card__list">
        {data.slice(0, 10).map((item, i) => (
          <li key={i} className="w60-card__hot" onClick={() => openUrl(item.link)}>
            <span className="w60-card__rank">{item.rank}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            <span className="w60-card__hot-value">{item.score}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── 实用 Cards ────────────────────────────────────────────────────

function GoldCard() {
  const { data, loading, error } = useCard(fetchGoldPrice)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  const gold = data.metals[0]
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">黄金价格</span>
        <span className="w60-card__meta">{gold.updated}</span>
      </div>
      <div className="w60-card__detail">
        <div className="w60-card__price-big">{gold.sell_price} {gold.unit}</div>
        <div className="w60-card__change">
          今日 {gold.today_price} · 最高 {gold.high_price} · 最低 {gold.low_price}
        </div>
      </div>
    </div>
  )
}

function FuelCard() {
  const { data, loading, error } = useCard(fetchFuelPrice)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">汽油价格 · {data.region}</span>
      </div>
      <div className="w60-card__detail">
        {data.items.map((item) => (
          <div key={item.name} className="w60-card__fuel-row">
            <span className="w60-card__fuel-grade">{item.name}</span>
            <span className="w60-card__fuel-price">{item.price_desc}</span>
          </div>
        ))}
        {data.trend && (
          <div className="w60-card__fuel-trend">
            {data.trend.description}
          </div>
        )}
      </div>
    </div>
  )
}

function ExchangeCard() {
  const { data, loading, error } = useCard(fetchExchangeRate)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'HKD', 'KRW']
  const displayed = data.rates.filter((r) => currencies.includes(r.currency)).slice(0, 6)
  const names: Record<string, string> = {
    USD: '美元', EUR: '欧元', JPY: '日元',
    GBP: '英镑', HKD: '港币', KRW: '韩元',
  }
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">当日货币汇率</span>
        <span className="w60-card__meta">{data.updated}</span>
      </div>
      <div className="w60-card__detail">
        {displayed.map((item) => (
          <div key={item.currency} className="w60-card__exchange-row">
            <span className="w60-card__exchange-name">{names[item.currency] || item.currency}</span>
            <span className="w60-card__exchange-rate">{item.rate}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MaoyanCard() {
  const { data, loading, error } = useCard(fetchMaoyanMovies)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">猫眼全球票房总榜</span>
      </div>
      <ul className="w60-card__list">
        {data.list.slice(0, 10).map((item) => (
          <li key={item.maoyan_id} className="w60-card__hot">
            <span className="w60-card__rank">{item.rank}</span>
            <span className="w60-card__hot-title">{item.movie_name}</span>
            <span className="w60-card__hot-value">{item.box_office_desc}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DoubanCard({ title, fetcher }: { title: string; fetcher: () => Promise<DoubanItem[] | null> }) {
  const { data, loading, error } = useCard(fetcher)
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error || !data) return <div className="w60-card w60-card--error">暂无数据</div>
  return (
    <div className="w60-card">
      <div className="w60-card__header">
        <span className="w60-card__title">{title}</span>
      </div>
      <div className="w60-card__movie-grid">
        {data.slice(0, 6).map((item) => (
          <div key={item.id} className="w60-card__movie" onClick={() => openUrl(item.url)}>
            <img className="w60-card__movie-cover" src={item.cover_proxy || item.cover} alt={item.title} />
            <div className="w60-card__movie-title">{item.title}</div>
            <div className="w60-card__movie-score">{item.rating}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tab Content ───────────────────────────────────────────────────

function NewsTab() {
  return (
    <div className="w60-tab-content">
      <Day60sCard />
      <HistoryCard />
      <ItNewsCard />
      <EpicCard />
      <AiNewsCard />
    </div>
  )
}

function TrendingTab() {
  return (
    <div className="w60-tab-content">
      <BiliCard />
      <DouyinCard />
      <QuarkCard />
      <ToutiaoCard />
      <BaiduHotCard />
      <TiebaCard />
      <WeiboCard />
      <RednoteCard />
      <ZhihuCard />
    </div>
  )
}

function UtilityTab() {
  return (
    <div className="w60-tab-content">
      <GoldCard />
      <FuelCard />
      <ExchangeCard />
      <MaoyanCard />
      <DoubanCard title="豆瓣口碑电影榜" fetcher={fetchDoubanMovie} />
      <DoubanCard title="豆瓣口碑剧集榜" fetcher={fetchDoubanTv} />
      <DoubanCard title="豆瓣口碑综艺榜" fetcher={fetchDoubanShow} />
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'news', label: '资讯' },
  { key: 'trending', label: '热门' },
  { key: 'utility', label: '实用' },
]

export function World60sPage() {
  const [tab, setTab] = useState<Tab>('news')

  const handleCredits = (): void => {
    openUrl('https://github.com/vikiboss/60s')
  }

  return (
    <ScreenShell
      title="60s知世界"
      headerRight={
        <button type="button" className="icon-btn" onClick={handleCredits}>
          <span className="icon-btn__text">致谢</span>
        </button>
      }
    >
      <div className="w60-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`w60-tab ${tab === t.key ? 'w60-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'news' && <NewsTab />}
      {tab === 'trending' && <TrendingTab />}
      {tab === 'utility' && <UtilityTab />}
    </ScreenShell>
  )
}
