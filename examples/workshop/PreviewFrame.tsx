'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ThemeScope, type Theme, type ThemeMode } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import { widthId, type PreviewWidth } from './workshop-preview'

/** Fixed widths keep their real CSS width and scale only the displayed frame. A lone frame at
    full size needs no caption; the toolbar already shows its width. */
export function PreviewFrame({
  theme,
  mode,
  width,
  label,
  captioned,
  spacing = false,
  footer,
  children
}: {
  theme: Theme
  mode: ThemeMode
  width: PreviewWidth
  label: string
  captioned: boolean
  spacing?: boolean
  footer?: ReactNode
  children: ReactNode
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const px = width.kind === 'fixed' ? width.px : 0
  const [dimensions, setDimensions] = useState({ available: px, height: 0 })
  useEffect(() => {
    const outer = viewport.current
    const inner = page.current
    if (!px || !outer || !inner) return
    const measure = () =>
      setDimensions(previous => {
        const next = { available: outer.clientWidth, height: inner.offsetHeight }
        return previous.available === next.available && previous.height === next.height
          ? previous
          : next
      })
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(inner)
    measure()
    return () => observer.disconnect()
  }, [px])
  const scale = px ? Math.min(1, dimensions.available / px) : 1
  const style = px
    ? ({
        '--preview-width': `${px}px`,
        '--preview-scale': scale,
        height: dimensions.height ? dimensions.height * scale : undefined
      } as CSSProperties)
    : undefined
  return (
    <figure
      className="preview-frame"
      data-preview-width={widthId(width)}
      aria-label={label}
    >
      {(captioned || scale < 1) && (
        <figcaption>
          {label}
          {scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ''}
        </figcaption>
      )}
      <div
        ref={viewport}
        className="preview-viewport"
        data-preview-ready={(px && dimensions.height > 0) || undefined}
        style={style}
      >
        <div
          ref={page}
          className="preview-scaled-page"
          data-preview-spacing={spacing || undefined}
        >
          <ThemeScope
            theme={theme}
            mode={mode}
            className="preview-page"
            data-rad-type-container=""
          >
            <MotionProvider>{children}</MotionProvider>
          </ThemeScope>
        </div>
      </div>
      {footer}
    </figure>
  )
}
