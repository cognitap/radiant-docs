import * as Radiant from '@cognitap/radiant'
import type { SharedTokens } from '@cognitap/radiant'

// Temporary consumption types for the published pin/candidate seam. All color
// generation, recommendation, validation and document application stay in Radiant.
export type ColorPreset = 'classic' | 'balanced' | 'expressive'
export interface ColorInput {
  brand: string
  fidelity?: 'anchored' | 'unanchored'
  wallPreset?: ColorPreset
  rampPreset?: ColorPreset
  vividness?: number
  brandVividness?: number
  lightness?: 'hue-aware' | 'shared'
  distribution?: number
  neutralTint?: number
  hueAlignment?: number
  neutralHue?: number
}
export type WorkingRole = 'primary' | 'support' | 'neutral' | 'success' | 'warning' | 'danger'
export type Role = keyof SharedTokens['color'] | 'canvas'
export type Mode = 'light' | 'dark'
export interface ColorRecipe {
  input: ColorInput
  working?: Partial<Record<WorkingRole, string>>
  modes?: Partial<Record<Mode, Partial<Record<Role, string>>>>
}
export interface WallView {
  input: Required<ColorInput>
  neutralInput: boolean
  color: {
    brand: { value: string; gamut: string }
    anchor?: { paletteId: string; stop: number }
    palettes: { id: string; name: string; swatches: { stop: number; value: string }[] }[]
  }
}
export interface PaletteView {
  working: Record<
    WorkingRole,
    {
      paletteId: string
      light: { background: string; foreground: string }
      dark: { background: string; foreground: string }
    }
  >
  color: { modes: Record<Mode, SharedTokens['color']> }
  surface: { modes: Record<Mode, { canvas: string }> }
  checks: {
    mode: Mode
    foregroundRole: string
    backgroundRole: string
    foreground: string
    background: string
    ratio: number
    minimum: number | null
    pass: boolean | null
    message: string
  }[]
  pass: boolean
}
export interface ColorSession {
  recipe: ColorRecipe
  wall: WallView
  palette: PaletteView
}
const packageExports: object = Radiant
export const colorPresets = (Reflect.get(packageExports, 'colorCalibrationPresets') ??
  []) as readonly { id: ColorPreset; name: string; description: string }[]
const generate = Reflect.get(packageExports, 'generateColorWall')
const recommend = Reflect.get(packageExports, 'recommendColorPalette')
const apply = Reflect.get(packageExports, 'updateThemeAppearance')
export const colorAPI =
  colorPresets.length === 3 &&
  typeof generate === 'function' &&
  typeof recommend === 'function' &&
  typeof apply === 'function'
    ? {
        create(recipe: ColorRecipe): ColorSession {
          const wall = generate(recipe.input) as WallView
          const palette = recommend(wall, {
            working: recipe.working,
            modes: recipe.modes
          }) as PaletteView
          return {
            recipe: {
              ...recipe,
              input: {
                ...recipe.input,
                wallPreset: wall.input.wallPreset,
                rampPreset: wall.input.rampPreset
              }
            },
            wall,
            palette
          }
        },
        apply(document: object, session: ColorSession): object {
          return apply(document, { palette: session.palette })
        }
      }
    : null
export function defaultColorRecipe(): ColorRecipe {
  return { input: { brand: '#7C3AED', wallPreset: 'balanced', rampPreset: 'balanced' } }
}
export const workingRoles: WorkingRole[] = [
  'primary',
  'support',
  'neutral',
  'success',
  'warning',
  'danger'
]
export const roleNames: Record<Role, string> = {
  canvas: 'Canvas',
  surface: 'Surface',
  foreground: 'Foreground',
  mutedForeground: 'Secondary text',
  placeholder: 'Placeholder',
  border: 'Border',
  focus: 'Focus',
  invalid: 'Invalid feedback',
  accent: 'Action fill',
  accentForeground: 'Action text',
  neutral: 'Neutral fill',
  neutralForeground: 'Neutral text',
  warning: 'Warning fill',
  warningForeground: 'Warning text',
  danger: 'Danger fill',
  dangerForeground: 'Danger text',
  disabledBackground: 'Disabled background',
  disabledBorder: 'Disabled border'
}
export function roleValue(session: ColorSession, mode: Mode, role: Role): string {
  return role === 'canvas'
    ? session.palette.surface.modes[mode].canvas
    : session.palette.color.modes[mode][role]
}
export function overrideRole(
  recipe: ColorRecipe,
  mode: Mode,
  role: Role,
  value?: string
): ColorRecipe {
  const values = { ...recipe.modes?.[mode] }
  if (value === undefined) delete values[role]
  else values[role] = value
  return { ...recipe, modes: { ...recipe.modes, [mode]: values } }
}

/** Selecting a preset resets only its owned dials; role pins and the other preset survive. */
export function selectColorPreset(
  recipe: ColorRecipe,
  section: 'wall' | 'ramp',
  preset: ColorPreset
): ColorRecipe {
  const input = { ...recipe.input }
  if (section === 'wall') {
    input.wallPreset = preset
    delete input.vividness
    delete input.neutralTint
    delete input.hueAlignment
  } else {
    input.rampPreset = preset
    delete input.brandVividness
  }
  return { ...recipe, input }
}
