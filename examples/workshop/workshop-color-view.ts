import type { PaletteContrastCheck } from '@cognitap/radiant'
import {
  colorAPI,
  overrideRole,
  roleNames,
  type ColorInput,
  type ColorRecipe,
  type ColorSession,
  type Mode,
  type Role,
  type WallView
} from './workshop-color.ts'

/* Brand picker: HSV keeps every position inside sRGB, so a drag can never leave the gamut. */

export interface Hsv {
  h: number
  s: number
  v: number
}
export const hexPattern = /^#[0-9a-f]{6}$/i
export function hexToHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  let h = 0
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = (((h * 60) % 360) + 360) % 360
  }
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 }
}
export function hsvToHex(hsv: Hsv): string {
  const h = ((hsv.h % 360) + 360) % 360
  const s = clampTo(hsv.s, 0, 100)
  const v = clampTo(hsv.v, 0, 100)
  const c = (v / 100) * (s / 100)
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v / 100 - c
  const sector = Math.floor(h / 60) % 6
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x]
  ][sector]!
  const channel = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase()
}
export const clampTo = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
/** Named by HSV hue, the picker's own wheel. */
const pickerHueNames: readonly (readonly [string, number])[] = [
  ['red', 0],
  ['orange', 30],
  ['yellow', 60],
  ['lime', 90],
  ['green', 120],
  ['teal', 165],
  ['cyan', 180],
  ['sky', 200],
  ['blue', 240],
  ['violet', 270],
  ['purple', 290],
  ['magenta', 300],
  ['pink', 330],
  ['red', 360]
]
export function pickerHueName(degrees: number): string {
  const h = ((degrees % 360) + 360) % 360
  let best = pickerHueNames[0]!
  for (const entry of pickerHueNames)
    if (Math.abs(entry[1] - h) < Math.abs(best[1] - h)) best = entry
  return best[0]
}
/** Black or white, whichever reads on `hex`. */
export const readableOn = (hex: string) => (luminance(hex) > 0.18 ? '#000000' : '#FFFFFF')

/* Contrast, measured the way the generator audits pairs (WCAG relative luminance). */

export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const linear = (channel: number) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return (
    0.2126 * linear((n >> 16) & 255) + 0.7152 * linear((n >> 8) & 255) + 0.0722 * linear(n & 255)
  )
}
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}

/* Strips: each generator number becomes a slider whose track shows what the number does. */

export type StripField =
  | 'brandVividness'
  | 'vividness'
  | 'distribution'
  | 'neutralTint'
  | 'hueAlignment'
  | 'neutralHue'
/** One band of the track: a wall swatch followed across the strip's range. */
export type Band = readonly [paletteId: string, stop: number]
export interface Strip {
  readonly field: StripField
  readonly label: string
  readonly ends: readonly [string, string]
  readonly min: number
  readonly max: number
  readonly step: number
  /** Shift+arrow moves this far. */
  readonly bigStep: number
  /** Sample positions along the track. */
  readonly samples: number
  /** Undefined in the recipe means the generator chooses. */
  readonly automatic: boolean
  readonly bands: readonly Band[]
  /** Spoken value: plain words first, the number after. */
  readonly words: (value: number) => string
}
const grade = (names: readonly string[]) => (position: number) =>
  names[Math.min(names.length - 1, Math.floor(position * names.length))]!
const vividnessWords = grade(['muted', 'soft', 'balanced', 'vivid', 'intense'])
const spreadWords = grade(['tight', 'compact', 'even', 'wide', 'stretched'])
const tintWords = grade(['plain grey', 'faint tint', 'light tint', 'tinted', 'strong tint'])
const alignmentWords = grade([
  'standard hues',
  'slight shift',
  'leaning to brand',
  'close to brand',
  'matches brand'
])
/** Named hue families and their OKLCH hue, the generator's geometry for naming a grey's hue. */
const hueNames: readonly (readonly [string, number])[] = [
  ['rose', 10],
  ['red', 25],
  ['orange', 55],
  ['amber', 80],
  ['yellow', 100],
  ['lime', 125],
  ['green', 145],
  ['emerald', 165],
  ['teal', 185],
  ['cyan', 205],
  ['sky', 230],
  ['blue', 255],
  ['indigo', 275],
  ['violet', 295],
  ['purple', 315],
  ['pink', 340]
]
export function hueName(degrees: number): string {
  const h = ((degrees % 360) + 360) % 360
  let best = hueNames[0]!
  for (const entry of hueNames)
    if (Math.abs(((entry[1] - h + 540) % 360) - 180) < Math.abs(((best[1] - h + 540) % 360) - 180))
      best = entry
  return best[0]
}
const position = (strip: Pick<Strip, 'min' | 'max'>, value: number) =>
  clampTo((value - strip.min) / (strip.max - strip.min), 0, 0.999)
export const strips: readonly Strip[] = [
  {
    field: 'brandVividness',
    label: 'Brand vividness',
    ends: ['muted', 'vivid'],
    min: 0,
    max: 1,
    step: 0.01,
    bigStep: 0.1,
    samples: 9,
    automatic: true,
    bands: [
      ['brand', 200],
      ['brand', 400],
      ['brand', 800]
    ],
    words: value => `${vividnessWords(value)} (${value.toFixed(2)})`
  },
  {
    field: 'vividness',
    label: 'Wall vividness',
    ends: ['muted', 'vivid'],
    min: 0,
    max: 1,
    step: 0.01,
    bigStep: 0.1,
    samples: 9,
    automatic: true,
    bands: [
      ['rose', 500],
      ['emerald', 500],
      ['sky', 500]
    ],
    words: value => `${vividnessWords(value)} (${value.toFixed(2)})`
  },
  {
    field: 'distribution',
    label: 'Tone spread',
    ends: ['tight', 'wide'],
    min: 0.75,
    max: 1.35,
    step: 0.01,
    bigStep: 0.1,
    samples: 9,
    automatic: false,
    bands: [
      ['brand', 200],
      ['brand', 500],
      ['brand', 800]
    ],
    words: value =>
      `${spreadWords(position({ min: 0.75, max: 1.35 }, value))} (${value.toFixed(2)})`
  },
  {
    field: 'neutralTint',
    label: 'Grey tint',
    ends: ['plain', 'tinted'],
    min: 0,
    max: 0.035,
    step: 0.001,
    bigStep: 0.005,
    samples: 9,
    automatic: false,
    bands: [
      ['neutral', 200],
      ['neutral', 500],
      ['neutral', 800]
    ],
    words: value => `${tintWords(position({ min: 0, max: 0.035 }, value))} (${value.toFixed(3)})`
  },
  {
    field: 'neutralHue',
    label: 'Grey hue',
    ends: ['red', 'red'],
    min: 0,
    max: 359,
    step: 1,
    bigStep: 15,
    samples: 13,
    automatic: false,
    bands: [
      ['neutral', 200],
      ['neutral', 500],
      ['neutral', 800]
    ],
    words: value => `toward ${hueName(value)} (${Math.round(value)}°)`
  },
  {
    field: 'hueAlignment',
    label: 'Family hues',
    ends: ['standard', 'brand'],
    min: 0,
    max: 1,
    step: 0.05,
    bigStep: 0.25,
    samples: 9,
    automatic: false,
    bands: [
      ['red', 500],
      ['green', 500],
      ['blue', 500],
      ['violet', 500]
    ],
    words: value => `${alignmentWords(value)} (${value.toFixed(2)})`
  }
]
export const stripWords = (strip: Strip, value: number, automatic: boolean) =>
  automatic ? `automatic, ${strip.words(value)}` : strip.words(value)
/** The inputs whose walls paint one strip, given everything else as it is now. */
export function stripInputs(strip: Strip, input: ColorInput): ColorInput[] {
  return Array.from({ length: strip.samples }, (_, i) => ({
    ...input,
    [strip.field]: strip.min + ((strip.max - strip.min) * i) / (strip.samples - 1)
  }))
}
export function swatchValue(wall: WallView, [paletteId, stop]: Band): string {
  return (
    wall.color.palettes.find(p => p.id === paletteId)?.swatches.find(s => s.stop === stop)?.value ??
    '#808080'
  )
}
/** Stacked horizontal gradients, one per band, as a CSS background. */
export function bandBackground(walls: readonly (WallView | undefined)[], bands: readonly Band[]) {
  if (walls.some(wall => wall === undefined)) return undefined
  const known = walls as readonly WallView[]
  const rows = bands.length
  return {
    backgroundImage: bands
      .map(
        band =>
          `linear-gradient(to right, ${known.map(wall => swatchValue(wall, band)).join(', ')})`
      )
      .join(', '),
    backgroundSize: `100% ${(100 / rows).toFixed(3)}%`,
    backgroundPosition: bands
      .map((_, i) => `0 ${((100 * i) / Math.max(1, rows - 1)).toFixed(3)}%`)
      .join(', '),
    backgroundRepeat: 'no-repeat'
  }
}

/* Choice cards: each option shows the shades it would produce. */

/** A row of hard-edged swatches as a CSS background. */
export function swatchRow(wall: WallView | undefined, bands: readonly Band[]) {
  if (!wall) return undefined
  const width = 100 / bands.length
  return {
    backgroundImage: `linear-gradient(to right, ${bands
      .map(
        (band, i) =>
          `${swatchValue(wall, band)} ${(i * width).toFixed(3)}% ${((i + 1) * width).toFixed(3)}%`
      )
      .join(', ')})`
  }
}

export type ChoiceField = 'wallPreset' | 'rampPreset' | 'fidelity' | 'lightness'
export interface Choice<V extends string = string> {
  readonly value: V
  readonly label: string
}
export interface ChoiceGroup {
  readonly field: ChoiceField
  readonly label: string
  readonly choices: readonly Choice[]
  /** The recipe this option produces, from the present one. */
  readonly input: (input: ColorInput, value: string) => ColorInput
  readonly bands: readonly Band[]
}
const families500: readonly Band[] = [
  'red',
  'amber',
  'green',
  'teal',
  'blue',
  'violet',
  'pink'
].map(id => [id, 500] as const)
const brandRamp: readonly Band[] = [100, 200, 300, 400, 500, 600, 700, 800, 900].map(
  stop => ['brand', stop] as const
)
export const choiceGroups: readonly ChoiceGroup[] = [
  {
    field: 'wallPreset',
    label: 'Wall preset',
    choices: [
      { value: 'classic', label: 'Classic' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'expressive', label: 'Expressive' }
    ],
    input: (input, value) => {
      const next = { ...input, wallPreset: value as ColorInput['wallPreset'] }
      delete next.vividness
      delete next.neutralTint
      delete next.hueAlignment
      return next
    },
    bands: families500
  },
  {
    field: 'rampPreset',
    label: 'Brand ramp preset',
    choices: [
      { value: 'classic', label: 'Classic' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'expressive', label: 'Expressive' }
    ],
    input: (input, value) => {
      const next = { ...input, rampPreset: value as ColorInput['rampPreset'] }
      delete next.brandVividness
      return next
    },
    bands: brandRamp
  },
  {
    field: 'fidelity',
    label: 'Brand fidelity',
    choices: [
      { value: 'anchored', label: 'Keep brand exact' },
      { value: 'unanchored', label: 'Regular ramp' }
    ],
    input: (input, value) => ({ ...input, fidelity: value as ColorInput['fidelity'] }),
    bands: brandRamp
  },
  {
    field: 'lightness',
    label: 'Lightness model',
    choices: [
      { value: 'hue-aware', label: 'Hue aware' },
      { value: 'shared', label: 'Shared stops' }
    ],
    input: (input, value) => ({ ...input, lightness: value as ColorInput['lightness'] }),
    bands: [
      ['yellow', 500],
      ['lime', 500],
      ['teal', 500],
      ['blue', 500],
      ['violet', 500]
    ]
  }
]

/* Contrast problems land on the control that caused them, with a fix when one exists. */

export interface ContrastFix {
  readonly label: string
  readonly recipe: ColorRecipe
}
export interface ContrastProblem {
  readonly check: PaletteContrastCheck
  readonly mode: Mode
  /** The role whose chip carries the warning. */
  readonly role: Role
  readonly pinned: boolean
  /** True when the automatic choice derived from the brand color fails. */
  readonly brandDerived: boolean
  readonly fix?: ContrastFix
}
const isRole = (name: string): name is Role => Object.hasOwn(roleNames, name)
const samePair = (a: PaletteContrastCheck, b: PaletteContrastCheck) =>
  a.mode === b.mode &&
  a.foregroundRole === b.foregroundRole &&
  a.backgroundRole === b.backgroundRole
const passes = (recipe: ColorRecipe, check: PaletteContrastCheck) =>
  colorAPI.create(recipe).palette.checks.find(c => samePair(c, check))?.pass !== false
/** The wall shade (or black or white) nearest the failing foreground that passes against its background. */
function readableShade(session: ColorSession, check: PaletteContrastCheck): string | undefined {
  const minimum = check.minimum ?? 4.5
  const current = parseInt(check.foreground.slice(1), 16)
  const candidates = [
    '#000000',
    '#FFFFFF',
    ...session.wall.color.palettes.flatMap(p => p.swatches.map(s => s.value))
  ]
  let best: string | undefined
  let distance = Infinity
  for (const value of candidates) {
    if (contrastRatio(value, check.background) < minimum) continue
    const n = parseInt(value.slice(1), 16)
    const d =
      Math.abs(((n >> 16) & 255) - ((current >> 16) & 255)) +
      Math.abs(((n >> 8) & 255) - ((current >> 8) & 255)) +
      Math.abs((n & 255) - (current & 255))
    if (d < distance) {
      distance = d
      best = value
    }
  }
  return best
}
const problems = new WeakMap<ColorSession, readonly ContrastProblem[]>()
export function contrastProblems(session: ColorSession): readonly ContrastProblem[] {
  const known = problems.get(session)
  if (known) return known
  const { recipe } = session
  const result = session.palette.checks
    .filter(check => check.pass === false)
    .map((check): ContrastProblem => {
      const mode = check.mode
      const foreground = isRole(check.foregroundRole) ? check.foregroundRole : 'foreground'
      const background = isRole(check.backgroundRole) ? check.backgroundRole : 'canvas'
      const pins = recipe.modes?.[mode] ?? {}
      const role =
        pins[foreground] !== undefined
          ? foreground
          : pins[background] !== undefined
            ? background
            : foreground
      const pinned = pins[role] !== undefined
      let fix: ContrastFix | undefined
      if (pinned) {
        const unpinned = overrideRole(recipe, mode, role)
        if (passes(unpinned, check)) fix = { label: 'Use the automatic color', recipe: unpinned }
      }
      if (!fix) {
        const shade = readableShade(session, check)
        if (shade) {
          const repinned = overrideRole(recipe, mode, foreground, shade)
          if (passes(repinned, check))
            fix = {
              label:
                luminance(shade) < luminance(check.foreground)
                  ? 'Use a darker shade'
                  : 'Use a lighter shade',
              recipe: repinned
            }
        }
      }
      return {
        check,
        mode,
        role,
        pinned,
        brandDerived:
          !pinned && (role === 'accent' || role === 'accentForeground' || role === 'focus'),
        fix
      }
    })
  problems.set(session, result)
  return result
}
