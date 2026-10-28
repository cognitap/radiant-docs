import type { Theme, TypographyResult } from '@cognitap/radiant'
import { documentAPI, initialDocument, readThemeDocument, type Editor } from './workshop-theme.ts'
import {
  colorAPI,
  colorFields,
  defaultColorRecipe,
  type ColorFields,
  type ColorRecipe,
  type ColorSession
} from './workshop-color.ts'
import {
  geometryAPI,
  geometryFields,
  geometryPreset,
  type GeometryFields,
  type GeometryRecipe
} from './workshop-geometry.ts'
import {
  applyTypesetting,
  documentTypesetting,
  type TypographyFields
} from './workshop-typography.ts'
import { typographyFields } from './workshop-typography.ts'
import { motionFields, type MotionFields } from './workshop-motion.ts'
import { compareFields, type EditorChanges } from './workshop-fields.ts'

/** Everything needed to restore the theme and its editor recipes; never preview or session state. */
export interface ThemeSnapshot {
  document: object
  color: ColorRecipe | null
  geometry: GeometryRecipe | null
}
/** What the shell and editors read; derived once per snapshot. */
export interface ThemeView {
  snapshot: ThemeSnapshot
  theme: Theme
  color: ColorSession | null
  typography: TypographyResult | null
}
export interface ThemeChanges {
  color: EditorChanges<ColorFields>
  typography: EditorChanges<TypographyFields>
  geometry: EditorChanges<GeometryFields>
  motion: EditorChanges<MotionFields>
}

export function initialSnapshot(): ThemeSnapshot {
  const geometry = geometryPreset()
  const color = colorAPI.create(defaultColorRecipe())
  const document = geometryAPI.apply(applyTypesetting(initialDocument(), {}), geometry)
  return { document: colorAPI.apply(document, color), color: color.recipe, geometry }
}
export function viewTheme(snapshot: ThemeSnapshot): ThemeView {
  return {
    snapshot,
    theme: documentAPI.compile(snapshot.document),
    color: snapshot.color ? colorAPI.create(snapshot.color) : null,
    typography: documentTypesetting(snapshot.document)
  }
}
export function themeChanges(present: ThemeView, baseline: ThemeView): ThemeChanges {
  const fields = <T, F>(value: T | null, read: (value: T) => F) =>
    value === null ? null : read(value)
  return {
    color: compareFields(fields(present.color, colorFields), fields(baseline.color, colorFields)),
    typography: compareFields(
      fields(present.typography, typographyFields),
      fields(baseline.typography, typographyFields)
    ),
    geometry: compareFields(
      fields(present.snapshot.geometry, geometryFields),
      fields(baseline.snapshot.geometry, geometryFields)
    ),
    motion: compareFields(
      motionFields(present.snapshot.document),
      motionFields(baseline.snapshot.document)
    )
  }
}

const canvasModes = (theme: Theme) => ({
  light: { canvas: String(theme.modes.light['--rad-surface-canvas']) },
  dark: { canvas: String(theme.modes.dark['--rad-surface-canvas']) }
})
/** Put one editor's decisions back to the baseline; the other editors keep theirs. */
export function resetEditor(
  present: ThemeSnapshot,
  baseline: ThemeSnapshot,
  editor: Editor
): ThemeSnapshot {
  const sections = readThemeDocument(baseline.document).sections
  if (editor === 'geometry') {
    // Geometry owns surface geometry; Color owns canvas. Preserve the actual
    // per-mode canvas when restoring their shared surface section.
    const document = documentAPI.update(
      documentAPI.update(
        present.document,
        {
          control: sections.control ?? {},
          spacing: sections.spacing ?? {},
          surface: sections.surface ?? {}
        },
        'replace'
      ),
      { surface: { modes: canvasModes(documentAPI.compile(present.document)) } }
    )
    return { ...present, document, geometry: baseline.geometry }
  }
  if (editor === 'color') {
    const document = documentAPI.update(
      documentAPI.update(present.document, { color: sections.color ?? {} }, 'replace'),
      { surface: { modes: canvasModes(documentAPI.compile(baseline.document)) } }
    )
    return { ...present, document, color: baseline.color }
  }
  return {
    ...present,
    document: documentAPI.update(present.document, { [editor]: sections[editor] ?? {} }, 'replace')
  }
}
