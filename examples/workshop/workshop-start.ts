import type { TypographyPreset } from '@cognitap/radiant'
import { initialDocument } from './workshop-theme.ts'
import { colorAPI, type ColorPreset } from './workshop-color.ts'
import { geometryAPI, geometryPreset } from './workshop-geometry.ts'
import { applyTypesetting } from './workshop-typography.ts'
import { chooseMotionPreset, matchingMotionPreset, motionPresets } from './workshop-motion.ts'
import { handoffAPI } from './workshop-handoff.ts'
import { snapshotFromConfiguration, type ThemeSnapshot } from './workshop-snapshot.ts'

export type MotionPresetId = (typeof motionPresets)[number]['id']
/** One decision per editor; every value is a preset the editors already offer, so the theme
    round-trips through export and import unchanged. */
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
  /** A few words of character, read after the name: "Start from Editorial: warm serif, roomy". */
  character: string
  recipe: StartingRecipe
}

export const defaultRecipe: StartingRecipe = {
  brand: '#7C3AED',
  wall: 'balanced',
  ramp: 'balanced',
  typography: 'inter',
  geometry: 'balanced',
  motion: 'restrained'
}
export const startingThemes: readonly StartingTheme[] = [
  {
    id: 'radiant',
    name: 'Radiant',
    character: 'calm violet, balanced',
    recipe: defaultRecipe
  },
  {
    id: 'editorial',
    name: 'Editorial',
    character: 'warm serif, roomy',
    recipe: {
      brand: '#9A3412',
      wall: 'classic',
      ramp: 'classic',
      typography: 'source-serif',
      geometry: 'spacious',
      motion: 'restrained'
    }
  },
  {
    id: 'ledger',
    name: 'Ledger',
    character: 'dense, built for data',
    recipe: {
      brand: '#0F5F8F',
      wall: 'balanced',
      ramp: 'classic',
      typography: 'plex',
      geometry: 'compact',
      motion: 'restrained'
    }
  },
  {
    id: 'marquee',
    name: 'Marquee',
    character: 'bold color, lively motion',
    recipe: {
      brand: '#DB2777',
      wall: 'expressive',
      ramp: 'expressive',
      typography: 'inter',
      geometry: 'spacious',
      motion: 'expressive'
    }
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    character: 'square, flat, technical',
    recipe: {
      brand: '#1D4ED8',
      wall: 'classic',
      ramp: 'balanced',
      typography: 'plex',
      geometry: 'square',
      motion: 'restrained'
    }
  },
  {
    id: 'linen',
    name: 'Linen',
    character: 'quiet neutrals, soft edges',
    recipe: {
      brand: '#3F6F63',
      wall: 'balanced',
      ramp: 'classic',
      typography: 'source-serif',
      geometry: 'balanced',
      motion: 'restrained'
    }
  }
]
export const defaultTheme = startingThemes[0]

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
