import { readThemeDocument } from './workshop-theme.ts'
import { curatedFonts, type FontAxis } from './workshop-fonts.ts'

export interface FontRequirement {
  id: string
  family: string
  source: 'catalog' | 'local' | 'system'
  weights: readonly number[]
  styles: readonly string[]
  axes: readonly FontAxis[]
  files: { style: string; url: string; name: string }[]
  license?: string
  fallback?: string
  instruction: string
}

/** Setup presentation only: the public parser validates portable font metadata. */
export function fontRequirements(document: object): FontRequirement[] {
  const fonts = readThemeDocument(document).sections.typography?.fonts ?? []
  return fonts.map(font => {
    const catalog =
      font.source === 'catalog' ? curatedFonts.find(item => item.family === font.family) : undefined
    const storedAxes = Reflect.get(font, 'axes') as readonly FontAxis[] | undefined
    return {
      id: font.id,
      family: font.family,
      source: font.source,
      weights: font.weights ?? [],
      styles: font.styles ?? [],
      axes: catalog?.axes ?? storedAxes ?? [],
      files: Object.entries(catalog?.files ?? {}).map(([style, url]) => ({
        style,
        url,
        name: url.split('/').at(-1)!
      })),
      license: catalog?.license,
      fallback: catalog?.fallback,
      instruction: catalog
        ? 'Download the listed font files and license. Place the WOFF2 files in ./fonts beside the setup CSS, or adapt the URLs for your app.'
        : font.source === 'local'
          ? 'File not included: supply this font in your app and verify its license, weights, styles and scripts. To restore this preview, load the file in Typeface lab with the same CSS family; fallback remains visible until then.'
          : 'Make this family available in your app or use its CSS fallback. Font availability and coverage are not guaranteed.'
    }
  })
}

export function fontSetup(document: object): string {
  const requirements = fontRequirements(document)
  const seen = new Set<string>()
  const blocks = [
    '/* Font installation requirements only. Theme import never loads font files.\n   Put downloaded WOFF2 files in ./fonts beside this CSS. Keep each license.\n   Axis ranges below describe capabilities; trial-only settings are not theme settings. */'
  ]
  for (const font of requirements) {
    // Family text is untrusted. Comments must never allow CSS/style delimiters.
    const comment = `${font.family} · ${font.id}`.replace(/[\r\n{}<>]|\*\//g, ' ')
    blocks.push(
      `/* ${comment}\n   Requested weights: ${font.weights.join(', ') || 'unspecified'}; styles: ${font.styles.join(', ') || 'unspecified'}.\n   Available axes: ${font.axes.map(axis => `${axis.tag} ${axis.min}…${axis.max} (default ${axis.default})`).join('; ') || 'not verified'}. */`
    )
    for (const file of font.files) {
      const key = `${font.family}/${file.style}/${file.url}`
      if (seen.has(key)) continue
      seen.add(key)
      const weight = font.axes.find(axis => axis.tag === 'wght')
      const width = font.axes.find(axis => axis.tag === 'wdth')
      blocks.push(
        `@font-face {\n  font-family: ${JSON.stringify(font.family)};\n  src: url("./fonts/${file.name}") format("woff2");\n  font-style: ${file.style};\n  font-weight: ${weight ? `${weight.min} ${weight.max}` : (font.weights[0] ?? 400)};\n${width ? `  font-stretch: ${width.min}% ${width.max}%;\n` : ''}  font-display: swap;\n}`
      )
    }
    if (!font.files.length) blocks.push(`/* ${font.instruction} */`)
  }
  if (!requirements.length)
    blocks.push(
      '/* No font descriptors are attached. Verify all authored CSS families in your application. */'
    )
  return blocks.join('\n\n') + '\n'
}
