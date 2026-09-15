import { useEffect, useRef, useState } from 'react'

import { Capacitor } from '@capacitor/core'
import AddIcon from '@/assets/icons/add-line.svg?react'
import DeleteIcon from '@/assets/icons/delete-bin-line.svg?react'
import { ScreenShell } from '@/components/ScreenShell'
import { showToast } from '@/components/toastStore'

import { useSteamPriceStore } from '../steam-price/store'
import { checkAndNotify } from '../steam-price/bridge'
import type {
  SteamAppDetailResponse,
  SteamPriceResponse,
  SteamScreenshotsResponse,
} from '../steam-price/types'

const STEAM_API = Capacitor.isNativePlatform()
  ? 'https://store.steampowered.com/api/appdetails'
  : '/steam-api/api/appdetails'

async function fetchSteamPrice(appId: string): Promise<SteamPriceResponse> {
  const resp = await fetch(`${STEAM_API}?appids=${appId}&cc=CN&filters=price_overview`)
  return resp.json() as Promise<SteamPriceResponse>
}

async function fetchSteamDetail(appId: string): Promise<SteamAppDetailResponse> {
  const resp = await fetch(`${STEAM_API}?appids=${appId}&cc=CN`)
  return resp.json() as Promise<SteamAppDetailResponse>
}

async function fetchSteamScreenshots(appId: string): Promise<SteamScreenshotsResponse> {
  const resp = await fetch(`${STEAM_API}?appids=${appId}&cc=CN&filters=screenshots`)
  return resp.json() as Promise<SteamScreenshotsResponse>
}

function formatPrice(cents: number): string {
  return `¥ ${(cents / 100).toFixed(2)}`
}

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

  const appIdRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showAdd) appIdRef.current?.focus()
  }, [showAdd])

  // 查询所有游戏的价格、名字、截图
  useEffect(() => {
    for (const game of games) {
      if (prices[game.appId] || loading[game.appId]) continue

      setLoading((prev) => ({ ...prev, [game.appId]: true }))
      Promise.all([
        fetchSteamPrice(game.appId),
        fetchSteamDetail(game.appId),
        fetchSteamScreenshots(game.appId),
      ])
        .then(([priceData, detailData, ssData]) => {
          // 名字
          if (detailData.success && detailData.data) {
            updateGame(game.appId, { name: detailData.data.name })
          }
          // 截图
          if (ssData.success && ssData.data?.screenshots?.length) {
            updateGame(game.appId, { image: ssData.data.screenshots[0].path_full })
          }
          // 价格
          if (priceData.success && priceData.data?.price_overview) {
            const p = priceData.data.price_overview
            const entry = {
              currentCents: p.final,
              current: p.final_formatted,
              original:
                p.discount_percent > 0
                  ? p.initial_formatted
                  : formatPrice(p.initial),
              discount: p.discount_percent,
            }
            setPrices((prev) => ({ ...prev, [game.appId]: entry }))
            // 检查达标并通知（传入刚拿到的价格，不等 state 更新）
            checkAndNotify({ [game.appId]: { ...entry, appId: game.appId, name: game.name ?? game.appId } })
          }
        })
        .catch(() => {})
        .finally(() => setLoading((prev) => ({ ...prev, [game.appId]: false })))
    }
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
    >
      {/* 右上角加号按钮 */}
      <button
        type="button"
        className="steam-add-btn"
        onClick={() => setShowAdd(true)}
      >
        <AddIcon className="steam-add-icon" />
      </button>

      {/* 添加弹窗 */}
      {showAdd && (
        <div className="steam-dialog-mask" onClick={() => setShowAdd(false)}>
          <div className="steam-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="steam-dialog__title">添加游戏</h3>
            <input
              ref={appIdRef}
              type="text"
              className="steam-dialog__input"
              placeholder="Steam 游戏 ID"
              value={appIdInput}
              onChange={(e) => setAppIdInput(e.target.value)}
            />
            <input
              type="number"
              className="steam-dialog__input"
              placeholder="目标价格（元）"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
            />
            <div className="steam-dialog__actions">
              <button
                type="button"
                className="steam-dialog__btn steam-dialog__btn--cancel"
                onClick={() => setShowAdd(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="steam-dialog__btn steam-dialog__btn--confirm"
                onClick={handleAdd}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 游戏列表 */}
      <div className="steam-list">
        {games.length === 0 && (
          <div className="steam-empty">暂无追踪游戏，点击右上角 + 添加</div>
        )}

        {games.map((game) => {
          const p = prices[game.appId]
          const isLoading = loading[game.appId]
          const isCheap = p ? p.currentCents / 100 <= game.targetPrice : false

          return (
            <div key={game.appId} className="steam-card">
              {game.image && (
                <img
                  className="steam-card__img"
                  src={game.image}
                  alt={game.name ?? game.appId}
                />
              )}
              <div className="steam-card__body">
                <div className="steam-card__name">
                  {game.name ?? game.appId}
                </div>
                <div className="steam-card__prices">
                  {isLoading && <span className="steam-card__loading">加载中…</span>}
                  {p && (
                    <>
                      <span className="steam-price__row">
                        原始价格：<span>{p.original}</span>
                      </span>
                      <span className="steam-price__row">
                        现在价格：
                        <span className={isCheap ? 'steam-price--green' : ''}>
                          {p.current}
                          {p.discount > 0 && ` (-${p.discount}%)`}
                        </span>
                      </span>
                    </>
                  )}
                  <span className="steam-price__row">
                    目标价格：<span>{formatPrice(game.targetPrice * 100)}</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="steam-card__delete"
                onClick={() => removeGame(game.appId)}
              >
                <DeleteIcon />
              </button>
            </div>
          )
        })}
      </div>
    </ScreenShell>
  )
}
