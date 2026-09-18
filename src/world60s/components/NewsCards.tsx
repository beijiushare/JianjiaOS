import { useCard } from '../hooks/useCard'
import { CardShell } from './CardShell'
import { ZoomableImage } from './ZoomableImage'
import { fetchDay60s, fetchTodayInHistory, fetchItNews, fetchEpicFree, fetchAiNews } from '../api'
import { Browser } from '@capacitor/browser'

function openUrl(url: string): void {
  void Browser.open({ url })
}

export function Day60sCard() {
  const { data, loading, error } = useCard(fetchDay60s)
  if (loading || error || !data?.image) return null
  return (
    <div className="w60-card">
      <ZoomableImage key={data.image} src={data.image} alt="每天60秒读懂世界" />
    </div>
  )
}

export function HistoryCard() {
  const { data, loading, error } = useCard(fetchTodayInHistory)
  return (
    <CardShell title="历史上的今天" loading={loading} error={error || !data}>
      <div className="w60-card__header">
        <span className="w60-card__title">历史上的今天</span>
        <span className="w60-card__meta">{data?.month}月{data?.day}日</span>
      </div>
      <ul className="w60-card__list">
        {data?.items.slice(0, 8).map((item, i) => (
          <li key={i} className="w60-card__item" onClick={() => openUrl(item.link)}>
            <span className="w60-card__year">{item.year}</span>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </CardShell>
  )
}

export function ItNewsCard() {
  const { data, loading, error } = useCard(fetchItNews)
  return (
    <CardShell title="实时IT资讯" loading={loading} error={error || !data}>
      <div className="w60-card__header">
        <span className="w60-card__title">实时IT资讯</span>
      </div>
      <ul className="w60-card__list">
        {data?.slice(0, 6).map((item, i) => (
          <li key={i} className="w60-card__item" onClick={() => openUrl(item.link)}>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </CardShell>
  )
}

export function EpicCard() {
  const { data, loading, error } = useCard(fetchEpicFree)
  return (
    <CardShell title="Epic每周免费游戏" loading={loading} error={error || !data}>
      <div className="w60-card__header">
        <span className="w60-card__title">Epic每周免费游戏</span>
      </div>
      <div className="w60-epic-list">
        {data?.filter((g) => g.is_free_now).map((game) => (
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
        {data?.filter((g) => !g.is_free_now).map((game) => (
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
    </CardShell>
  )
}

export function AiNewsCard() {
  const { data, loading, error } = useCard(fetchAiNews)
  return (
    <CardShell title="AI资讯快报" loading={loading} error={error || !data}>
      <div className="w60-card__header">
        <span className="w60-card__title">AI资讯快报</span>
        <span className="w60-card__meta">{data?.date}</span>
      </div>
      <ul className="w60-card__list">
        {data?.news.slice(0, 6).map((item, i) => (
          <li key={i} className="w60-card__item" onClick={() => openUrl(item.link)}>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </CardShell>
  )
}
