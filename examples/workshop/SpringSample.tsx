'use client'

import { useEffect, useRef } from 'react'
import type { SpringParameters } from '@cognitap/radiant'
import { bindSpringStyle, createSpring } from '@cognitap/radiant/motion'
import { useReducedMotion } from '@cognitap/radiant/motion/react'
import { curveHorizon, curvePoints, springSummary } from './workshop-motion-view'

const travel = 44
/** A dot that keeps crossing its track on the real runtime spring with these parameters. Under
    reduced motion it is the step response drawn still. */
export function SpringSample({ parameters }: { parameters: SpringParameters }) {
  const reduced = useReducedMotion()
  const dot = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (reduced || !dot.current) return
    const spring = createSpring(0, { parameters })
    const unbind = bindSpringStyle(dot.current, spring, 'translateX')
    let far = false
    const cross = () => {
      if (document.hidden) return
      far = !far
      spring.to(far ? travel : 0)
    }
    cross()
    const timer = setInterval(cross, 1500)
    return () => {
      clearInterval(timer)
      unbind()
      spring.destroy()
    }
  }, [reduced, parameters])
  if (reduced) {
    const horizon = curveHorizon(springSummary(parameters).settleTime)
    const d = curvePoints(parameters, horizon, 60)
      .map(
        (point, index) =>
          `${index ? 'L' : 'M'}${((point.t / horizon) * 60).toFixed(1)},${(26 - Math.min(1.6, point.x) * 15).toFixed(1)}`
      )
      .join(' ')
    return (
      <svg
        className="spring-sample-still"
        viewBox="0 0 60 28"
        aria-hidden="true"
      >
        <path d="M0 11H60" />
        <path d={d} />
      </svg>
    )
  }
  return (
    <span
      className="spring-sample"
      aria-hidden="true"
    >
      <span
        ref={dot}
        className="spring-sample-dot"
      />
    </span>
  )
}
