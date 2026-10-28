import { updateThemeAppearance, type ThemeGeometrySettings } from '@cognitap/radiant'
import { readThemeDocument } from './workshop-theme.ts'

// The editor materialises every bounded geometry control; Radiant owns token mapping.
export type GeometrySettings = Required<ThemeGeometrySettings>
export type GeometryScope = 'shared' | 'light' | 'dark'
export interface GeometryRecipe {
  values: GeometrySettings
  modes?: { light?: Partial<GeometrySettings>; dark?: Partial<GeometrySettings> }
}
export const geometryAPI = {
  apply: (document: object, recipe: GeometryRecipe): object =>
    updateThemeAppearance(readThemeDocument(document), { geometry: recipe })
}

const balanced: GeometrySettings = {
  spacing: 1,
  density: 1,
  controlRadius: 8,
  surfaceRadius: 12,
  controlBorderWidth: 1,
  surfaceBorderWidth: 1,
  borderStyle: 'solid',
  elevation: 1,
  backdropOpacity: 0.45
}
export const geometryPresets: {
  id: string
  name: string
  values: GeometrySettings
  darkBackdrop: number
}[] = [
  { id: 'balanced', name: 'Balanced', values: balanced, darkBackdrop: 0.65 },
  {
    id: 'compact',
    name: 'Compact',
    values: {
      ...balanced,
      spacing: 0.75,
      density: 0.9,
      controlRadius: 4,
      surfaceRadius: 8,
      elevation: 0,
      backdropOpacity: 0.4
    },
    darkBackdrop: 0.6
  },
  {
    id: 'spacious',
    name: 'Spacious',
    values: {
      ...balanced,
      spacing: 1.5,
      density: 1.2,
      controlRadius: 12,
      surfaceRadius: 24,
      elevation: 2,
      backdropOpacity: 0.5
    },
    darkBackdrop: 0.75
  },
  {
    id: 'square',
    name: 'Square & flat',
    values: {
      ...balanced,
      controlRadius: 0,
      surfaceRadius: 0,
      controlBorderWidth: 2,
      surfaceBorderWidth: 2,
      elevation: 0
    },
    darkBackdrop: 0.65
  }
]
export function geometryPreset(id = 'balanced'): GeometryRecipe {
  const preset = geometryPresets.find(item => item.id === id)
  if (!preset) throw new Error(`Unknown geometry preset: ${id}`)
  return { values: { ...preset.values }, modes: { dark: { backdropOpacity: preset.darkBackdrop } } }
}
export function geometryValues(recipe: GeometryRecipe, scope: GeometryScope): GeometrySettings {
  return { ...recipe.values, ...(scope === 'shared' ? {} : recipe.modes?.[scope]) }
}
export function changeGeometry(
  recipe: GeometryRecipe,
  scope: GeometryScope,
  patch: Partial<GeometrySettings>
): GeometryRecipe {
  return scope === 'shared'
    ? { ...recipe, values: { ...recipe.values, ...patch } }
    : { ...recipe, modes: { ...recipe.modes, [scope]: { ...recipe.modes?.[scope], ...patch } } }
}
export function clearGeometryOverride(
  recipe: GeometryRecipe,
  scope: 'light' | 'dark',
  key?: keyof GeometrySettings
): GeometryRecipe {
  const values = { ...recipe.modes?.[scope] }
  if (key) delete values[key]
  const modes = { ...recipe.modes }
  if (key && Object.keys(values).length) modes[scope] = values
  else delete modes[scope]
  return { ...recipe, modes: Object.keys(modes).length ? modes : undefined }
}
export function matchingGeometryPreset(recipe: GeometryRecipe): string {
  return (
    geometryPresets.find(preset => {
      const candidate = geometryPreset(preset.id)
      return (Object.keys(balanced) as (keyof GeometrySettings)[]).every(
        key =>
          recipe.values[key] === candidate.values[key] &&
          recipe.modes?.light?.[key] === candidate.modes?.light?.[key] &&
          recipe.modes?.dark?.[key] === candidate.modes?.dark?.[key]
      )
    })?.id ?? 'custom'
  )
}
/** Shared values are what the dials show; mode fields are the overrides themselves. */
export type GeometryFields = { preset: string } & {
  [K in `shared.${keyof GeometrySettings}`]: number | string
} & { [K in `${'light' | 'dark'}.${keyof GeometrySettings}`]: number | string | undefined }
export function geometryFields(recipe: GeometryRecipe): GeometryFields {
  const fields: Record<string, number | string | undefined> = {
    preset: matchingGeometryPreset(recipe)
  }
  for (const key of Object.keys(balanced) as (keyof GeometrySettings)[]) {
    fields[`shared.${key}`] = recipe.values[key]
    fields[`light.${key}`] = recipe.modes?.light?.[key]
    fields[`dark.${key}`] = recipe.modes?.dark?.[key]
  }
  return fields as GeometryFields
}
export const geometryDials = [
  { key: 'spacing', label: 'Breathing room', min: 0.5, max: 2, step: 0.05, unit: '×' },
  { key: 'density', label: 'Density', min: 0.75, max: 1.5, step: 0.05, unit: '×' },
  { key: 'controlRadius', label: 'Control roundness', min: 0, max: 32, step: 1, unit: 'px' },
  { key: 'surfaceRadius', label: 'Surface roundness', min: 0, max: 48, step: 1, unit: 'px' },
  { key: 'controlBorderWidth', label: 'Control borders', min: 0, max: 4, step: 0.25, unit: 'px' },
  { key: 'surfaceBorderWidth', label: 'Surface borders', min: 0, max: 4, step: 0.25, unit: 'px' },
  { key: 'backdropOpacity', label: 'Backdrop dim', min: 0, max: 0.9, step: 0.05, unit: '' }
] as const
// Actual resolved values from the public Theme ABI, including independent fonts.
export const geometryMetrics: readonly (readonly [string, `--rad-${string}`])[] = [
  ['Label gap', '--rad-spacing-label-gap'],
  ['Field gap', '--rad-spacing-field-gap'],
  ['Group gap', '--rad-spacing-group-gap'],
  ['Header gap', '--rad-spacing-header-gap'],
  ['Footer gap', '--rad-spacing-footer-gap'],
  ['Panel padding', '--rad-surface-padding'],
  ['Panel gap', '--rad-surface-gap'],
  ...(['small', 'medium', 'large'] as const).flatMap<readonly [string, `--rad-${string}`]>(size => [
    [`${size} height`, `--rad-control-${size}-height`],
    [`${size} horizontal padding`, `--rad-control-${size}-padding-inline`],
    [`${size} indicator`, `--rad-control-${size}-indicator-size`],
    [`${size} font size`, `--rad-control-${size}-font-size`]
  ]),
  ['Control radius', '--rad-control-radius'],
  ['Surface radius', '--rad-surface-radius'],
  ['Control border width', '--rad-control-border-width'],
  ['Surface border width', '--rad-surface-border-width'],
  ['Control border style', '--rad-control-border-style'],
  ['Surface border style', '--rad-surface-border-style'],
  ['Panel shadow', '--rad-surface-shadow'],
  ['Overlay shadow', '--rad-surface-overlay-shadow'],
  ['Modal backdrop', '--rad-surface-backdrop']
]
