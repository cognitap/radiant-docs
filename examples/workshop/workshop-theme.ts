import * as Radiant from '@cognitap/radiant'
import type { Theme, ThemeDefinition, ThemeTokens, ThemeDocument } from '@cognitap/radiant'

export type Editor = 'color' | 'typography' | 'geometry' | 'motion'
export const editors: { id: Editor; label: string }[] = [
  { id: 'color', label: 'Color' },
  { id: 'typography', label: 'Typography' },
  { id: 'geometry', label: 'Spacing & surfaces' },
  { id: 'motion', label: 'Motion' }
]
// The shell treats library documents as opaque data. It neither duplicates the
// document schema nor implements a fallback compiler for an older package.
export type WorkshopDocument = object
export type SectionPatch = {
  [K in keyof ThemeTokens]?: {
    values?: ThemeTokens[K]
    modes?: { light?: ThemeTokens[K]; dark?: ThemeTokens[K] }
  }
}
/** Validate opaque application state with the released library parser. */
export function readThemeDocument(value: unknown): ThemeDocument {
  const document = Radiant.parseThemeDocument(value)
  if (document.kind !== 'radiant-theme') throw new TypeError('Expected a full theme document.')
  return document
}
export const documentAPI = {
  create: (definition: ThemeDefinition): WorkshopDocument =>
    Radiant.themeDocumentFromDefinition(definition),
  update: (
    document: WorkshopDocument,
    sections: SectionPatch,
    mode: 'merge' | 'replace' = 'merge'
  ): WorkshopDocument => Radiant.updateThemeDocument(readThemeDocument(document), sections, mode),
  compile: (document: WorkshopDocument): Theme =>
    Radiant.compileThemeDocument(readThemeDocument(document))
}

export function initialDocument(): WorkshopDocument {
  return documentAPI.create({ id: 'workshop', name: 'Workshop' })
}

export function resetEditor(document: WorkshopDocument, editor: Editor): WorkshopDocument {
  if (editor === 'geometry') {
    const theme = documentAPI.compile(document)
    // Geometry owns surface geometry; Color owns canvas. Preserve the actual
    // per-mode canvas when resetting their shared surface section.
    return documentAPI.update(
      document,
      {
        control: {},
        spacing: {},
        surface: {
          modes: {
            light: { canvas: String(theme.modes.light['--rad-surface-canvas']) },
            dark: { canvas: String(theme.modes.dark['--rad-surface-canvas']) }
          }
        }
      },
      'replace'
    )
  }
  if (editor === 'color') {
    const next = documentAPI.update(document, { color: {} }, 'replace')
    return documentAPI.update(next, {
      surface: {
        modes: {
          light: { canvas: String(Radiant.defaultTheme.modes.light['--rad-surface-canvas']) },
          dark: { canvas: String(Radiant.defaultTheme.modes.dark['--rad-surface-canvas']) }
        }
      }
    })
  }
  return documentAPI.update(document, { [editor]: {} }, 'replace')
}
