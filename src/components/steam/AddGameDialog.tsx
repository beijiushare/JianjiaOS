import { useEffect, useRef } from 'react'

interface AddGameDialogProps {
  appIdInput: string
  onAppIdChange: (value: string) => void
  onConfirm: () => void
  onClose: () => void
}

export function AddGameDialog({
  appIdInput,
  onAppIdChange,
  onConfirm,
  onClose,
}: AddGameDialogProps) {
  const appIdRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    appIdRef.current?.focus()
  }, [])

  return (
    <div className="steam-dialog-mask" onClick={onClose}>
      <div className="steam-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="steam-dialog__title">添加游戏</h3>
        <input
          ref={appIdRef}
          type="text"
          className="steam-dialog__input"
          placeholder="Steam 游戏 ID"
          value={appIdInput}
          onChange={(e) => onAppIdChange(e.target.value)}
        />
        <div className="steam-dialog__actions">
          <button
            type="button"
            className="steam-dialog__btn steam-dialog__btn--cancel"
            onClick={onClose}
          >
            取消
          </button>
          <button
            type="button"
            className="steam-dialog__btn steam-dialog__btn--confirm"
            onClick={onConfirm}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}
