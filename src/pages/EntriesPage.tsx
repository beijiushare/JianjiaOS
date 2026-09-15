import { useMemo, useState } from 'react'

import ChevronIcon from '@/assets/icons/arrow-right-s-line.svg?react'
import { ScreenShell } from '@/components/ScreenShell'
import { creditGroups, entries } from '@/entries/data'

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

      <div className="entries-credits">
        <h2 className="entries-credits__title">开源与致谢</h2>
        {creditGroups.map((group) => (
          <div key={group.title} className="entries-credits__group">
            <div className="entries-credits__group-title">{group.title}</div>
            <div className="entries-credits__list">
              {group.items.map((item) => (
                <a
                  key={item.url}
                  className="entries-credits__link"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                  <ChevronIcon className="entries-credits__chevron" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
