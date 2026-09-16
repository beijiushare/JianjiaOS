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
  onDelete: () => void
}

export function GameCard({ game, price, onDelete }: GameCardProps) {
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
          <span className="steam-price__row">
            原价：<span>{price?.original ?? '—'}</span>
            {price && price.discount > 0 && (
              <span className="steam-price--green"> -{price.discount}%</span>
            )}
          </span>
          <span className="steam-price__row">
            现价：
            <span className={isCheap ? 'steam-price--green' : ''}>
              {price?.current ?? '—'}
            </span>
          </span>
          <span className="steam-price__row">
            目标：<span>{formatPrice(game.targetPrice * 100)}</span>
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
