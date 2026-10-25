import * as Radiant from '@cognitap/radiant'
import type { Theme, ThemeDefinition, ThemeTokens } from '@cognitap/radiant'

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
// Package declarations differ between the published pin and the candidate.
// Keep this capability seam opaque in both builds; public calls validate data.
const packageExports: object = Radiant
const create = Reflect.get(packageExports, 'themeDocumentFromDefinition')
const update = Reflect.get(packageExports, 'updateThemeDocument')
const compile = Reflect.get(packageExports, 'compileThemeDocument')

// Capability checks keep the pinned published site buildable while candidate
// previews exercise these same public exports. Remove this seam after the pin
// includes document APIs. The only result assertion trusts the library's Theme ABI.
export const documentAPI =
  typeof create === 'function' && typeof update === 'function' && typeof compile === 'function'
    ? {
        create: (definition: ThemeDefinition): WorkshopDocument => create(definition),
        update: (
          document: WorkshopDocument,
          sections: SectionPatch,
          mode: 'merge' | 'replace' = 'merge'
        ): WorkshopDocument => update(document, sections, mode),
        compile: (document: WorkshopDocument): Theme => compile(document) as Theme
      }
    : null

export function initialDocument(): WorkshopDocument {
  // The empty placeholder is never compiled when the document API is absent.
  return documentAPI?.create({ id: 'workshop', name: 'Workshop' }) ?? {}
}

export function resetEditor(document: WorkshopDocument, editor: Editor): WorkshopDocument {
  if (!documentAPI) return document
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

export const accents = [
  { id: 'violet', label: 'Violet', light: '#6D28D9', dark: '#C4B5FD' },
  { id: 'forest', label: 'Forest', light: '#166534', dark: '#86EFAC' },
  { id: 'rose', label: 'Rose', light: '#9F1239', dark: '#FDA4AF' }
]
