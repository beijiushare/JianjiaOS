import { ScreenShell } from '@/components/ScreenShell'

export function SteamPriceAboutPage() {
  return (
    <ScreenShell title="关于">
      <div style={{ padding: '1rem', fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-text)' }}>
        <p style={{ margin: '0 0 1rem' }}>
          Steam Price 功能通过查询 Steam 官方 API 获取游戏的价格信息，包括当前价格、原价和折扣幅度。
        </p>
        <p style={{ margin: '0 0 1rem' }}>
          由于 Steam API 在大陆访问不稳定，本功能使用 Cloudflare Workers 搭建了反向代理服务。反代服务本身不存储任何数据，所有价格信息均实时来自 Steam 官方接口。
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          感谢 Cloudflare 提供的免费额度！
        </p>
      </div>
    </ScreenShell>
  )
}
