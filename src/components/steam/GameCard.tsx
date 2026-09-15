import DeleteIcon from '@/assets/icons/delete-bin-line.svg?react'

import type { Game } from '../../steam-price/types'
import { formatPrice } from '../../steam-price/api'

interface GameCardProps {
  game: Game
  price?: {
    currentCents: number
    current: string
    original: string
    discount: number
  }
  loading?: boolean
  onDelete: () => void
}

export function GameCard({ game, price, loading, onDelete }: GameCardProps) {
  const isCheap = price ? price.currentCents / 100 <= game.targetPrice : false

  return (
    <div className="steam-card">
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
          {loading && <span className="steam-card__loading">加载中…</span>}
          {price && (
            <>
              <span className="steam-price__row">
                原始价格：<span>{price.original}</span>
              </span>
              <span className="steam-price__row">
                现在价格：
                <span className={isCheap ? 'steam-price--green' : ''}>
                  {price.current}
                  {price.discount > 0 && ` (-${price.discount}%)`}
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
        onClick={onDelete}
      >
        <DeleteIcon />
      </button>
    </div>
  )
}
