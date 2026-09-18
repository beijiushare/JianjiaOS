import { useCallback, useRef, useState } from 'react'

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)
  const lastDist = useRef(0)
  const lastPos = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  const getDist = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.hypot(dx, dy)
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastDist.current = getDist(e.touches)
    } else if (e.touches.length === 1 && scale > 1) {
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      isDragging.current = true
    }
  }, [scale])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = getDist(e.touches)
      const ratio = dist / lastDist.current
      lastDist.current = dist
      setScale((s) => Math.min(Math.max(s * ratio, 1), 4))
    } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
      e.preventDefault()
      const dx = e.touches[0].clientX - lastPos.current.x
      const dy = e.touches[0].clientY - lastPos.current.y
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }))
    }
  }, [scale])

  const onTouchEnd = useCallback(() => {
    isDragging.current = false
  }, [])

  const onDoubleClick = useCallback(() => {
    setScale((s) => (s > 1 ? 1 : 2))
    setTranslate({ x: 0, y: 0 })
  }, [])

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', touchAction: scale > 1 ? 'none' : 'pan-y' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onDoubleClick={onDoubleClick}
    >
      {!loaded && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          paddingBottom: '133%',
          background: 'var(--color-background-secondary)',
          color: 'var(--color-text-secondary)',
          fontSize: 13,
          position: 'relative',
        }}>
          <span style={{ position: 'absolute', top: '50%' }}>图片加载中</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{
          display: loaded ? 'block' : 'none',
          width: '100%',
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: scale === 1 ? 'transform 0.2s' : undefined,
        }}
      />
      {scale === 1 && loaded && (
        <span style={{
          position: 'absolute',
          top: 38,
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
