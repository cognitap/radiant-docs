import * as Radiant from '@cognitap/radiant'
import type { ThemeFontMetadata } from '@cognitap/radiant'
import { readThemeDocument } from './workshop-theme.ts'
import { curatedFonts, fontFamily, type FontContext, type TrialFont } from './workshop-fonts.ts'

// Editor-facing shape of the consumed public generator. This temporary capability
// seam keeps npm 0.0.4 builds valid until chapter publication; no calculation or
// validation is reimplemented here. The matching package owns both.
export type Assignment = FontContext
export type ProseRhythm = {
  size: number
  lineHeight: number
  paragraphSpacing: number
  measure: number
  headingScale: number
}
export type UIRhythm = { size: number; lineHeight: number }
export type TextStyle = {
  assignment: Assignment
  narrow: number
  wide: number
  weight: number
  lineHeight: number
  tracking: number
  measure: number
}
export type AssignedFont = { family: string; profile: string }
export interface TypesettingInput {
  preset?: string
  fonts?: Partial<Record<Assignment, AssignedFont>>
  prose?: Partial<ProseRhythm>
  ui?: Partial<UIRhythm>
  styles?: Record<string, Partial<TextStyle>>
}
export interface TypesettingResult {
  input: TypesettingInput
  prose: ProseRhythm
  ui: UIRhythm
  styles: Record<string, TextStyle>
  recommendations: { body: boolean; ui: boolean }
  warnings: readonly {
    role: string
    requestedWeight: number
    supportedWeights: readonly [number, number]
  }[]
}
const generate = Reflect.get(Radiant, 'generateTypography') as
  | undefined
  | ((input?: unknown) => TypesettingResult)
const presets = Reflect.get(Radiant, 'typographyPresets') as
  | undefined
  | Record<string, { name: string }>
export const typesettingAvailable = typeof generate === 'function' && !!presets
export const startingPoints = Object.entries(presets ?? {}).map(([id, value]) => ({
  id,
  name: value.name
}))
export const assignments: readonly Assignment[] = ['body', 'headings', 'ui', 'code']
export const assignmentName = (value: Assignment) =>
  value === 'ui' ? 'UI' : value[0].toUpperCase() + value.slice(1)
export const styleName = (role: string) =>
  role
    .split('-')
    .map(word => (word === 'ui' ? 'UI' : word[0].toUpperCase() + word.slice(1)))
    .join(' / ')
export function resolveTypesetting(input: unknown = {}): TypesettingResult {
  if (!typesettingAvailable)
    throw new Error('This installed package does not provide typography roles.')
  return generate!(input)
}
export function documentTypesetting(document: object): TypesettingResult | null {
  if (!typesettingAvailable) return null
  const section = readThemeDocument(document).sections.typography
  return resolveTypesetting(section ? Reflect.get(section, 'typesetting') : undefined)
}
export function assignedTrial(font: AssignedFont, local?: TrialFont | null): TrialFont | undefined {
  if (font.profile !== 'manual') return curatedFonts.find(item => item.id === font.profile)
  return local && font.family === fontFamily(local) ? local : undefined
}
export function chooseAssignment(
  input: TypesettingInput,
  assignment: Assignment,
  font: TrialFont
): TypesettingInput {
  if (!font.styles.includes('normal'))
    throw new Error('A normal file is required for an assignment.')
  return {
    ...input,
    fonts: {
      ...input.fonts,
      [assignment]: {
        family: fontFamily(font),
        profile: font.source === 'catalog' ? font.id : 'manual'
      }
    }
  }
}
export function resetRhythm(input: TypesettingInput, context: 'prose' | 'ui'): TypesettingInput {
  const next = { ...input }
  delete next[context]
  return next
}
export function resetTextStyle(input: TypesettingInput, role: string): TypesettingInput {
  const styles = { ...input.styles }
  delete styles[role]
  return { ...input, styles }
}
export function applyTypesetting(
  document: object,
  input: TypesettingInput,
  local?: TrialFont | null,
  reset = false
): object {
  const current = readThemeDocument(document)
  const result = resolveTypesetting(input)
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
      styles: known?.styles ?? samePrevious?.styles ?? ['normal']
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
  return Radiant.updateThemeDocument(current, { typography: parsed.sections.typography }, 'replace')
}
