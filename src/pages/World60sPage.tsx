import { useState } from 'react'

import { ScreenShell } from '@/components/ScreenShell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavStore } from '../nav/store'

import {
  fetchBiliHot,
  fetchDouyinHot,
  fetchToutiaoHot,
  fetchQuarkHot,
  fetchBaiduHot,
  fetchTiebaHot,
  fetchWeiboHot,
  fetchRednoteHot,
  fetchZhihuHot,
} from '../world60s/api'

import { HotListCard } from '../world60s/components/HotListCard'
import { Day60sCard, HistoryCard, ItNewsCard, EpicCard, AiNewsCard } from '../world60s/components/NewsCards'
import { GoldCard, FuelCard, ExchangeCard, MaoyanCard, DoubanMovieCard, DoubanTvCard, DoubanShowCard } from '../world60s/components/UtilityCards'

type Tab = 'news' | 'trending' | 'utility'

// ── Tab Content ───────────────────────────────────────────────────

function NewsTab() {
  return (
    <div className="w60-tab-content">
      <Day60sCard />
      <HistoryCard />
      <ItNewsCard />
      <EpicCard />
      <AiNewsCard />
    </div>
  )
}

function TrendingTab() {
  return (
    <div className="w60-tab-content">
      <HotListCard title="哔哩哔哩热搜" fetcher={fetchBiliHot} />
      <HotListCard title="抖音热搜" fetcher={fetchDouyinHot} valueField="hot_value" />
      <HotListCard title="夸克热点" fetcher={fetchQuarkHot} onClick={false} />
      <HotListCard title="头条热搜榜" fetcher={fetchToutiaoHot} valueField="hot_value" />
      <HotListCard title="百度实时热搜" fetcher={fetchBaiduHot} useRank valueField="score_desc" onClick={false} />
      <HotListCard title="百度贴吧话题榜" fetcher={fetchTiebaHot} useRank valueField="score_desc" onClick={false} />
      <HotListCard title="微博热搜" fetcher={fetchWeiboHot} valueField="hot_value" />
      <HotListCard title="小红书热点" fetcher={fetchRednoteHot} useRank valueField="score" />
      <HotListCard title="知乎话题榜" fetcher={fetchZhihuHot} valueField="score_desc" />
    </div>
  )
}

function UtilityTab() {
  return (
    <div className="w60-tab-content">
      <GoldCard />
      <FuelCard />
      <ExchangeCard />
      <MaoyanCard />
      <DoubanMovieCard />
      <DoubanTvCard />
      <DoubanShowCard />
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'news', label: '资讯' },
  { key: 'trending', label: '热门' },
  { key: 'utility', label: '实用' },
]

export function World60sPage() {
  const [tab, setTab] = useState<Tab>('news')
  const push = useNavStore((s) => s.push)

  return (
    <ScreenShell
      title="60s知世界"
      bodyClassName="screen-body--w60"
      headerRight={
        <button type="button" className="icon-btn" onClick={() => push('world60sAbout')}>
          <span className="icon-btn__text">致谢</span>
        </button>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="w60-tabs">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="w60-tab">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="news">
          <NewsTab />
        </TabsContent>
        <TabsContent value="trending">
          <TrendingTab />
        </TabsContent>
        <TabsContent value="utility">
          <UtilityTab />
        </TabsContent>
      </Tabs>
    </ScreenShell>
  )
}
