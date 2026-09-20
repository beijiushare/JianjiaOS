import { AboutContent } from '@/components/AboutContent'

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
    <AboutContent title="致谢">
      <p>API 来自</p>
      <p>
        <a
          href="https://github.com/dogxii/60s-web"
          target="_blank"
          rel="noopener noreferrer"
        >
          dogxii/60s-web
        </a>
      </p>
      <p>感谢以下公共实例：</p>
      <ul className="about-content__list">
        {INSTANCES.map((instance) => (
          <li key={instance}>
            <a
              href={`https://${instance}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {instance}
            </a>
          </li>
        ))}
      </ul>
    </AboutContent>
  )
}
