import { ScreenShell } from '@/components/ScreenShell'

const INSTANCES = [
  '60s.crystelf.top',
  'api.elysiayanyu.top',
  '60s.7se.cn',
  '60s.mizhoubaobei.top',
  'api.cczo.cc/60s',
  '60s.zellon.top',
  '60s.superjeason.qzz.io',
]

export function World60sAboutPage() {
  return (
    <ScreenShell title="致谢">
      <div style={{ padding: '1rem', fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-text)' }}>
        <p style={{ margin: '0 0 1rem' }}>
          API 来自
        </p>
        <p style={{ margin: '0 0 1rem' }}>
          <a
            href="https://github.com/dogxii/60s-web"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
          >
            dogxii/60s-web
          </a>
        </p>
        <p style={{ margin: '0 0 1rem' }}>
          感谢以下公共实例：
        </p>
        <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25rem' }}>
          {INSTANCES.map((instance) => (
            <li key={instance} style={{ margin: '0.25rem 0' }}>
              <a
                href={`https://${instance}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                {instance}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ScreenShell>
  )
}
