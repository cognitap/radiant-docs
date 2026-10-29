'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  FACES,
  GLOW_NAMES,
  GLOW_RADIUS,
  HAZE_RADIUS,
  IDLE,
  REST,
  bloom,
  createMotion,
  getGeometry,
  lightStops,
  num,
  type Face,
  type Frame,
  type Input,
  type Pose,
  type Stop
} from '@/lib/radiant-logo'

const clamp = (n: number) => Math.min(1, Math.max(-1, n))

/** The header's Radiant mark. It turns toward the pointer anywhere on the page. */
export function RadiantMark() {
  const host = useRef<HTMLSpanElement>(null)
  // The server draws the resting pose, so the mark is there before the script runs.
  const [pose, setPose] = useState<Pose>(REST)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const motion = createMotion()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let input = IDLE
    let pointer: number | null = null
    let frame = 0
    let previous = 0
    let onScreen = true

    const tick = (time: number) => {
      frame = 0
      if (!onScreen) return
      const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 1 / 60
      previous = time
      setPose(motion.step(dt, reduced.matches))
      // The colours sway until reduced motion holds them; then frames stop once the springs settle.
      if (!reduced.matches || !motion.settled) frame = requestAnimationFrame(tick)
      else previous = 0
    }
    const wake = () => {
      if (onScreen && !frame) frame = requestAnimationFrame(tick)
    }
    const aim = (next: Partial<Input>) => {
      input = { ...input, ...next }
      motion.aim(input, reduced.matches)
      wake()
    }
    const rest = () => {
      pointer = null
      aim(IDLE)
    }
    // The pointer measured from the mark's centre, in viewport halves.
    const toward = (e: PointerEvent) => {
      const box = el.getBoundingClientRect()
      return {
        x: clamp(((e.clientX - box.left - box.width / 2) / window.innerWidth) * 2),
        y: clamp(((e.clientY - box.top - box.height / 2) / window.innerHeight) * 2)
      }
    }
    // Touch only steers the mark while pressing it, so scrolling the page leaves it alone.
    const move = (e: PointerEvent) => {
      if (!e.isPrimary || (pointer !== null && e.pointerId !== pointer)) return
      if (e.pointerType === 'touch' && pointer === null) return
      aim({ ...toward(e), active: true })
    }
    // Never preventDefault: the mark sits inside the home link.
    const down = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0 || pointer !== null) return
      pointer = e.pointerId
      el.setPointerCapture(pointer)
      aim({ ...toward(e), active: true, pressed: true })
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return
      pointer = null
      aim({ ...toward(e), pressed: false, active: e.pointerType !== 'touch' })
    }

    const on = <E extends Event>(target: EventTarget, type: string, fn: (e: E) => void) => {
      target.addEventListener(type, fn as EventListener)
      return () => target.removeEventListener(type, fn as EventListener)
    }
    const cleanups = [
      on(window, 'pointermove', move),
      on(el, 'pointerdown', down),
      on(el, 'pointerup', up),
      // Also fires on pointercancel.
      on(el, 'lostpointercapture', () => pointer !== null && rest()),
      // The pointer left the window.
      on(document, 'pointerout', (e: PointerEvent) => !e.relatedTarget && rest()),
      on(window, 'blur', rest),
      on(reduced, 'change', () => aim({}))
    ]
    // Off-screen, the mark stops drawing frames.
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      wake()
    })
    observer.observe(el)
    aim({})
    return () => {
      cleanups.forEach(cleanup => cleanup())
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <span
      ref={host}
      className="radiant-mark"
      aria-hidden="true"
    >
      <Scene pose={pose} />
    </span>
  )
}

// Light dims gently toward the cube's edge, in cube units from the centre.
const FADE = 1.75
// Each plate's base colour, a vertical gradient from (x, y1) to (x, y2).
const FILLS: Record<Face, { x: number; y1: number; y2: number; from: string; to: string }> = {
  top: { x: 300, y1: 130, y2: 300, from: '#36333f', to: '#24222c' },
  left: { x: 220, y1: 235, y2: 470, from: '#211f29', to: '#141319' },
  right: { x: 380, y1: 235, y2: 470, from: '#1b1a23', to: '#0f0f14' }
}
// Masks, filters and their fills cover the whole drawing.
const CANVAS = { x: 0, y: 0, width: 600, height: 600 }

/**
 * A studio softbox reflected in each plate, placed in the plate's own plane.
 * It slides against the tilt while the light behind the plates slides with
 * depth: two motions that tell surface from interior.
 */
function sheen(face: Face, { yaw, pitch }: Pose) {
  const k = 1.8
  if (face === 'top')
    return { cx: -0.5 - k * (yaw - pitch), cy: -0.35 + k * (yaw + pitch), r: 1.25, opacity: 0.1 }
  if (face === 'left') return { cx: -0.35 - k * yaw, cy: 0.7 - k * pitch, r: 1, opacity: 0.055 }
  return { cx: -0.35 + k * yaw, cy: 0.7 - k * pitch, r: 1, opacity: 0.045 }
}

// Map a plate's own (u, v) coordinates onto the screen, so a circle drawn in
// that plane becomes the correctly foreshortened ellipse.
const matrix = (f: Frame) => `matrix(${[...f.u, ...f.v, ...f.origin].map(num).join(' ')})`

// Where a stop has a P3 colour, the style wins with it and the attribute is the sRGB fallback.
const stops = (list: (Pick<Stop, 'offset' | 'color'> & Partial<Stop>)[]) =>
  list.map((s, i) => (
    <stop
      key={i}
      offset={s.offset}
      stopColor={s.color}
      stopOpacity={s.opacity}
      style={s.p3 ? { stopColor: s.p3 } : undefined}
    />
  ))

/**
 * Layers, back to front: the glowing inner cube seen through the seam, the
 * plate faces with their reflections, then bloom of whatever light is visible.
 * Bloom blends normally, so it reads the same over the plates and over any
 * background, and reaches over the plate edges so light and plates share the
 * same air. The inner cube is smaller than the plates and its edge is soft,
 * so near each corner the light dims away inside the slit.
 */
function Scene({ pose }: { pose: Pose }) {
  const base = useId()
  const id = (name: string) => `${base}-${name}`
  const url = (name: string) => `url(#${id(name)})`
  const g = getGeometry(pose)
  // The gradients follow only the light's energy, so they are rebuilt at most once per 0.01 of it.
  const energy = Math.round(pose.energy * 100) / 100
  const light = useMemo(() => lightStops(energy), [energy])
  const [sx, sy] = g.source
  const glowRadius = GLOW_RADIUS * g.unit
  const hazeRadius = HAZE_RADIUS * g.unit
  const glowCircle = (cx: number, cy: number, r: number, fill: string, opacity?: number) => (
    <circle
      key={fill}
      cx={num(cx)}
      cy={num(cy)}
      r={num(r)}
      fill={url(fill)}
      opacity={opacity === undefined ? undefined : num(opacity)}
      style={{ mixBlendMode: 'screen' }}
    />
  )

  return (
    <svg
      viewBox="80 78 440 440"
      focusable="false"
      style={{ display: 'block', width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        {FACES.map(face => {
          const { x, y1, y2, from, to } = FILLS[face]
          const s = sheen(face, pose)
          return [
            <linearGradient
              key={`${face}-fill`}
              id={id(`${face}-fill`)}
              gradientUnits="userSpaceOnUse"
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
            >
              {stops([
                { offset: 0, color: from },
                { offset: 1, color: to }
              ])}
            </linearGradient>,
            <radialGradient
              key={`${face}-sheen`}
              id={id(`${face}-sheen`)}
              gradientUnits="userSpaceOnUse"
              cx={num(s.cx)}
              cy={num(s.cy)}
              r={s.r}
              gradientTransform={matrix(g.frames[face])}
            >
              {stops([
                { offset: 0, color: '#f1ebf8', opacity: s.opacity },
                { offset: 0.55, color: '#f1ebf8', opacity: num(s.opacity * 0.35) },
                { offset: 1, color: '#f1ebf8', opacity: 0 }
              ])}
            </radialGradient>,
            <path
              key={face}
              id={id(face)}
              d={g.paths[face]}
            />
          ]
        })}
        {GLOW_NAMES.map(name => (
          <radialGradient
            key={name}
            id={id(`${name}-light`)}
            gradientUnits="userSpaceOnUse"
            cx={num(g.glows[name][0])}
            cy={num(g.glows[name][1])}
            r={num(glowRadius)}
          >
            {stops(light.glows[name])}
          </radialGradient>
        ))}
        <radialGradient
          id={id('haze-light')}
          gradientUnits="userSpaceOnUse"
          cx={num(sx)}
          cy={num(sy)}
          r={num(hazeRadius)}
        >
          {stops(light.haze)}
        </radialGradient>
        <radialGradient
          id={id('fade')}
          gradientUnits="userSpaceOnUse"
          cx={num(g.center[0])}
          cy={num(g.center[1])}
          r={num(FADE * g.unit)}
        >
          {stops([
            { offset: 0, color: '#fff' },
            { offset: 0.55, color: '#fff' },
            { offset: 0.85, color: '#dcdcdc' },
            { offset: 1, color: '#c8c8c8' }
          ])}
        </radialGradient>
        {/* Three blurs, near to far, added together. */}
        <filter
          id={id('bloom')}
          filterUnits="userSpaceOnUse"
          {...CANVAS}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            stdDeviation="2.6"
            result="near"
          />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="9"
            result="mid"
          />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="28"
            result="far"
          />
          <feComposite
            in="near"
            in2="mid"
            operator="arithmetic"
            k2=".55"
            k3=".75"
            result="nearmid"
          />
          <feComposite
            in="nearmid"
            in2="far"
            operator="arithmetic"
            k2="1"
            k3="1"
          />
        </filter>
        <filter
          id={id('core-blur')}
          filterUnits="userSpaceOnUse"
          {...CANVAS}
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <mask
          id={id('core')}
          maskUnits="userSpaceOnUse"
          {...CANVAS}
        >
          <path
            d={g.core}
            fill="#fff"
            filter={url('core-blur')}
          />
        </mask>
        <mask
          id={id('fade-mask')}
          maskUnits="userSpaceOnUse"
          {...CANVAS}
        >
          <rect
            {...CANVAS}
            fill={url('fade')}
          />
        </mask>
        {/* Bloom over the plates is dimmed to about 60%. */}
        <mask
          id={id('bloom-mask')}
          maskUnits="userSpaceOnUse"
          {...CANVAS}
        >
          <rect
            {...CANVAS}
            fill="#fff"
          />
          {FACES.map(face => (
            <use
              key={face}
              href={`#${id(face)}`}
              fill="#a0a0a0"
            />
          ))}
        </mask>
        <clipPath id={id('aperture')}>
          <path d={g.aperture} />
        </clipPath>
        <g
          id={id('emitter')}
          clipPath={url('aperture')}
        >
          <g
            mask={url('core')}
            style={{ isolation: 'isolate' }}
          >
            <g mask={url('fade-mask')}>
              {GLOW_NAMES.map(name =>
                glowCircle(...g.glows[name], glowRadius, `${name}-light`, g.glowLevels[name])
              )}
              {glowCircle(sx, sy, hazeRadius, 'haze-light')}
            </g>
          </g>
        </g>
      </defs>
      <use href={`#${id('emitter')}`} />
      {(['left', 'right', 'top'] as const).map(face => [
        <use
          key={`${face}-fill`}
          href={`#${id(face)}`}
          fill={url(`${face}-fill`)}
        />,
        <use
          key={`${face}-sheen`}
          href={`#${id(face)}`}
          fill={url(`${face}-sheen`)}
        />
      ])}
      <g mask={url('bloom-mask')}>
        <use
          href={`#${id('emitter')}`}
          filter={url('bloom')}
          opacity={num(bloom(pose))}
        />
      </g>
    </svg>
  )
}
