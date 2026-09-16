import { useEffect, useState } from 'react'

import AddIcon from '@/assets/icons/add-line.svg?react'
import { ScreenShell } from '@/components/ScreenShell'
import { showToast } from '@/components/toastStore'
import { AddGameDialog } from '@/components/steam/AddGameDialog'
import { GameCard } from '@/components/steam/GameCard'

import { useSteamPriceStore } from '../steam-price/store'
import { fetchSteamPrice, fetchSteamDetail } from '../steam-price/api'
import type { SteamPriceResponse, SteamAppDetailResponse } from '../steam-price/types'

export function SteamPricePage() {
  const games = useSteamPriceStore((s) => s.games)
  const addGame = useSteamPriceStore((s) => s.addGame)
  const removeGame = useSteamPriceStore((s) => s.removeGame)
  const updateGame = useSteamPriceStore((s) => s.updateGame)

  const [showAdd, setShowAdd] = useState(false)
  const [appIdInput, setAppIdInput] = useState('')
  const [prices, setPrices] = useState<
    Record<string, { currentCents: number; current: string; original: string; discount: number }>
  >({})

  useEffect(() => {
    let cancelled = false
    for (const game of games) {
      if (prices[game.appId]) continue

      Promise.all([
        fetchSteamPrice(game.appId),
        fetchSteamDetail(game.appId),
      ])
        .then(([priceData, detailData]) => {
          if (cancelled) return
          const priceResult = (priceData as unknown as Record<string, SteamPriceResponse>)[game.appId]
          const detailResult = (detailData as unknown as Record<string, SteamAppDetailResponse>)[game.appId]
          if (detailResult?.success && detailResult.data) {
            updateGame(game.appId, { name: detailResult.data.name })
          }
          if (priceResult?.success && priceResult.data?.price_overview) {
            const p = priceResult.data.price_overview
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
          }
        })
        .catch((e) => { console.error('[steam-price]', e) })
    }
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games])

  const handleAdd = () => {
    const id = appIdInput.trim()
    if (!id) {
      showToast('请填写 App ID')
      return
    }
    if (games.some((g) => g.appId === id)) {
      showToast('已存在')
      return
    }
    addGame(id)
    updateGame(id, {
      image: `https://shared.st.dl.eccdnx.com/store_item_assets/steam/apps/${id}/header.jpg`,
    })
    setAppIdInput('')
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
          onAppIdChange={setAppIdInput}
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
            onDelete={() => removeGame(game.appId)}
          />
        ))}
      </div>
    </ScreenShell>
  )
}
