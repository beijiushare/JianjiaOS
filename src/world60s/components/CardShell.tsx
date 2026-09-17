import type { ReactNode } from 'react'

interface CardShellProps {
  loading: boolean
  error: boolean
  children: ReactNode
}

export function CardShell({ loading, error, children }: CardShellProps) {
  if (loading) return <div className="w60-card w60-card--loading">加载中…</div>
  if (error) return <div className="w60-card w60-card--error">暂无数据</div>
  return <div className="w60-card">{children}</div>
}
