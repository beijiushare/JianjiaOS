import { useEffect, useState } from 'react'

import { ScreenShell } from '@/components/ScreenShell'

import { fetchDay60s, type Day60sData } from '../world60s/api'

export function World60sPage() {
  const [data, setData] = useState<Day60sData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchDay60s()
      .then((result) => {
        if (cancelled) return
        if (result) {
          setData(result)
        } else {
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <ScreenShell title="60s知世界">
      <div className="world60s">
        {loading && (
          <div className="world60s__status">加载中…</div>
        )}

        {error && (
          <div className="world60s__status">加载失败，请稍后再试</div>
        )}

        {data && (
          <>
            <div className="world60s__header">
              <span className="world60s__date">{data.date}</span>
              <span className="world60s__weekday">{data.day_of_week}</span>
              <span className="world60s__lunar">{data.lunar_date}</span>
            </div>

            {data.cover && (
              <img
                className="world60s__cover"
                src={data.cover}
                alt="封面"
              />
            )}

            <ul className="world60s__list">
              {data.news.map((item, i) => (
                <li key={i} className="world60s__item">{item}</li>
              ))}
            </ul>

            {data.tip && (
              <div className="world60s__tip">{data.tip}</div>
            )}
          </>
        )}
      </div>
    </ScreenShell>
  )
}
