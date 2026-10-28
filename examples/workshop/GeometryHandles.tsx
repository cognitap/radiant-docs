'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Grip } from './GeometryControls'
import { changeGeometry, type GeometryRecipe } from './workshop-geometry'
import { formatValue } from './workshop-typography-view'
import {
  handleScope,
  handleTarget,
  type GeometryHandleTarget,
  type HandleKey
} from './workshop-geometry-view'
import type { Change } from './workshop-history'

export interface GeometryEdit {
  recipe: GeometryRecipe
  change: Change
}
interface Rect {
  top: number
  left: number
  width: number
  height: number
  scale: number
}
const controlSelector = '[data-slot~="button"], [data-slot~="input"]'
const surfaceSelector =
  '[data-slot~="accordion-item"], [data-slot~="collapsible"], [data-slot~="dialog"], [data-slot~="card"]'
/** The control and the surface the handles sit on: the Inspect pick when it is one, else the first solid button and the first surface in the page. */
function subjects(
  host: Element,
  picked: Element | null
): Record<'control' | 'surface', Element | null> {
  const page = host.querySelector('.preview-page')
  const pick = (selector: string, fallback: string) =>
    picked?.isConnected && host.contains(picked) && picked.matches(selector)
      ? picked
      : (page?.querySelector(fallback) ?? null)
  return {
    control: pick(
      controlSelector,
      '[data-slot~="button"][data-variant="solid"], [data-slot~="button"]'
    ),
    surface: pick(surfaceSelector, surfaceSelector)
  }
}
function readRect(element: Element, host: Element): Rect {
  const rect = element.getBoundingClientRect()
  const origin = host.getBoundingClientRect()
  return {
    top: rect.top - origin.top,
    left: rect.left - origin.left,
    width: rect.width,
    height: rect.height,
    scale: rect.width / Math.max(1, (element as HTMLElement).offsetWidth || rect.width)
  }
}
const positions: Record<HandleKey, (rect: Rect, value: number) => CSSProperties> = {
  controlRadius: (rect, value) => ({
    left: rect.left + rect.width - value * 0.293 * rect.scale,
    top: rect.top + value * 0.293 * rect.scale
  }),
  surfaceRadius: (rect, value) => ({
    left: rect.left + rect.width - value * 0.293 * rect.scale,
    top: rect.top + value * 0.293 * rect.scale
  }),
  density: rect => ({ left: rect.left + rect.width / 2, top: rect.top + rect.height })
}
const subjectOf: Record<HandleKey, 'control' | 'surface'> = {
  controlRadius: 'control',
  density: 'control',
  surfaceRadius: 'surface'
}
const keys: readonly HandleKey[] = ['controlRadius', 'density', 'surfaceRadius']

/** Drag a control's corner and height and a surface's corner on the preview itself. Each handle
    writes the field the preview shows (a mode override when one exists, else the shared value),
    so the marker, the undo step and Inspect agree with the editor's dial. */
export function GeometryHandles({
  recipe,
  mode,
  scene,
  picked,
  onEdit
}: {
  recipe: GeometryRecipe
  mode: 'light' | 'dark'
  /** Changes when the preview shows another scene, so the handles find their new subjects. */
  scene: string
  picked: Element | null
  onEdit: (edit: GeometryEdit) => void
}) {
  const anchor = useRef<HTMLDivElement>(null)
  const [rects, setRects] = useState<Partial<Record<'control' | 'surface', Rect>>>({})
  const [elements, setElements] = useState<Element[]>([])
  const [dragging, setDragging] = useState<HandleKey | null>(null)
  const [tick, relayout] = useState(0)
  useLayoutEffect(() => {
    const host = anchor.current?.parentElement
    if (!host) return
    const found = subjects(host, picked)
    setElements([found.control, found.surface].filter((item): item is Element => item !== null))
    setRects({
      control: found.control ? readRect(found.control, host) : undefined,
      surface: found.surface ? readRect(found.surface, host) : undefined
    })
  }, [recipe, mode, scene, picked, tick])
  useEffect(() => {
    const host = anchor.current?.parentElement
    const observer = new ResizeObserver(() => relayout(value => value + 1))
    if (host) observer.observe(host)
    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [elements])
  useEffect(() => {
    const bump = () => relayout(value => value + 1)
    window.addEventListener('resize', bump)
    return () => window.removeEventListener('resize', bump)
  }, [])
  const edit = (target: GeometryHandleTarget, value: number) =>
    onEdit({
      recipe: changeGeometry(recipe, handleScope(target.field), { [target.key]: value }),
      change: { label: target.dial.name.toLowerCase(), coalesce: target.field }
    })
  return (
    <div
      ref={anchor}
      className="geometry-handles"
      data-dragging={dragging ?? undefined}
    >
      {keys.map(key => {
        const rect = rects[subjectOf[key]]
        if (!rect) return null
        const target = handleTarget(recipe, mode, key)
        return (
          <div
            key={key}
            className="geometry-handle"
            data-handle={key}
            style={positions[key](rect, target.value)}
          >
            <Grip
              dial={target.dial}
              value={target.value}
              onChange={value => edit(target, value)}
              onDragging={on => setDragging(on ? key : null)}
            />
            <output
              className="geometry-handle-readout"
              aria-hidden="true"
            >
              {target.dial.name} {formatValue(target.value, target.dial.unit)}
            </output>
          </div>
        )
      })}
    </div>
  )
}
