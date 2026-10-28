import {
  geometryDials,
  geometryValues,
  type GeometryRecipe,
  type GeometryScope,
  type GeometrySettings
} from './workshop-geometry.ts'
import { clampStep, type Scrub } from './workshop-typography-view.ts'

/* Dials: one visual per numeric value. The sample is drawn from the value by CSS, and the grip
   on it moves along one axis, so the same table drives the editor dial and the preview handle. */

export type DialKey = (typeof geometryDials)[number]['key']
export type DialKind = 'corner' | 'density' | 'spacing' | 'line' | 'backdrop'
export interface GeometryDial extends Scrub<DialKey> {
  kind: DialKind
  /** Pointer travel that raises the value: right, down, or inward along a corner's diagonal. */
  axis: 'right' | 'down' | 'up' | 'inward'
  /** Value change per pixel of travel along the axis. */
  perPixel: number
  words: (value: number) => string
}
const percent = (value: number) => `${Math.round(value * 100)}%`
const px = (value: number) => `${value} pixel${value === 1 ? '' : 's'}`
const visuals: Record<DialKey, Pick<GeometryDial, 'kind' | 'axis' | 'perPixel' | 'words'>> = {
  spacing: {
    kind: 'spacing',
    axis: 'down',
    perPixel: 1 / 18,
    words: value =>
      `${value} times, ${value < 0.9 ? 'tight' : value > 1.25 ? 'airy' : 'balanced'} gaps`
  },
  density: {
    kind: 'density',
    axis: 'up',
    perPixel: 1 / 26,
    words: value =>
      `${value} times, ${value < 0.95 ? 'shorter' : value > 1.1 ? 'taller' : 'standard'} controls`
  },
  controlRadius: {
    kind: 'corner',
    axis: 'inward',
    perPixel: 1,
    words: value =>
      `${px(value)}, ${value === 0 ? 'square' : value < 6 ? 'slightly rounded' : value < 16 ? 'rounded' : 'pill-like'} controls`
  },
  surfaceRadius: {
    kind: 'corner',
    axis: 'inward',
    perPixel: 1,
    words: value =>
      `${px(value)}, ${value === 0 ? 'square' : value < 8 ? 'slightly rounded' : value < 20 ? 'rounded' : 'very rounded'} surfaces`
  },
  controlBorderWidth: {
    kind: 'line',
    axis: 'down',
    perPixel: 0.125,
    words: value => (value === 0 ? 'no control borders' : `${px(value)} control borders`)
  },
  surfaceBorderWidth: {
    kind: 'line',
    axis: 'down',
    perPixel: 0.125,
    words: value => (value === 0 ? 'no surface borders' : `${px(value)} surface borders`)
  },
  backdropOpacity: {
    kind: 'backdrop',
    axis: 'right',
    perPixel: 0.9 / 120,
    words: value =>
      value === 0
        ? 'clear backdrop'
        : `${percent(value)} dim, ${value < 0.3 ? 'light' : value < 0.6 ? 'medium' : 'heavy'} backdrop`
  }
}
export const dials: readonly GeometryDial[] = geometryDials.map(dial => ({
  key: dial.key,
  name: dial.label,
  label: dial.label,
  min: dial.min,
  max: dial.max,
  step: dial.step,
  unit: dial.unit,
  ...visuals[dial.key]
}))
export const dialFor = (key: DialKey) => dials.find(dial => dial.key === key)!

/** A drag's value from its pointer travel; shift makes the same travel count a quarter. */
export function dragDial(
  dial: GeometryDial,
  start: number,
  delta: { x: number; y: number },
  fine = false
): number {
  const travel = {
    right: delta.x,
    down: delta.y,
    up: -delta.y,
    inward: (delta.y - delta.x) / Math.SQRT2
  }[dial.axis]
  return clampStep(start + (travel * dial.perPixel) / (fine ? 4 : 1), dial)
}
export function stepDial(
  dial: GeometryDial,
  value: number,
  key: string,
  shift: boolean
): number | undefined {
  const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[key]
  if (steps) return clampStep(value + steps * dial.step * (shift ? 10 : 1), dial)
  if (key === 'Home') return dial.min
  if (key === 'End') return dial.max
  return undefined
}

/* Choices */

export const elevationOptions = [
  { value: '0', name: 'Flat' },
  { value: '1', name: 'Baseline' },
  { value: '2', name: 'Raised' },
  { value: '3', name: 'Floating' }
] as const
/** Approximate shadows for the depth cards; the preview shows the compiled ones. */
export const elevationShadows = [
  'none',
  '0 1px 2px rgb(0 0 0 / 0.12)',
  '0 4px 12px rgb(0 0 0 / 0.16)',
  '0 12px 32px rgb(0 0 0 / 0.22)'
] as const
export const borderStyleOptions = [
  { value: 'solid', name: 'Solid' },
  { value: 'dashed', name: 'Dashed' },
  { value: 'dotted', name: 'Dotted' }
] as const
export const scopeOptions: readonly { value: GeometryScope; label: string }[] = [
  { value: 'shared', label: 'Light and dark' },
  { value: 'light', label: 'Light only' },
  { value: 'dark', label: 'Dark only' }
]

/** CSS variables that draw a preset card's mock button, input and card. */
export function presetVariables(values: GeometrySettings): Record<`--${string}`, string> {
  return {
    '--p-spacing': String(values.spacing),
    '--p-density': String(values.density),
    '--p-control-radius': `${values.controlRadius}px`,
    '--p-surface-radius': `${values.surfaceRadius}px`,
    '--p-control-border': `${values.controlBorderWidth}px`,
    '--p-surface-border': `${values.surfaceBorderWidth}px`,
    '--p-border-style': values.borderStyle,
    '--p-shadow': elevationShadows[values.elevation]
  }
}

/* Preview handles: each edits the value the preview shows, so a mode override wins over the shared value. */

export type HandleKey = 'controlRadius' | 'surfaceRadius' | 'density'
export interface GeometryHandleTarget {
  key: HandleKey
  field: `${GeometryScope}.${HandleKey}`
  dial: GeometryDial
  value: number
}
export function handleTarget(
  recipe: GeometryRecipe,
  mode: 'light' | 'dark',
  key: HandleKey
): GeometryHandleTarget {
  const scope: GeometryScope = recipe.modes?.[mode]?.[key] === undefined ? 'shared' : mode
  return {
    key,
    field: `${scope}.${key}`,
    dial: dialFor(key),
    value: geometryValues(recipe, mode)[key]
  }
}
export const handleScope = (field: `${GeometryScope}.${HandleKey}`) =>
  field.split('.')[0] as GeometryScope
