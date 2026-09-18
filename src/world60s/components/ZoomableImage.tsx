import { useCallback, useRef, useState } from 'react'

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1)
  const lastDist = useRef(0)

  const getDist = (touches: TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.hypot(dx, dy)
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastDist.current = getDist(e.touches)
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return
    e.preventDefault()
    const dist = getDist(e.touches)
    const ratio = dist / lastDist.current
    lastDist.current = dist
    setScale((s) => Math.min(Math.max(s * ratio, 1), 4))
  }, [])

  const onDoubleClick = useCallback(() => {
    setScale((s) => (s > 1 ? 1 : 2))
  }, [])

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onDoubleClick={onDoubleClick}
    >
      <img
        src={src}
        alt={alt}
        style={{
          display: 'block',
          width: '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: scale === 1 ? 'transform 0.2s' : undefined,
        }}
      />
      {scale === 1 && (
        <span style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '3px 10px',
          borderRadius: 4,
          background: 'rgba(0,0,0,0.45)',
          fontSize: 11,
          color: '#fff',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          双指捏合可放大图片
        </span>
      )}
    </div>
  )
}
