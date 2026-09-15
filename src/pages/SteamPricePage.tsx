import { useEffect, useState } from 'react'

import AddIcon from '@/assets/icons/add-line.svg?react'
import { ScreenShell } from '@/components/ScreenShell'
import { showToast } from '@/components/toastStore'
import { AddGameDialog } from '@/components/steam/AddGameDialog'
import { GameCard } from '@/components/steam/GameCard'

import { checkAndNotify } from '../steam-price/bridge'
import { useSteamPriceStore } from '../steam-price/store'
import { fetchSteamPrice, fetchSteamDetail, fetchSteamScreenshots } from '../steam-price/api'

export function SteamPricePage() {
  const games = useSteamPriceStore((s) => s.games)
  const addGame = useSteamPriceStore((s) => s.addGame)
  const removeGame = useSteamPriceStore((s) => s.removeGame)
  const updateGame = useSteamPriceStore((s) => s.updateGame)

  const [showAdd, setShowAdd] = useState(false)
  const [appIdInput, setAppIdInput] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [prices, setPrices] = useState<
    Record<string, { currentCents: number; current: string; original: string; discount: number }>
  >({})

  // 查询所有游戏的价格、名字、截图
  useEffect(() => {
    let cancelled = false
    for (const game of games) {
      if (prices[game.appId] || loading[game.appId]) continue

      setLoading((prev) => ({ ...prev, [game.appId]: true }))
      Promise.all([
        fetchSteamPrice(game.appId),
        fetchSteamDetail(game.appId),
        fetchSteamScreenshots(game.appId),
      ])
        .then(([priceData, detailData, ssData]) => {
          if (cancelled) return
          if (detailData.success && detailData.data) {
            updateGame(game.appId, { name: detailData.data.name })
          }
          if (ssData.success && ssData.data?.screenshots?.length) {
            updateGame(game.appId, { image: ssData.data.screenshots[0].path_full })
          }
          if (priceData.success && priceData.data?.price_overview) {
            const p = priceData.data.price_overview
            const entry = {
              currentCents: p.final,
              current: p.final_formatted,
              original:
                p.discount_percent > 0
                  ? p.initial_formatted
                  : `¥ ${(p.initial / 100).toFixed(2)}`,
              discount: p.discount_percent,
            }
            setPrices((prev) => ({ ...prev, [game.appId]: entry }))
            checkAndNotify({ [game.appId]: { ...entry, appId: game.appId, name: game.name ?? game.appId } })
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading((prev) => ({ ...prev, [game.appId]: false }))
        })
    }
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games])

  const handleAdd = () => {
    const id = appIdInput.trim()
    const target = parseFloat(targetInput)
    if (!id || Number.isNaN(target)) {
      showToast('请填写完整')
      return
    }
    if (games.some((g) => g.appId === id)) {
      showToast('已存在')
      return
    }
    addGame(id, target)
    setAppIdInput('')
    setTargetInput('')
    setShowAdd(false)
  }

  return (
    <ScreenShell
      title="Steam 价格追踪"
      headerClassName="screen-header--steam"
      bodyClassName="screen-body--steam"
      headerRight={
        <button
          type="button"
          className="icon-btn"
          aria-label="添加游戏"
          onClick={() => setShowAdd(true)}
        >
          <AddIcon className="icon-btn__icon" />
        </button>
      }
    >
      {showAdd && (
        <AddGameDialog
          appIdInput={appIdInput}
          targetInput={targetInput}
          onAppIdChange={setAppIdInput}
          onTargetChange={setTargetInput}
          onConfirm={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      <div className="steam-list">
        {games.length === 0 && (
          <div className="steam-empty">暂无追踪游戏，点击右上角 + 添加</div>
        )}

        {games.map((game) => (
          <GameCard
            key={game.appId}
            game={game}
            price={prices[game.appId]}
            loading={loading[game.appId]}
            onDelete={() => removeGame(game.appId)}
          />
        ))}
      </div>
    </ScreenShell>
  )
}
