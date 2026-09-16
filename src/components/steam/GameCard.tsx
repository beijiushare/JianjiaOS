import DeleteIcon from '@/assets/icons/delete-bin-line.svg?react'

import type { Game } from '../../steam-price/types'

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
            <span className="steam-price__label">原价:</span>
            <span className="steam-price__value">{price?.original ?? '—'}</span>
            {'  '}
            <span className="steam-price__label">现价:</span>
            <span className="steam-price__value">{price?.current ?? '—'}</span>
            {'  '}
            <span className="steam-price__label">折扣:</span>
            <span className="steam-price__value">{price?.discount ?? 0}%</span>
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
