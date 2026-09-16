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
            原价:{price?.original ?? '—'}  现价:{price?.current ?? '—'}  折扣:{price?.discount ?? 0}%
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
