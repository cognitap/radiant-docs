import { updateThemeDocument, type ThemeFontMetadata } from '@cognitap/radiant'
import { readThemeDocument } from './workshop-theme.ts'

export type FontContext = 'body' | 'headings' | 'ui' | 'code'
export type FontStyle = 'normal' | 'italic'
export interface FontAxis {
  tag: string
  min: number
  default: number
  max: number
}
export interface TrialFont {
  id: string
  family: string
  fallback: string
  source: 'catalog' | 'local'
  weights: readonly [number, number]
  styles: readonly FontStyle[]
  axes: readonly FontAxis[]
  files?: Partial<Record<FontStyle, string>>
  license?: string
  coverage: string
}
const root = '/fonts/workshop/'
const weight = (max: number, min = 100): FontAxis => ({ tag: 'wght', min, default: 400, max })
const assets = (name: string) => ({
  normal: root + name + '.woff2',
  italic: root + name + '-Italic.woff2'
})
export const curatedFonts: readonly TrialFont[] = [
  {
    id: 'inter',
    family: 'Inter',
    fallback: 'system-ui, sans-serif',
    source: 'catalog',
    weights: [100, 900],
    styles: ['normal', 'italic'],
    axes: [weight(900), { tag: 'opsz', min: 14, default: 14, max: 32 }],
    files: assets('Inter'),
    license: root + 'Inter-LICENSE.txt',
    coverage:
      'Roman samples: Latin including Hungarian, Greek and Cyrillic. Arabic and CJK samples absent.'
  },
  {
    id: 'source-serif-4',
    family: 'Source Serif 4',
    fallback: 'Georgia, serif',
    source: 'catalog',
    weights: [200, 900],
    styles: ['normal', 'italic'],
    axes: [weight(900, 200), { tag: 'opsz', min: 8, default: 20, max: 60 }],
    files: assets('Source-Serif-4'),
    license: root + 'Source-Serif-4-LICENSE.md',
    coverage:
      'Roman samples: Latin including Hungarian, Greek and Cyrillic. Arabic and CJK samples absent.'
  },
  {
    id: 'plex-sans',
    family: 'IBM Plex Sans',
    fallback: 'system-ui, sans-serif',
    source: 'catalog',
    weights: [100, 700],
    styles: ['normal', 'italic'],
    axes: [weight(700), { tag: 'wdth', min: 85, default: 100, max: 100 }],
    files: assets('IBM-Plex-Sans'),
    license: root + 'IBM-Plex-LICENSE.txt',
    coverage:
      'Roman samples: Latin including Hungarian, Greek and Cyrillic. Arabic and CJK samples absent.'
  },
  {
    id: 'plex-mono',
    family: 'IBM Plex Mono',
    fallback: 'ui-monospace, monospace',
    source: 'catalog',
    weights: [100, 700],
    styles: ['normal', 'italic'],
    axes: [weight(700)],
    files: assets('IBM-Plex-Mono'),
    license: root + 'IBM-Plex-LICENSE.txt',
    coverage:
      'Roman samples: Latin including Hungarian and Cyrillic. Greek, Arabic and CJK samples absent.'
  }
]
export function fontFamily(font: TrialFont): string {
  return `${JSON.stringify(font.family)}, ${font.fallback}`
}
export function fontRecommendation(font: TrialFont, context: FontContext) {
  const body = context === 'body' || context === 'headings'
  const supported =
    font.source === 'catalog' &&
    (body
      ? font.id !== 'plex-mono'
      : context === 'ui'
        ? ['inter', 'plex-sans'].includes(font.id)
        : font.id === 'plex-mono')
  return {
    supported,
    size:
      context === 'code' ? 14 : !body ? 16 : supported && font.id === 'source-serif-4' ? 21 : 20,
    leading:
      context === 'code'
        ? 1.65
        : !body
          ? 1.5
          : supported && font.id !== 'source-serif-4'
            ? 1.6
            : 1.65,
    measure:
      context === 'code'
        ? 80
        : body
          ? supported && ['source-serif-4', 'plex-sans'].includes(font.id)
            ? 62
            : 64
          : 0,
    tracking: 0
  }
}
export function applyTrialFont(document: object, font: TrialFont, selectedWeight: number): object {
  if (!font.styles.includes('normal'))
    throw new Error(
      'A normal face is required for the shared theme family. Add a normal file first.'
    )
  if (
    !Number.isFinite(selectedWeight) ||
    selectedWeight < font.weights[0] ||
    selectedWeight > font.weights[1]
  )
    throw new Error('Choose a weight available in this font.')
  const current = readThemeDocument(document)
  const descriptor: ThemeFontMetadata = {
    id: 'workshop-font',
    family: font.family,
    source: font.source,
    weights: [selectedWeight],
    styles: [...font.styles],
    axes: font.axes
  }
  return updateThemeDocument(current, {
    typography: {
      values: { family: fontFamily(font), bodyWeight: selectedWeight },
      fonts: [
        ...(current.sections.typography?.fonts ?? []).filter(item => item.id !== 'workshop-font'),
        descriptor
      ]
    }
  })
}

/** Bounded metadata reader, not a font decoder. The browser still validates rendering. */
export function inspectLocalFont(bytes: ArrayBuffer) {
  if (bytes.byteLength < 12 || bytes.byteLength > 10 * 1024 * 1024)
    throw new Error('Choose a font file up to 10 MiB.')
  const data = new DataView(bytes)
  const tag = (offset: number) => String.fromCharCode(...new Uint8Array(bytes, offset, 4))
  const signature = tag(0)
  if (signature === 'wOF2' || signature === 'wOFF') {
    if (
      bytes.byteLength < (signature === 'wOF2' ? 48 : 44) ||
      data.getUint32(8) !== bytes.byteLength
    )
      throw new Error('Invalid web-font header.')
    return {
      format: signature === 'wOF2' ? 'WOFF2' : 'WOFF',
      axes: [] as FontAxis[],
      weight: undefined,
      style: undefined,
      family: undefined
    }
  }
  if (data.getUint32(0) !== 0x00010000 && signature !== 'OTTO')
    throw new Error('Use WOFF2, WOFF, TTF or OTF; collections are not supported.')
  const count = data.getUint16(4)
  if (count > 256 || 12 + count * 16 > bytes.byteLength)
    throw new Error('Invalid font table directory.')
  const tables = new Map<string, { offset: number; length: number }>()
  for (let i = 0; i < count; i++) {
    const row = 12 + i * 16,
      offset = data.getUint32(row + 8),
      length = data.getUint32(row + 12)
    if (offset > bytes.byteLength || length > bytes.byteLength - offset)
      throw new Error('Invalid font table bounds.')
    tables.set(tag(row), { offset, length })
  }
  const axes: FontAxis[] = []
  const fvar = tables.get('fvar')
  if (fvar) {
    if (fvar.length < 16 || data.getUint16(fvar.offset) !== 1)
      throw new Error('Unsupported variation metadata.')
    const start = data.getUint16(fvar.offset + 4),
      n = data.getUint16(fvar.offset + 8),
      step = data.getUint16(fvar.offset + 10)
    if (n > 32 || step < 20 || start < 16 || start + n * step > fvar.length)
      throw new Error('Invalid variation axes.')
    for (let i = 0; i < n; i++) {
      const row = fvar.offset + start + i * step
      const axis = {
        tag: tag(row),
        min: data.getInt32(row + 4) / 65536,
        default: data.getInt32(row + 8) / 65536,
        max: data.getInt32(row + 12) / 65536
      }
      if (
        !/^[A-Za-z0-9]{4}$/.test(axis.tag) ||
        axes.some(a => a.tag === axis.tag) ||
        axis.min > axis.default ||
        axis.default > axis.max
      )
        throw new Error('Invalid variation axis range.')
      axes.push(axis)
    }
  }
  const os2 = tables.get('OS/2')
  const weightValue = os2 && os2.length >= 6 ? data.getUint16(os2.offset + 4) : undefined
  const weight = weightValue && weightValue <= 1000 ? weightValue : undefined
  const style: FontStyle | undefined =
    os2 && os2.length >= 64
      ? data.getUint16(os2.offset + 62) & 1
        ? 'italic'
        : 'normal'
      : undefined
  let family: string | undefined
  const names = tables.get('name')
  if (names && names.length >= 6) {
    const n = data.getUint16(names.offset + 2),
      strings = data.getUint16(names.offset + 4)
    if (n <= 1024 && 6 + n * 12 <= names.length)
      for (const wanted of [16, 1]) {
        for (let i = 0; i < n && !family; i++) {
          const row = names.offset + 6 + i * 12,
            platform = data.getUint16(row),
            id = data.getUint16(row + 6),
            length = data.getUint16(row + 8),
            start = strings + data.getUint16(row + 10)
          if (
            id === wanted &&
            (platform === 0 || platform === 3) &&
            length <= 256 &&
            start + length <= names.length &&
            length % 2 === 0
          ) {
            family =
              new TextDecoder('utf-16be')
                .decode(new Uint8Array(bytes, names.offset + start, length))
                .split('')
                .filter(character => character.charCodeAt(0) >= 32)
                .join('')
                .trim() || undefined
          }
        }
      }
  }
  return { format: signature === 'OTTO' ? 'OTF' : 'TTF', axes, weight, style, family }
}
export function localFont(
  bytes: ArrayBuffer,
  family: string,
  style: FontStyle,
  declaredWeight: number
): TrialFont {
  const info = inspectLocalFont(bytes)
  const name = family.trim()
  if (
    !name ||
    name.length > 80 ||
    /[;{}<>"'\\\n\r]/.test(name) ||
    [...name].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) ||
    curatedFonts.some(font => font.family.toLowerCase() === name.toLowerCase())
  )
    throw new Error(
      'Choose a unique trial family name, up to 80 characters, without CSS punctuation.'
    )
  const range = info.axes.find(axis => axis.tag === 'wght')
  const w = info.weight ?? declaredWeight
  if (!Number.isFinite(w) || w < 1 || w > 1000 || (range && (range.min < 1 || range.max > 1000)))
    throw new Error('Font weight must be between 1 and 1000.')
  return {
    id: 'local',
    family: name,
    fallback: 'system-ui, sans-serif',
    source: 'local',
    weights: range ? [range.min, range.max] : [w, w],
    styles: [info.style ?? style],
    axes: info.axes,
    coverage:
      'Uncalibrated font. Script coverage and shaping have not been verified; review the sample and fallbacks.'
  }
}
