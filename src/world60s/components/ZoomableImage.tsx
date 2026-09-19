import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

const loadedImages = new Set<string>()

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(() => loadedImages.has(src))

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {!loaded && (
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
      )}
      <img
        ref={(el) => {
          if (el && !loaded) {
            el.onload = () => {
              loadedImages.add(src)
              setLoaded(true)
            }
          }
        }}
        src={src}
        alt={alt}
        style={{
          width: '100%',
          display: loaded ? 'none' : 'block',
        }}
      />
      {loaded && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
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
        </div>
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
