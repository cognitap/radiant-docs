'use client'

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- A grip sits on the text's edge and is dragged in page pixels; a range input has neither position nor those units. */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent
} from 'react'
import type { TypographyInput, TypographyResult, TypographyRole } from '@cognitap/radiant'
import {
  applyHandle,
  clampStep,
  dragValue,
  formatValue,
  handleNames,
  handleTargets,
  handles,
  type Handle,
  type HandleTarget,
  type TextMetrics
} from './workshop-typography-view'
import { automaticSelection } from './PreviewInspection'
import type { Change } from './workshop-history'

export interface HandleEdit {
  input: TypographyInput
  change: Change
}
interface Layout {
  rect: { top: number; left: number; width: number; height: number }
  lineHeight: number
  metrics: TextMetrics
}
let ruler: CanvasRenderingContext2D | null | undefined
function chWidth(element: Element): number {
  const style = getComputedStyle(element)
  ruler ??= document.createElement('canvas').getContext('2d')
  if (!ruler) return parseFloat(style.fontSize) / 2
  ruler.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  return ruler.measureText('0').width || parseFloat(style.fontSize) / 2
}
function readLayout(element: Element, host: Element): Layout {
  const rect = element.getBoundingClientRect()
  const origin = host.getBoundingClientRect()
  const style = getComputedStyle(element)
  const fontSize = parseFloat(style.fontSize)
  const scale = rect.width / Math.max(1, (element as HTMLElement).offsetWidth || rect.width)
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2
  return {
    rect: {
      top: rect.top - origin.top,
      left: rect.left - origin.left,
      width: rect.width,
      height: rect.height
    },
    lineHeight: lineHeight * scale,
    metrics: { scale, fontSize, ch: chWidth(element) }
  }
}
/** The preview element the selected role styles: the Inspect pick when it carries the role, else the first match. */
export function roleElement(host: Element, role: string, picked: Element | null): Element | null {
  const safe = /^[a-z-]+$/.test(role) ? role : 'prose-body'
  const selector = `[data-rad-text="${safe}"]${automaticSelection[safe] ? `, ${automaticSelection[safe]}` : ''}`
  if (picked?.isConnected && picked.matches(selector) && host.contains(picked)) return picked
  return host.querySelector(`.preview-page :is(${selector})`)
}
const positions: Record<Handle, (layout: Layout) => CSSProperties> = {
  measure: ({ rect }) => ({ left: rect.left + rect.width, top: rect.top + rect.height / 2 }),
  size: ({ rect }) => ({ left: rect.left + rect.width, top: rect.top + rect.height }),
  lineHeight: ({ rect, lineHeight }) => ({
    left: rect.left,
    top: rect.top + Math.min(lineHeight, rect.height)
  })
}

/** Drag the selected text's size, leading and measure on the text itself. Each drag writes the
    same field as its scrub field, so the marker, the undo step and Inspect agree. */
export function TextHandles({
  role,
  result,
  picked,
  onEdit
}: {
  role: string
  result: TypographyResult
  picked: Element | null
  onEdit: (edit: HandleEdit) => void
}) {
  const anchor = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [dragging, setDragging] = useState<Handle | null>(null)
  const drag = useRef<{ target: HandleTarget; start: number; x: number; y: number } | null>(null)
  const [tick, relayout] = useState(0)
  const [element, setElement] = useState<Element | null>(null)
  const safeRole = (Object.hasOwn(result.styles, role) ? role : 'prose-body') as TypographyRole
  const targets = handleTargets(safeRole, result)
  useLayoutEffect(() => {
    const host = anchor.current?.parentElement
    const found = host ? roleElement(host, safeRole, picked) : null
    setElement(found)
    setLayout(found && host ? readLayout(found, host) : null)
  }, [safeRole, result, picked, tick])
  useEffect(() => {
    if (!element) return
    const observer = new ResizeObserver(() => relayout(value => value + 1))
    observer.observe(element)
    observer.observe(element.closest('.preview-inspection') ?? element)
    return () => observer.disconnect()
  }, [element])
  useEffect(() => {
    const bump = () => relayout(value => value + 1)
    window.addEventListener('resize', bump)
    document.fonts.addEventListener('loadingdone', bump)
    return () => {
      window.removeEventListener('resize', bump)
      document.fonts.removeEventListener('loadingdone', bump)
    }
  }, [])
  const edit = (target: HandleTarget, value: number) =>
    onEdit({
      input: applyHandle(result, safeRole, target, value),
      change: { label: `${target.name}`.toLowerCase(), coalesce: target.field }
    })
  const onKeyDown = (target: HandleTarget) => (event: KeyboardEvent<HTMLElement>) => {
    const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[event.key]
    let next: number | undefined
    if (steps)
      next = clampStep(target.value + steps * target.step * (event.shiftKey ? 10 : 1), target)
    else if (event.key === 'Home') next = target.min
    else if (event.key === 'End') next = target.max
    if (next === undefined) return
    event.preventDefault()
    edit(target, next)
  }
  return (
    <div
      ref={anchor}
      className="text-handles"
      data-role={safeRole}
      data-dragging={dragging ?? undefined}
    >
      {layout &&
        handles.map(handle => {
          const target = targets[handle]
          if (!target) return null
          return (
            <div
              key={handle}
              className="text-handle"
              data-handle={handle}
              style={positions[handle](layout)}
            >
              <div
                role="slider"
                tabIndex={0}
                aria-label={target.name}
                aria-valuemin={target.min}
                aria-valuemax={target.max}
                aria-valuenow={target.value}
                aria-valuetext={formatValue(target.value, target.unit)}
                aria-orientation={handle === 'lineHeight' ? 'vertical' : 'horizontal'}
                className="text-handle-grip"
                onKeyDown={onKeyDown(target)}
                onPointerDown={event => {
                  if (event.button !== 0) return
                  event.preventDefault()
                  event.currentTarget.setPointerCapture(event.pointerId)
                  drag.current = { target, start: target.value, x: event.clientX, y: event.clientY }
                  setDragging(handle)
                }}
                onPointerMove={event => {
                  const current = drag.current
                  if (!current || !layout) return
                  const next = dragValue(
                    current.target,
                    current.start,
                    { x: event.clientX - current.x, y: event.clientY - current.y },
                    layout.metrics
                  )
                  if (next !== current.target.value) {
                    current.target = { ...current.target, value: next }
                    edit(current.target, next)
                  }
                }}
                onPointerUp={() => {
                  drag.current = null
                  setDragging(null)
                }}
                onPointerCancel={() => {
                  drag.current = null
                  setDragging(null)
                }}
              />
              <output
                className="text-handle-readout"
                aria-hidden="true"
              >
                {handleNames[handle]} {formatValue(target.value, target.unit)}
              </output>
            </div>
          )
        })}
    </div>
  )
}
