import { useEffect, useRef, useState } from 'react'

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)
  const scaleRef = useRef(1)
  const translateRef = useRef({ x: 0, y: 0 })
  const lastDist = useRef(0)
  const lastPos = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const clampTranslate = (x: number, y: number, s: number) => {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img) return { x: 0, y: 0 }

    const cw = container.clientWidth
    const ch = container.clientHeight
    const iw = img.naturalWidth || cw
    const ih = img.naturalHeight || ch

    if (iw === 0 || ih === 0) return { x: 0, y: 0 }

    const scaledW = Math.max(cw, iw * s)
    const scaledH = Math.max(ch, ih * s)

    const maxX = Math.max(0, (scaledW - cw) / 2)
    const maxY = Math.max(0, (scaledH - ch) / 2)

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const getDist = (touches: TouchList): number => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.hypot(dx, dy)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastDist.current = getDist(e.touches)
      } else if (e.touches.length === 1 && scaleRef.current > 1) {
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        isDragging.current = true
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        const dist = getDist(e.touches)
        const ratio = dist / lastDist.current
        lastDist.current = dist
        const newScale = Math.min(Math.max(scaleRef.current * ratio, 1), 4)
        scaleRef.current = newScale
        const clamped = clampTranslate(translateRef.current.x, translateRef.current.y, newScale)
        translateRef.current = clamped
        setScale(newScale)
        setTranslate(clamped)
      } else if (e.touches.length === 1 && isDragging.current && scaleRef.current > 1) {
        e.preventDefault()
        const dx = e.touches[0].clientX - lastPos.current.x
        const dy = e.touches[0].clientY - lastPos.current.y
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        const newTranslate = clampTranslate(
          translateRef.current.x + dx,
          translateRef.current.y + dy,
          scaleRef.current,
        )
        translateRef.current = newTranslate
        setTranslate(newTranslate)
      }
    }

    const onTouchEnd = () => {
      isDragging.current = false
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const handleDoubleClick = () => {
    const newScale = scaleRef.current > 1 ? 1 : 2
    scaleRef.current = newScale
    translateRef.current = { x: 0, y: 0 }
    setScale(newScale)
    setTranslate({ x: 0, y: 0 })
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', overflow: 'hidden', touchAction: scale > 1 ? 'none' : 'pan-y' }}
      onDoubleClick={handleDoubleClick}
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
        ref={imgRef}
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
