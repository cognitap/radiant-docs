import { themeDefinitions } from '@cognitap/radiant/examples'
import {
  themeDocumentFromDefinition,
  type ThemeDefinition,
  type TypographyPreset
} from '@cognitap/radiant'
import { initialDocument } from './workshop-theme.ts'
import { colorAPI, type ColorPreset } from './workshop-color.ts'
import { geometryAPI, geometryPreset } from './workshop-geometry.ts'
import { applyTypesetting } from './workshop-typography.ts'
import { chooseMotionPreset, matchingMotionPreset, motionPresets } from './workshop-motion.ts'
import { handoffAPI } from './workshop-handoff.ts'
import { snapshotFromConfiguration, type ThemeSnapshot } from './workshop-snapshot.ts'

export type MotionPresetId = (typeof motionPresets)[number]['id']
/** One decision per editor for the brand-color start; every value is a preset the editors
    already offer, so the theme round-trips through export and import unchanged. */
export interface StartingRecipe {
  brand: string
  wall: ColorPreset
  ramp: ColorPreset
  typography: TypographyPreset
  geometry: string
  motion: MotionPresetId
}
export interface StartingTheme {
  id: string
  name: string
  /** A few words of character, read after the name: "Start from Jelly: clay, squishy, playful". */
  character: string
  definition: ThemeDefinition
}

export const defaultRecipe: StartingRecipe = {
  brand: '#7C3AED',
  wall: 'balanced',
  ramp: 'balanced',
  typography: 'inter',
  geometry: 'balanced',
  motion: 'restrained'
}
const characters: Record<string, string> = {
  radiant: 'calm green, balanced',
  default: 'the neutral baseline',
  'soft-squircle': 'soft, filled, rounded',
  'sharp-3d': 'neo-brutalist, hard shadows',
  glass: 'frosted, translucent, airy',
  jelly: 'clay, squishy, playful',
  ticket: 'printed stub, uppercase',
  neon: 'sci-fi glow, cut corners',
  editorial: 'serif, hairlines, underlines'
}
/** Radiant's example themes, so the workshop and the docs pages start from the same values. */
export const startingThemes: readonly StartingTheme[] = themeDefinitions.map(definition => ({
  id: definition.id,
  name: definition.name,
  character: characters[definition.id] ?? definition.name,
  definition
}))

/** A hand-authored theme keeps its values exactly; Color and Spacing offer to adopt a recipe. */
export function exampleSnapshot(theme: StartingTheme): ThemeSnapshot {
  return { document: themeDocumentFromDefinition(theme.definition), color: null, geometry: null }
}
/** Build a snapshot from a recipe. Motion is authored only when the preset differs from what the
    document already resolves to, so the library default stays unauthored and exports stay lean. */
export function startingSnapshot(recipe: StartingRecipe): ThemeSnapshot {
  const geometry = geometryPreset(recipe.geometry)
  const color = colorAPI.create({
    input: { brand: recipe.brand, wallPreset: recipe.wall, rampPreset: recipe.ramp }
  })
  let document = applyTypesetting(initialDocument(), { preset: recipe.typography })
  document = geometryAPI.apply(document, geometry)
  if (matchingMotionPreset(document) !== recipe.motion)
    document = chooseMotionPreset(document, recipe.motion)
  return { document: colorAPI.apply(document, color), color: color.recipe, geometry }
}
export function brandSnapshot(brand: string): ThemeSnapshot {
  return startingSnapshot({ ...defaultRecipe, brand })
}
/** A shared theme is a full configuration; a section file has nothing to start from. */
export function readSharedTheme(text: string): ThemeSnapshot {
  const data = handoffAPI.read(text)
  if (data.kind !== 'radiant-workshop')
    throw new Error('A shared theme needs a full workshop configuration or theme document.')
  return snapshotFromConfiguration(data)
}
