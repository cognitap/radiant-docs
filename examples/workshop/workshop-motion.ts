import {
  compileThemeDocument,
  defineMotionProfile,
  updateThemeDocument,
  type MotionInteraction,
  type MotionProfileInput,
  type SpringParameters,
  type Theme
} from '@cognitap/radiant'
import { readThemeDocument } from './workshop-theme.ts'

export type MotionScope = 'shared' | MotionInteraction
export const motionScopes: readonly { id: MotionScope; label: string }[] = [
  { id: 'shared', label: 'Common physics' },
  { id: 'press', label: 'Button press' },
  { id: 'disclosure', label: 'Disclosure' },
  { id: 'dialog', label: 'Dialog' },
  { id: 'drag', label: 'Drag & snap' },
  { id: 'follow', label: 'Following values' },
  { id: 'layout', label: 'Layout' }
]
export const motionPresets = [
  {
    id: 'restrained',
    name: 'Restrained',
    description: 'A firm response with a quiet finish.',
    spring: { stiffness: 320, damping: 30, mass: 1 }
  },
  {
    id: 'expressive',
    name: 'Expressive',
    description: 'A softer response with visible overshoot.',
    spring: { stiffness: 220, damping: 14, mass: 1 }
  }
] as const
export const motionDials: readonly {
  key: keyof SpringParameters
  label: string
  max: number
  help: string
}[] = [
  {
    key: 'stiffness',
    label: 'Stiffness',
    max: 10000,
    help: 'Higher values pull toward the destination more strongly.'
  },
  {
    key: 'damping',
    label: 'Damping',
    max: 10000,
    help: 'Higher values remove more motion and reduce overshoot.'
  },
  { key: 'mass', label: 'Mass', max: 100, help: 'Higher values give the response more inertia.' }
]
export function authoredMotion(document: object): MotionProfileInput {
  return readThemeDocument(document).sections.motion?.profile ?? {}
}
export function applyMotion(document: object, profile: MotionProfileInput): object {
  defineMotionProfile(profile)
  const current = readThemeDocument(document)
  // Replace only this section so deleting an interaction restores inheritance.
  // Legacy CSS values/modes in the section remain authored.
  return updateThemeDocument(
    current,
    { motion: { ...current.sections.motion, profile } },
    'replace'
  )
}
export function changeMotion(
  document: object,
  scope: MotionScope,
  patch: Partial<SpringParameters>
): object {
  const profile = authoredMotion(document)
  return applyMotion(
    document,
    scope === 'shared'
      ? { ...profile, spring: { ...profile.spring, ...patch } }
      : {
          ...profile,
          interactions: {
            ...profile.interactions,
            [scope]: { ...profile.interactions?.[scope], ...patch }
          }
        }
  )
}
export function clearMotionOverride(
  document: object,
  scope: MotionInteraction,
  key: keyof SpringParameters
): object {
  const profile = authoredMotion(document)
  const interaction = { ...profile.interactions?.[scope] }
  delete interaction[key]
  const interactions = { ...profile.interactions }
  if (Object.keys(interaction).length) interactions[scope] = interaction
  else delete interactions[scope]
  return applyMotion(document, { ...profile, interactions })
}
export function inheritMotion(document: object, scope: MotionScope): object {
  const profile = authoredMotion(document)
  if (scope === 'shared') {
    const { spring: _spring, ...rest } = profile
    return applyMotion(document, rest)
  }
  const interactions = { ...profile.interactions }
  delete interactions[scope]
  return applyMotion(document, { ...profile, interactions })
}
export function chooseMotionPreset(document: object, id: string): object {
  const preset = motionPresets.find(item => item.id === id)
  if (!preset) throw new TypeError('Unknown motion starting point.')
  return applyMotion(document, {
    ...authoredMotion(document),
    spring: preset.spring,
    interactions: {}
  })
}
export function matchingMotionPreset(document: object): string {
  const input = authoredMotion(document)
  if (Object.values(input.interactions ?? {}).some(value => Object.keys(value).length))
    return 'custom'
  const current = defineMotionProfile(input).spring
  return (
    motionPresets.find(preset =>
      motionDials.every(({ key }) => preset.spring[key] === current[key])
    )?.id ?? 'custom'
  )
}
/** Common physics shows resolved values; interaction fields are the overrides themselves. */
export type MotionFields = {
  preset: string
  mode: 'system' | 'off'
} & { [K in `shared.${keyof SpringParameters}`]: number } & {
  [K in `${MotionInteraction}.${keyof SpringParameters}`]: number | undefined
}
export function motionFields(document: object): MotionFields {
  const input = authoredMotion(document)
  const resolved = defineMotionProfile(input)
  const fields: Record<string, string | number | undefined> = {
    preset: matchingMotionPreset(document),
    mode: resolved.mode
  }
  for (const { key } of motionDials) {
    fields[`shared.${key}`] = resolved.spring[key]
    for (const { id } of motionScopes)
      if (id !== 'shared') fields[`${id}.${key}`] = input.interactions?.[id]?.[key]
  }
  return fields as MotionFields
}
export type MotionTreatment = 'current' | 'restrained' | 'expressive' | 'off' | 'reduced'
/** Comparison is preview-only. Reduced preview resolves to the runtime's spatial-off policy. */
export function motionPreview(document: object, treatment: MotionTreatment): Theme {
  if (treatment === 'current') return compileThemeDocument(readThemeDocument(document))
  if (treatment === 'off' || treatment === 'reduced')
    return compileThemeDocument(
      readThemeDocument(applyMotion(document, { ...authoredMotion(document), mode: 'off' }))
    )
  const preview = chooseMotionPreset(document, treatment)
  return compileThemeDocument(
    readThemeDocument(applyMotion(preview, { ...authoredMotion(preview), mode: 'system' }))
  )
}
