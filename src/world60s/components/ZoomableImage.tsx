import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
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
          width: '100%',
          filter: loaded ? 'none' : 'blur(20px)',
          transform: loaded ? 'none' : 'scale(1.1)',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 0.3s',
        }}
      />
      {loaded && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}>
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
