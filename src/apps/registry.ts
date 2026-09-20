import type { ComponentType } from 'react'

import AlarmIcon from '@/assets/icons/alarm-line.svg?react'
import BookmarkIcon from '@/assets/icons/bookmark-line.svg?react'
import SettingsIcon from '@/assets/icons/settings-3-line.svg?react'
import SteamIcon from '@/assets/icons/steam.svg?react'
import type { DrawerId, PageId } from '@/nav/types'

/** 应用的入口 —— 点击后要做什么 */
export type AppEntry =
  | { kind: 'push'; page: PageId }
  | { kind: 'drawer'; drawer: DrawerId }

export interface AppInfo {
  id: string
  /** 展示名，同时用于搜索匹配 */
  name: string
  /** 分组名 */
  group: string
  /** RemixIcon 图标组件（通过 svgr 导入的 svg） */
  icon: ComponentType<{ className?: string }>
  entry: AppEntry
}

/**
 * 应用注册表。
 *
 * 应用抽屉的网格与主屏搜索都读这一份数据 —— 新增应用只需往数组里加一项，
 * 两处同时生效，不需要改任何 UI 代码。
 */
export const APP_REGISTRY: AppInfo[] = [
  {
    id: 'settings',
    name: '设置',
    group: '系统',
    icon: SettingsIcon,
    entry: { kind: 'push', page: 'settings' },
  },
  {
    id: 'steamPrice',
    name: 'Steam Price',
    group: '工具',
    icon: SteamIcon,
    entry: { kind: 'push', page: 'steamPrice' },
  },
  {
    id: 'entries',
    name: '集锦',
    group: '信息',
    icon: BookmarkIcon,
    entry: { kind: 'push', page: 'entries' },
  },
  {
    id: 'world60s',
    name: '60s知世界',
    group: '信息',
    icon: AlarmIcon,
    entry: { kind: 'push', page: 'world60s' },
  },
]
