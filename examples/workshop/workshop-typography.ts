import {
  generateTypography,
  typographyPresets,
  updateThemeDocument,
  type ThemeFontMetadata,
  type TypographyAssignment,
  type TypographyFont,
  type TypographyInput,
  type TypographyPreset,
  type TypographyProfile,
  type TypographyProseRhythm,
  type TypographyResult,
  type TypographyRole,
  type TypographyStyle,
  type TypographyUIRhythm
} from '@cognitap/radiant'
import { readThemeDocument } from './workshop-theme.ts'
import { curatedFonts, fontFamily, type TrialFont } from './workshop-fonts.ts'

export const proseKeys = [
  'size',
  'lineHeight',
  'paragraphSpacing',
  'measure',
  'headingScale'
] as const satisfies readonly (keyof TypographyProseRhythm)[]
export const uiKeys = [
  'size',
  'lineHeight'
] as const satisfies readonly (keyof TypographyUIRhythm)[]
export const styleKeys = [
  'assignment',
  'narrow',
  'wide',
  'weight',
  'lineHeight',
  'tracking',
  'measure'
] as const satisfies readonly (keyof TypographyStyle)[]

export const startingPoints = (Object.keys(typographyPresets) as TypographyPreset[]).map(id => ({
  id,
  name: typographyPresets[id].name
}))
export const assignments: readonly TypographyAssignment[] = ['body', 'headings', 'ui', 'code']
export const assignmentName = (value: TypographyAssignment) =>
  value === 'ui' ? 'UI' : value[0].toUpperCase() + value.slice(1)
export const styleName = (role: string) =>
  role
    .split('-')
    .map(word => (word === 'ui' ? 'UI' : word[0].toUpperCase() + word.slice(1)))
    .join(' / ')
export function documentTypesetting(document: object): TypographyResult | null {
  const input = readThemeDocument(document).sections.typography?.typesetting
  return input === undefined ? null : generateTypography(input)
}
export function assignedTrial(
  font: TypographyFont,
  local?: TrialFont | null
): TrialFont | undefined {
  if (font.profile !== 'manual') return curatedFonts.find(item => item.id === font.profile)
  return local && font.family === fontFamily(local) ? local : undefined
}
export function chooseAssignment(
  input: TypographyInput,
  assignment: TypographyAssignment,
  font: TrialFont
): TypographyInput {
  if (!font.styles.includes('normal'))
    throw new Error('A normal file is required for an assignment.')
  return {
    ...input,
    fonts: {
      ...input.fonts,
      [assignment]: {
        family: fontFamily(font),
        profile: font.source === 'catalog' ? (font.id as TypographyProfile) : 'manual'
      }
    }
  }
}
type Mutable<T> = { -readonly [K in keyof T]: T[K] }
/** A curated font is its profile id; a manual assignment is its family stack. */
export const fontField = (font: TypographyFont) =>
  font.profile === 'manual' ? font.family : font.profile
export const fontFieldName = (value: string) =>
  curatedFonts.find(font => font.id === value)?.family ?? value
export function assignFamily(
  input: TypographyInput,
  assignment: TypographyAssignment,
  value: string,
  local?: TrialFont | null
): TypographyInput {
  const trial =
    curatedFonts.find(font => font.id === value) ??
    (local && fontFamily(local) === value ? local : undefined)
  if (trial) return chooseAssignment(input, assignment, trial)
  return {
    ...input,
    fonts: { ...input.fonts, [assignment]: { family: value, profile: 'manual' } }
  }
}
export function setRhythm(
  input: TypographyInput,
  context: 'prose' | 'ui',
  key: keyof TypographyProseRhythm,
  value: number | undefined
): TypographyInput {
  const rhythm: Record<string, number | undefined> = { ...input[context] }
  if (value === undefined) delete rhythm[key]
  else rhythm[key] = value
  return { ...input, [context]: rhythm }
}
export function setStyle<K extends keyof TypographyStyle>(
  input: TypographyInput,
  role: TypographyRole,
  key: K,
  value: TypographyStyle[K] | undefined
): TypographyInput {
  const style: Partial<Mutable<TypographyStyle>> = { ...input.styles?.[role] }
  if (value === undefined) delete style[key]
  else style[key] = value
  return { ...input, styles: { ...input.styles, [role]: style } }
}
export function resetRhythm(input: TypographyInput, context: 'prose' | 'ui'): TypographyInput {
  const next: Mutable<TypographyInput> = { ...input }
  delete next[context]
  return next
}
export function resetTextStyle(input: TypographyInput, role: TypographyRole): TypographyInput {
  const styles: Mutable<NonNullable<TypographyInput['styles']>> = { ...input.styles }
  delete styles[role]
  return { ...input, styles }
}
export function applyTypesetting(
  document: object,
  input: TypographyInput,
  local?: TrialFont | null,
  reset = false
): object {
  const current = readThemeDocument(document)
  const result = generateTypography(input)
  const fonts = result.input.fonts!
  const metadata: ThemeFontMetadata[] = []
  for (const assignment of assignments) {
    const font = fonts[assignment]!
    const known = assignedTrial(font, local)
    const previous = current.sections.typography?.fonts?.find(
      item => item.id === `typesetting-${assignment}`
    )
    const samePrevious =
      previous &&
      (previous.family === font.family ||
        font.family.startsWith(JSON.stringify(previous.family) + ','))
        ? previous
        : undefined
    const weights = [
      ...new Set(
        Object.values(result.styles)
          .filter(style => style.assignment === assignment)
          .map(style => style.weight)
      )
    ].sort((a, b) => a - b)
    metadata.push({
      id: `typesetting-${assignment}`,
      family: known?.family ?? samePrevious?.family ?? font.family,
      source: known?.source ?? samePrevious?.source ?? 'system',
      weights,
      styles: known?.styles ?? samePrevious?.styles ?? ['normal'],
      axes: known?.axes ?? samePrevious?.axes ?? []
    })
  }
  const previous = current.sections.typography ?? {}
  const sections = {
    typography: {
      ...(reset ? {} : previous),
      typesetting: result.input,
      fonts: [
        ...(reset ? [] : (previous.fonts ?? [])).filter(
          font => !font.id.startsWith('typesetting-')
        ),
        ...metadata
      ]
    }
  }
  const parsed = readThemeDocument({ ...current, sections: { ...current.sections, ...sections } })
  return updateThemeDocument(current, { typography: parsed.sections.typography }, 'replace')
}

/** Preset and families are explicit; rhythm and style fields are the manual overrides. */
type NumericStyleKey = Exclude<(typeof styleKeys)[number], 'assignment'>
export type TypographyFields = { preset: TypographyPreset | undefined } & {
  [K in `font.${TypographyAssignment}`]: string
} & { [K in `prose.${(typeof proseKeys)[number]}`]: number | undefined } & {
  [K in `ui.${(typeof uiKeys)[number]}`]: number | undefined
} & { [K in `style.${TypographyRole}.assignment`]: TypographyAssignment | undefined } & {
  [K in `style.${TypographyRole}.${NumericStyleKey}`]: number | undefined
}
export function typographyFields(result: TypographyResult): TypographyFields {
  const { input } = result
  const fields: Record<string, string | number | undefined> = { preset: input.preset }
  for (const assignment of assignments) {
    const font = input.fonts?.[assignment]
    fields[`font.${assignment}`] = font && fontField(font)
  }
  for (const key of proseKeys) fields[`prose.${key}`] = input.prose?.[key]
  for (const key of uiKeys) fields[`ui.${key}`] = input.ui?.[key]
  for (const role of Object.keys(result.styles) as TypographyRole[])
    for (const key of styleKeys) fields[`style.${role}.${key}`] = input.styles?.[role]?.[key]
  return fields as TypographyFields
}
