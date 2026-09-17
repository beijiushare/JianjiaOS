import { useCard } from '../hooks/useCard'
import { CardShell } from './CardShell'
import {
  fetchGoldPrice,
  fetchFuelPrice,
  fetchExchangeRate,
  fetchMaoyanMovies,
  fetchDoubanMovie,
  fetchDoubanTv,
  fetchDoubanShow,
  type DoubanItem,
} from '../api'
import { Browser } from '@capacitor/browser'

function openUrl(url: string): void {
  void Browser.open({ url })
}

export function GoldCard() {
  const { data, loading, error } = useCard(fetchGoldPrice)
  if (loading || error || !data) return <CardShell loading={loading} error={error}>{null}</CardShell>
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

export function FuelCard() {
  const { data, loading, error } = useCard(fetchFuelPrice)
  return (
    <CardShell loading={loading} error={error || !data}>
      <div className="w60-card__header">
        <span className="w60-card__title">汽油价格 · {data?.region}</span>
      </div>
      <div className="w60-card__detail">
        {data?.items.map((item) => (
          <div key={item.name} className="w60-card__fuel-row">
            <span className="w60-card__fuel-grade">{item.name}</span>
            <span className="w60-card__fuel-price">{item.price_desc}</span>
          </div>
        ))}
        {data?.trend && (
          <div className="w60-card__fuel-trend">{data.trend.description}</div>
        )}
      </div>
    </CardShell>
  )
}

export function ExchangeCard() {
  const { data, loading, error } = useCard(fetchExchangeRate)
  if (loading || error || !data) return <CardShell loading={loading} error={error}>{null}</CardShell>
  const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'HKD', 'KRW']
  const names: Record<string, string> = {
    USD: '美元', EUR: '欧元', JPY: '日元',
    GBP: '英镑', HKD: '港币', KRW: '韩元',
  }
  const displayed = data.rates.filter((r) => currencies.includes(r.currency)).slice(0, 6)
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

export function MaoyanCard() {
  const { data, loading, error } = useCard(fetchMaoyanMovies)
  return (
    <CardShell loading={loading} error={error || !data}>
      <div className="w60-card__header">
        <span className="w60-card__title">猫眼全球票房总榜</span>
      </div>
      <ul className="w60-card__list">
        {data?.list.slice(0, 10).map((item) => (
          <li key={item.maoyan_id} className="w60-card__hot">
            <span className="w60-card__rank">{item.rank}</span>
            <span className="w60-card__hot-title">{item.movie_name}</span>
            <span className="w60-card__hot-value">{item.box_office_desc}</span>
          </li>
        ))}
      </ul>
    </CardShell>
  )
}

function DoubanCard({ title, fetcher }: { title: string; fetcher: () => Promise<DoubanItem[] | null> }) {
  const { data, loading, error } = useCard(fetcher)
  return (
    <CardShell loading={loading} error={error || !data}>
      <div className="w60-card__header">
        <span className="w60-card__title">{title}</span>
      </div>
      <div className="w60-card__movie-grid">
        {data?.slice(0, 6).map((item) => (
          <div key={item.id} className="w60-card__movie" onClick={() => openUrl(item.url)}>
            <img className="w60-card__movie-cover" src={item.cover_proxy || item.cover} alt={item.title} />
            <div className="w60-card__movie-title">{item.title}</div>
            <div className="w60-card__movie-score">{item.rating}</div>
          </div>
        ))}
      </div>
    </CardShell>
  )
}

export function DoubanMovieCard() {
  return <DoubanCard title="豆瓣口碑电影榜" fetcher={fetchDoubanMovie} />
}

export function DoubanTvCard() {
  return <DoubanCard title="豆瓣口碑剧集榜" fetcher={fetchDoubanTv} />
}

export function DoubanShowCard() {
  return <DoubanCard title="豆瓣口碑综艺榜" fetcher={fetchDoubanShow} />
}
