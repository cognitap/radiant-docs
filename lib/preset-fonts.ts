import { themeDefinitions } from '@cognitap/radiant/examples'

/** Google Fonts families for Radiant's example themes, with the weights each theme uses. */
export const presetFontFamilies = {
  'Archivo Black': '',
  'Baloo 2': ':wght@400..800',
  'Barlow Condensed': ':wght@400;500;600;700',
  'IBM Plex Mono': ':wght@400;500;600;700',
  Inter: ':wght@400..800',
  Manrope: ':wght@400..800',
  Nunito: ':wght@400..900',
  'Source Serif 4': ':ital,opsz,wght@0,8..60,400..700;1,8..60,400..700'
} as const

// Browsers download a face only when text renders in it, so pages without preset demos fetch no font files.
export const presetFontsHref = `https://fonts.googleapis.com/css2?${Object.entries(
  presetFontFamilies
)
  .map(([family, axes]) => `family=${family.replaceAll(' ', '+')}${axes}`)
  .join('&')}&display=swap`

/** The first named family of every font a preset sets, so the stylesheet can be checked against the presets. */
export function presetFamilies(): string[] {
  const families = new Set<string>()
  const visit = (value: unknown, key = '') => {
    if (typeof value === 'string') {
      if (/family$/i.test(key)) {
        const first = value
          .split(',')[0]
          .trim()
          .replace(/^['"]|['"]$/g, '')
        if (!/^(system-ui|ui-[a-z]+|sans-serif|serif|monospace)$/.test(first)) families.add(first)
      }
    } else if (value && typeof value === 'object') {
      for (const [name, item] of Object.entries(value)) visit(item, name)
    }
  }
  themeDefinitions.forEach(definition => visit(definition))
  return [...families].sort()
}
