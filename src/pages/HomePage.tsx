import { useState } from 'react'

import { APP_REGISTRY, type AppInfo } from '@/apps/registry'
import { BottomBar } from '@/components/BottomBar'
import { GrokBot } from '@/components/grok-bot/GrokBot'
import { ListItem } from '@/components/ListItem'
import { SearchInput } from '@/components/SearchInput'
import { selectUnreadCount, useMessagesStore } from '@/messages/store'
import { useNavStore } from '@/nav/store'

/**
 * 主屏 · 应用搜索页。
 *
 * 布局：内容层（搜索框 + 未读提示 + 搜索结果） → 底部导航栏。
 * 主屏不占栈位，恒为底层；栈空等价于「位于主屏」。规格见设计文档 §4.1。
 */
export function HomePage() {
  const [query, setQuery] = useState('')
  // 未读数由 messages 派生，不单独存储
  const unreadCount = useMessagesStore(selectUnreadCount)
  const push = useNavStore((s) => s.push)

  const keyword = query.trim().toLowerCase()
  const results: AppInfo[] =
    keyword === ''
      ? []
      : APP_REGISTRY.filter((a) => a.name.toLowerCase().includes(keyword))

  const openApp = (app: AppInfo): void => {
    if (app.entry.kind === 'push') push(app.entry.page)
  }

  return (
    <div className="screen screen--home">
      <div className="home-body">
        <div className="home-content">
          <GrokBot />

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="搜索应用"
          />

          {keyword === '' ? (
            <button
              type="button"
              className="home-unread"
              onClick={() => push('messages', 'left')}
            >
              {unreadCount > 0 ? `${unreadCount} 条未读消息` : '没有未读消息'}
            </button>
          ) : results.length === 0 ? (
            <p className="home-empty">没找到「{query}」</p>
          ) : (
            <div className="list-group">
              <div className="list-group__body">
                {results.map((app) => {
                  const Icon = app.icon
                  return (
                    <ListItem
                      key={app.id}
                      icon={<Icon />}
                      title={app.name}
                      chevron
                      onClick={() => openApp(app)}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomBar />
    </div>
  )
}
