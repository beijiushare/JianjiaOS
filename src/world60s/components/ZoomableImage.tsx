import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

const loadedImages = new Set<string>()

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(() => loadedImages.has(src))

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {!loaded && (
        <>
          <img
            src={src}
            alt={alt}
            onLoad={() => {
              loadedImages.add(src)
              setLoaded(true)
            }}
            style={{ width: '100%', visibility: 'hidden', position: 'absolute' }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            aspectRatio: '1344 / 2166',
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text-secondary)',
            fontSize: 13,
          }}>
            <span>图片加载中</span>
          </div>
        </>
      )}
      {loaded && (
        <TransformWrapper
          minScale={1}
          maxScale={4}
          limitToBounds={true}
        >
          <TransformComponent>
            <img
              src={src}
              alt={alt}
              style={{ width: '100%', cursor: 'grab' }}
            />
          </TransformComponent>
        </TransformWrapper>
      )}
      {loaded && (
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
          双指缩放，单指平移
        </span>
      )}
    </div>
  )
}
