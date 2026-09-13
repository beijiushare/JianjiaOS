interface BadgeProps {
  count: number
}

/** 未读数角标。超过两位时收敛为 99+，避免撑宽 */
export function Badge({ count }: BadgeProps) {
  return (
    <span className="badge">{count > 99 ? '99+' : String(count)}</span>
  )
}
