import { useMemo, useState } from 'react'

import { ScreenShell } from '@/components/ScreenShell'
import { entries } from '@/entries/data'

export function EntriesPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return entries
    const q = query.toLowerCase()
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <ScreenShell
      title="集锦"
      headerClassName="screen-header--entries"
      bodyClassName="screen-body--entries"
    >
      <input
        className="entries-search"
        type="text"
        placeholder="搜索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="entries-list">
        {filtered.length === 0 && (
          <div className="entries-empty">无匹配结果</div>
        )}

        {filtered.map((entry) => (
          <a
            key={entry.url}
            className="entries-item"
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="entries-item__name">{entry.name}</span>
            <span className="entries-item__desc">{entry.description}</span>
          </a>
        ))}
      </div>
    </ScreenShell>
  )
}
