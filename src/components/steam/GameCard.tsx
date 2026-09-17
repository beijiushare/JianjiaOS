import { useState } from 'react'
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
  const [showConfirm, setShowConfirm] = useState(false)

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
        onClick={() => setShowConfirm(true)}
      >
        <DeleteIcon />
      </button>

      {showConfirm && (
        <div className="steam-confirm-mask" onClick={() => setShowConfirm(false)}>
          <div className="steam-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="steam-confirm-title">确认删除</div>
            <div className="steam-confirm-desc">确定要移除「{game.name ?? game.appId}」吗？</div>
            <div className="steam-confirm-actions">
              <button type="button" className="steam-confirm-btn steam-confirm-btn--cancel" onClick={() => setShowConfirm(false)}>取消</button>
              <button type="button" className="steam-confirm-btn steam-confirm-btn--danger" onClick={onDelete}>删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
