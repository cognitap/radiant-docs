import {
  typographyPresets,
  type TypographyAssignment,
  type TypographyFont,
  type TypographyInput,
  type TypographyPreset,
  type TypographyProseRhythm,
  type TypographyResult,
  type TypographyRole,
  type TypographyStyle,
  type TypographyUIRhythm
} from '@cognitap/radiant'
import { fontFamily, type TrialFont } from './workshop-fonts.ts'
import {
  assignedTrial,
  assignments,
  setRhythm,
  setStyle,
  styleName
} from './workshop-typography.ts'

/* Scrub fields: one row per numeric control, so the editor, the handles and the scripts share a name. */

export interface Scrub<K extends string = string> {
  key: K
  /** The accessible name every script and marker uses. */
  name: string
  /** The short visible label beside the value. */
  label: string
  min: number
  max: number
  step: number
  unit: string
}
export const proseScrubs: readonly Scrub<keyof TypographyProseRhythm>[] = [
  { key: 'size', name: 'Prose size (px)', label: 'Size', min: 12, max: 40, step: 0.5, unit: 'px' },
  {
    key: 'lineHeight',
    name: 'Prose leading',
    label: 'Leading',
    min: 1,
    max: 3,
    step: 0.05,
    unit: ''
  },
  {
    key: 'paragraphSpacing',
    name: 'Paragraph spacing (em)',
    label: 'Paragraph',
    min: 0,
    max: 4,
    step: 0.05,
    unit: 'em'
  },
  {
    key: 'measure',
    name: 'Prose measure (ch)',
    label: 'Measure',
    min: 20,
    max: 120,
    step: 1,
    unit: 'ch'
  },
  {
    key: 'headingScale',
    name: 'Heading scale',
    label: 'Heading scale',
    min: 1.1,
    max: 1.5,
    step: 0.001,
    unit: ''
  }
]
export const uiScrubs: readonly Scrub<keyof TypographyUIRhythm>[] = [
  { key: 'size', name: 'UI size (px)', label: 'Size', min: 12, max: 32, step: 0.5, unit: 'px' },
  { key: 'lineHeight', name: 'UI leading', label: 'Leading', min: 1, max: 3, step: 0.05, unit: '' }
]
export type StyleScrubKey = 'weight' | 'lineHeight' | 'tracking' | 'measure'
export const styleScrubs: readonly Scrub<StyleScrubKey>[] = [
  { key: 'weight', name: 'Style weight', label: 'Weight', min: 1, max: 1000, step: 1, unit: '' },
  {
    key: 'lineHeight',
    name: 'Style leading',
    label: 'Leading',
    min: 0.8,
    max: 3,
    step: 0.05,
    unit: ''
  },
  {
    key: 'tracking',
    name: 'Style tracking (em)',
    label: 'Tracking',
    min: -0.2,
    max: 0.5,
    step: 0.005,
    unit: 'em'
  },
  {
    key: 'measure',
    name: 'Style measure (ch)',
    label: 'Measure',
    min: 0,
    max: 120,
    step: 1,
    unit: 'ch'
  }
]
export const sizeScrub = (name: string, min: number, max: number): Scrub => ({
  key: 'size',
  name,
  label: name.startsWith('Narrow') ? 'Narrow' : name.startsWith('Wide') ? 'Wide' : 'Size',
  min,
  max,
  step: 0.5,
  unit: 'px'
})

export const clampStep = (
  value: number,
  { min, max, step }: Pick<Scrub, 'min' | 'max' | 'step'>
) => {
  const digits = Math.max(0, -Math.floor(Math.log10(step)))
  const stepped = Number((Math.round(value / step) * step).toFixed(digits))
  return Math.min(max, Math.max(min, stepped))
}
export const formatValue = (value: number, unit: string) => {
  const text = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)))
  return unit ? `${text}${unit}` : text
}
/** A scrub covers its whole range over this many pointer pixels. */
export const scrubTravel = 300
export function scrubValue(start: number, deltaPx: number, scrub: Scrub, fine = false): number {
  const span = (scrub.max - scrub.min) / (fine ? 4 : 1)
  return clampStep(start + (deltaPx / scrubTravel) * span, scrub)
}

/* Faces: a sample is drawn in its face only once the file is in, never in the fallback. */

export type FaceState = 'ready' | 'loading' | 'missing'
export interface FaceLoader {
  has(family: string): boolean
  isLoading(family: string): boolean
}
export function faceState(font: TrialFont | undefined, loader: FaceLoader | null): FaceState {
  if (!font) return 'missing'
  if (loader?.has(font.family)) return 'ready'
  return loader?.isLoading(font.family) || (!loader && font.source === 'catalog')
    ? 'loading'
    : 'missing'
}
export interface Face {
  family: string
  state: FaceState
}
export interface FaceOption {
  value: string
  name: string
  /** One face for a family, heading then body for a pairing. */
  faces: readonly Face[]
  note?: string
}
export const trialFace = (font: TrialFont | undefined, loader: FaceLoader | null): Face => ({
  family: font ? fontFamily(font) : 'inherit',
  state: faceState(font, loader)
})
export function pairingOptions(local: TrialFont | null, loader: FaceLoader | null): FaceOption[] {
  return (Object.keys(typographyPresets) as TypographyPreset[]).map(id => {
    const { name, fonts } = typographyPresets[id]
    return {
      value: id,
      name,
      faces: [
        trialFace(assignedTrial(fonts.headings, local), loader),
        trialFace(assignedTrial(fonts.body, local), loader)
      ]
    }
  })
}
export function familyOptions(
  candidates: readonly TrialFont[],
  assigned: TypographyFont,
  local: TrialFont | null,
  loader: FaceLoader | null
): FaceOption[] {
  const known = assignedTrial(assigned, local)
  const options = candidates.map(font => ({
    value: font.id,
    name: font.family,
    faces: [trialFace(font, loader)],
    note: font.source === 'local' ? 'local' : undefined
  }))
  if (!known)
    options.unshift({
      value: 'manual',
      name: assigned.family
        .split(',')[0]!
        .trim()
        .replaceAll(/^["']|["']$/g, ''),
      faces: [{ family: assigned.family, state: 'missing' }],
      note: 'manual, file may be missing'
    })
  return options
}

/* Role specimens: each row of the style list is set in its own style, shrunk when it would not fit. */

export const specimenMaxPx = 26
export interface Specimen {
  fontFamily: string
  fontSize: string
  fontWeight: number
  letterSpacing: string
  lineHeight: number
  /** False while the face is loading, so the row shows a placeholder instead of the fallback. */
  ready: boolean
  /** Narrow and wide sizes plus weight, for the row's meta text. */
  meta: string
}
export function specimen(
  style: TypographyStyle,
  fonts: NonNullable<TypographyInput['fonts']>,
  local: TrialFont | null,
  loader: FaceLoader | null
): Specimen {
  const font = fonts[style.assignment]!
  const known = assignedTrial(font, local)
  const state = faceState(known, loader)
  const px = Math.min(style.narrow, specimenMaxPx)
  const sizes =
    style.narrow === style.wide
      ? formatValue(style.narrow, 'px')
      : `${formatValue(style.narrow, '')}–${formatValue(style.wide, 'px')}`
  return {
    fontFamily: known ? fontFamily(known) : font.family,
    fontSize: `${px / 16}rem`,
    fontWeight: style.weight,
    letterSpacing: `${style.tracking}em`,
    lineHeight: 1.1,
    ready: state !== 'loading',
    meta: `${sizes} · ${style.weight}`
  }
}
export const roleOrder = (result: TypographyResult) =>
  Object.keys(result.styles) as TypographyRole[]
export const overridden = (input: TypographyInput, role: TypographyRole) =>
  Object.keys(input.styles?.[role] ?? {}).length > 0

/* Handles: three values a pointer can drag on the selected text in the preview. Each writes the
   field the role's value comes from, so the marker, the undo step and Inspect land on one control. */

export type Handle = 'size' | 'lineHeight' | 'measure'
export const handles: readonly Handle[] = ['size', 'lineHeight', 'measure']
export interface HandleTarget {
  handle: Handle
  /** The field path the drag writes and coalesces on. */
  field: string
  name: string
  min: number
  max: number
  step: number
  unit: string
  value: number
}
const rhythmHandle = (
  context: 'prose' | 'ui',
  key: 'size' | 'lineHeight' | 'measure',
  value: number
): HandleTarget => {
  const scrub = (context === 'prose' ? proseScrubs : uiScrubs).find(item => item.key === key)!
  return {
    handle: key,
    field: `${context}.${key}`,
    name: scrub.name,
    min: scrub.min,
    max: scrub.max,
    step: scrub.step,
    unit: scrub.unit,
    value
  }
}
/** The handles the selected role offers. Body roles drive their rhythm; a style with no measure has no measure handle. */
export function handleTargets(
  role: TypographyRole,
  result: TypographyResult
): Partial<Record<Handle, HandleTarget>> {
  const style = result.styles[role]
  const inputProse = result.input.prose ?? {}
  const inputUI = result.input.ui ?? {}
  if (role === 'prose-body' && !overridden(result.input, role))
    return {
      size: rhythmHandle('prose', 'size', inputProse.size ?? result.prose.size),
      lineHeight: rhythmHandle(
        'prose',
        'lineHeight',
        inputProse.lineHeight ?? result.prose.lineHeight
      ),
      measure: rhythmHandle('prose', 'measure', inputProse.measure ?? result.prose.measure)
    }
  if (role === 'ui-body' && !overridden(result.input, role))
    return {
      size: rhythmHandle('ui', 'size', inputUI.size ?? result.ui.size),
      lineHeight: rhythmHandle('ui', 'lineHeight', inputUI.lineHeight ?? result.ui.lineHeight)
    }
  const label = styleName(role)
  const targets: Partial<Record<Handle, HandleTarget>> = {
    size: {
      handle: 'size',
      field: `style.${role}.size`,
      name: `${label} size`,
      min: 8,
      max: 256,
      step: 0.5,
      unit: 'px',
      value: style.narrow
    },
    lineHeight: {
      handle: 'lineHeight',
      field: `style.${role}.lineHeight`,
      name: `${label} leading`,
      min: 0.8,
      max: 3,
      step: 0.05,
      unit: '',
      value: style.lineHeight
    }
  }
  if (style.measure > 0)
    targets.measure = {
      handle: 'measure',
      field: `style.${role}.measure`,
      name: `${label} measure`,
      min: 1,
      max: 120,
      step: 1,
      unit: 'ch',
      value: style.measure
    }
  return targets
}
/** Write one handle's value. A fluid style keeps its wide/narrow ratio when its size moves. */
export function applyHandle(
  result: TypographyResult,
  role: TypographyRole,
  target: HandleTarget,
  value: number
): TypographyInput {
  const next = clampStep(value, target)
  const { input } = result
  const [scope, key] = target.field.split('.') as [string, string]
  if (scope === 'prose' || scope === 'ui')
    return setRhythm(input, scope, key as keyof TypographyProseRhythm, next)
  if (target.handle === 'size') {
    const style = result.styles[role]
    const ratio = style.wide / style.narrow
    const wide = clampStep(next * ratio, { min: next, max: 512, step: 0.5 })
    return setStyle(setStyle(input, role, 'narrow', next), role, 'wide', wide)
  }
  return setStyle(input, role, target.handle, next)
}
/** What the element reports so a pointer delta becomes a value delta. */
export interface TextMetrics {
  /** Rendered px per CSS px, from a scaled preview frame. */
  scale: number
  fontSize: number
  /** Width of one `ch` in CSS px. */
  ch: number
}
export function dragValue(
  target: HandleTarget,
  start: number,
  delta: { x: number; y: number },
  metrics: TextMetrics
): number {
  const dx = delta.x / metrics.scale
  const dy = delta.y / metrics.scale
  switch (target.handle) {
    case 'size':
      return clampStep(start + dx, target)
    case 'measure':
      return clampStep(start + dx / Math.max(1, metrics.ch), target)
    case 'lineHeight':
      return clampStep(start + dy / Math.max(1, metrics.fontSize), target)
  }
}
export const handleNames: Record<Handle, string> = {
  size: 'size',
  lineHeight: 'leading',
  measure: 'measure'
}

/* Weight warnings from the catalog files and the generator, one line each. */
export function weightWarnings(result: TypographyResult, local: TrialFont | null): string[] {
  const warnings = Object.entries(result.styles).flatMap(([name, style]) => {
    const known = assignedTrial(result.input.fonts![style.assignment]!, local)
    return known && (style.weight < known.weights[0] || style.weight > known.weights[1])
      ? [
          `${styleName(name)} requests ${style.weight}; ${known.family} provides ${known.weights.join('–')}.`
        ]
      : []
  })
  for (const warning of result.warnings)
    if (!warnings.some(text => text.startsWith(styleName(warning.role))))
      warnings.push(
        `${styleName(warning.role)} requests ${warning.requestedWeight}; supported weights are ${warning.supportedWeights.join('–')}.`
      )
  return warnings
}
export const assignmentOptions: readonly { value: TypographyAssignment; label: string }[] =
  assignments.map(value => ({
    value,
    label: value === 'ui' ? 'UI' : value[0]!.toUpperCase() + value.slice(1)
  }))
