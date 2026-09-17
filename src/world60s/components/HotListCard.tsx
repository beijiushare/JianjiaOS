import { useCard } from '../hooks/useCard'
import { CardShell } from './CardShell'
import { Browser } from '@capacitor/browser'

function openUrl(url: string): void {
  void Browser.open({ url })
}

function formatHotValue(v: number): string {
  return v >= 10000 ? `${(v / 10000).toFixed(1)}万` : String(v)
}

interface HotItem {
  title: string
  link?: string
  hot_value?: number
  score_desc?: string
  score?: string | number
  rank?: number
}

interface HotListCardProps {
  title: string
  fetcher: () => Promise<HotItem[] | null>
  /** 取 rank 字段作为排序号（百度/贴吧/小红书有 rank） */
  useRank?: boolean
  /** 显示热度值的方式 */
  valueField?: 'hot_value' | 'score_desc' | 'score' | null
  /** 点击跳转：false=不跳转, true=用 link, 函数=自定义 */
  onClick?: false | true | ((item: HotItem) => void)
}

export function HotListCard({
  title,
  fetcher,
  useRank = false,
  valueField = null,
  onClick = true,
}: HotListCardProps) {
  const { data, loading, error } = useCard(fetcher)

  const handleClick = (item: HotItem): void => {
    if (onClick === false) return
    if (onClick === true) {
      if (item.link) openUrl(item.link)
      return
    }
    onClick(item)
  }

  return (
    <CardShell loading={loading} error={error}>
      <div className="w60-card__header">
        <span className="w60-card__title">{title}</span>
      </div>
      <ul className="w60-card__list">
        {data?.slice(0, 10).map((item, i) => (
          <li
            key={i}
            className="w60-card__hot"
            onClick={() => handleClick(item)}
          >
            <span className="w60-card__rank">{useRank ? item.rank : i + 1}</span>
            <span className="w60-card__hot-title">{item.title}</span>
            {valueField === 'hot_value' && item.hot_value != null && item.hot_value > 0 && (
              <span className="w60-card__hot-value">{formatHotValue(item.hot_value)}</span>
            )}
            {valueField === 'score_desc' && item.score_desc && (
              <span className="w60-card__hot-value">{item.score_desc}</span>
            )}
            {valueField === 'score' && item.score != null && (
              <span className="w60-card__hot-value">{item.score}</span>
            )}
          </li>
        ))}
      </ul>
    </CardShell>
  )
}
