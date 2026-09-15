import ChevronIcon from '@/assets/icons/arrow-right-s-line.svg?react'
import { ScreenShell } from '@/components/ScreenShell'
import { credits } from '@/entries/data'

export function CreditsPage() {
  return (
    <ScreenShell title="致谢" bodyClassName="screen-body--muted">
      <section className="list-group">
        <div className="list-group__body">
          {credits.map((item) => (
            <a
              key={item.url}
              className="settings-credits__link"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.name}
              <ChevronIcon className="settings-credits__chevron" />
            </a>
          ))}
        </div>
      </section>
    </ScreenShell>
  )
}
