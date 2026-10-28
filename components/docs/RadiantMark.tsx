'use client'

import { useEffect, useRef } from 'react'
import { createRadiantLogo, getGeometry, sceneMarkup } from '@/lib/radiant-logo.mjs'

// The engine's first frame, so the mark is drawn before the script runs and
// mounting it does not shift the header.
const resting = sceneMarkup('radiant-mark-resting', getGeometry(), { label: 'Radiant' })

const clamp = (n: number) => Math.min(1, Math.max(-1, n))

export function RadiantMark() {
  const host = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = host.current
    if (!el) return
    const logo = createRadiantLogo(el)
    // The mark turns toward the pointer anywhere on the page, not only over itself.
    const follow = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const box = el.getBoundingClientRect()
      logo.setInput({
        x: clamp(((event.clientX - box.left - box.width / 2) / window.innerWidth) * 2),
        y: clamp(((event.clientY - box.top - box.height / 2) / window.innerHeight) * 2),
        active: true
      })
    }
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) logo.reset()
    }
    window.addEventListener('pointermove', follow)
    document.addEventListener('pointerout', leave)
    return () => {
      window.removeEventListener('pointermove', follow)
      document.removeEventListener('pointerout', leave)
      logo.destroy()
    }
  }, [])
  return (
    <span
      ref={host}
      className="radiant-mark"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: resting }}
    />
  )
}
