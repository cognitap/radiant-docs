'use client'

import { useEffect, useRef } from 'react'
import { createRadiantLogo, getGeometry, sceneMarkup } from '@/lib/radiant-logo.mjs'

// The engine's first frame, so the mark is drawn before the script runs and
// mounting it does not shift the header.
const resting = sceneMarkup('radiant-mark-resting', getGeometry(), { label: 'Radiant' })

export function RadiantMark() {
  const host = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!host.current) return
    const logo = createRadiantLogo(host.current)
    return () => logo.destroy()
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
