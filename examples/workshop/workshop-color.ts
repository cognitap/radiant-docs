import {
  colorCalibrationPresets,
  generateColorWall,
  recommendColorPalette,
  updateThemeAppearance,
  type SharedTokens,
  type ColorCalibrationPreset,
  type ColorWallInput,
  type ColorWall,
  type ColorPalette,
  type WorkingPaletteRole
} from '@cognitap/radiant'
import { readThemeDocument } from './workshop-theme.ts'

export type ColorPreset = ColorCalibrationPreset
export type ColorInput = ColorWallInput
export type WorkingRole = WorkingPaletteRole
export type Role = keyof SharedTokens['color'] | 'canvas'
export type Mode = 'light' | 'dark'
export interface ColorRecipe {
  input: ColorInput
  working?: Partial<Record<WorkingRole, string>>
  modes?: Partial<Record<Mode, Partial<Record<Role, string>>>>
}
export type WallView = ColorWall
export type PaletteView = ColorPalette
export interface ColorSession {
  recipe: ColorRecipe
  wall: WallView
  palette: PaletteView
}
export const colorPresets = colorCalibrationPresets
// The shell derives the session from the recipe it stores, so the same recipe
// object is created once for the edit and again for the view.
const sessions = new WeakMap<ColorRecipe, ColorSession>()
export const colorAPI = {
  create(recipe: ColorRecipe): ColorSession {
    const known = sessions.get(recipe)
    if (known) return known
    const wall = generateColorWall(recipe.input)
    const palette = recommendColorPalette(wall, { working: recipe.working, modes: recipe.modes })
    const session: ColorSession = {
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
    sessions.set(recipe, session)
    sessions.set(session.recipe, session)
    return session
  },
  apply(document: object, session: ColorSession): object {
    return updateThemeAppearance(readThemeDocument(document), { palette: session.palette })
  }
}
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
export function chooseWorkingFamily(
  recipe: ColorRecipe,
  name: WorkingRole,
  paletteId?: string
): ColorRecipe {
  const working = { ...recipe.working }
  if (paletteId === undefined) delete working[name]
  else working[name] = paletteId
  return { ...recipe, working: Object.keys(working).length ? working : undefined }
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

/** Generator dials show their resolved value; vividness, families and roles are overrides. */
export type ColorFields = {
  brand: string
  wallPreset: ColorPreset
  rampPreset: ColorPreset
  fidelity: 'anchored' | 'unanchored'
  lightness: 'hue-aware' | 'shared'
  vividness: number | undefined
  brandVividness: number | undefined
  distribution: number
  neutralTint: number
  hueAlignment: number
  neutralHue: number
} & { [K in `working.${WorkingRole}`]: string | undefined } & {
  [K in `role.${Mode}.${Role}`]: string | undefined
}
export function colorFields(session: ColorSession): ColorFields {
  const { input } = session.wall
  const fields: Record<string, string | number | undefined> = {
    brand: input.brand,
    wallPreset: input.wallPreset,
    rampPreset: input.rampPreset,
    fidelity: input.fidelity,
    lightness: input.lightness,
    vividness: session.recipe.input.vividness,
    brandVividness: session.recipe.input.brandVividness,
    distribution: input.distribution,
    neutralTint: input.neutralTint,
    hueAlignment: input.hueAlignment,
    neutralHue: input.neutralHue
  }
  for (const name of workingRoles) fields[`working.${name}`] = session.recipe.working?.[name]
  for (const mode of ['light', 'dark'] as const)
    for (const role of Object.keys(roleNames) as Role[])
      fields[`role.${mode}.${role}`] = session.recipe.modes?.[mode]?.[role]
  return fields as ColorFields
}
