import type { ReactNode } from 'react'

interface CardShellProps {
  title?: string
  loading: boolean
  error: boolean
  children: ReactNode
}

export function CardShell({ title, loading, error, children }: CardShellProps) {
  if (loading || error) {
    return (
      <div className="w60-card">
        {title && (
          <div className="w60-card__header">
            <span className="w60-card__title">{title}</span>
          </div>
        )}
        <div className={loading ? 'w60-card--loading' : 'w60-card--error'}>
          {loading ? '加载中…' : '暂无数据'}
        </div>
      </div>
    )
  }
  return <div className="w60-card">{children}</div>
}
