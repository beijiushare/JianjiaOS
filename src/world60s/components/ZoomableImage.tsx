import { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

const loadedImages = new Set<string>()

export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(() => loadedImages.has(src))

  return (
    <div className="w60-zoomable">
      {!loaded && (
        <>
          <img
            src={src}
            alt={alt}
            onLoad={() => {
              loadedImages.add(src)
              setLoaded(true)
            }}
            className="w60-zoomable__preload"
          />
          <div className="w60-zoomable__placeholder">
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
              className="w60-zoomable__image"
            />
          </TransformComponent>
        </TransformWrapper>
      )}
      {loaded && (
        <span className="w60-zoomable__hint">
          双指缩放，单指平移
        </span>
      )}
    </div>
  )
}
