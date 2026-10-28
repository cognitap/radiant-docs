'use client'

import { useCallback, useId, useMemo, useReducer, useRef, useState } from 'react'
import { Button, generateTypography } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import {
  documentAPI,
  editors,
  initialDocument,
  resetEditor,
  type Editor,
  type SectionPatch
} from './workshop-theme'
import { initialPreview, previewReducer } from './workshop-preview'
import { Preview } from './Preview'
import { ThemeHandoff, type ImportResult } from './ThemeHandoff'
import { handoffAPI, errorMessage, type ImportData } from './workshop-handoff'
import { GeometryEditor } from './GeometryEditor'
import { geometryAPI, geometryPreset, type GeometryRecipe } from './workshop-geometry'
import { ColorEditor } from './ColorEditor'
import { FontEditor } from './FontEditor'
import { TypographyEditor } from './TypographyEditor'
import { WorkshopFontLoader } from './font-runtime'
import type { TrialFont } from './workshop-fonts'
import { applyTypesetting, chooseAssignment, documentTypesetting } from './workshop-typography'
import { MotionEditor } from './MotionEditor'
import { colorAPI, defaultColorRecipe, type ColorRecipe, type ColorSession } from './workshop-color'
import './workshop.css'

function Choice({
  label,
  value,
  choices,
  onChange
}: {
  label: string
  value: string
  choices: readonly (readonly [string, string])[]
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {!choices.some(([id]) => id === value) && <option value={value}>Custom · {value}</option>}
        {choices.map(([id, name]) => (
          <option
            key={id}
            value={id}
          >
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

interface WorkshopState {
  document: object
  color: ColorSession | null
  geometry: GeometryRecipe | null
  importResult: ImportResult | null
  colorImportRevision: number
  geometryImportRevision: number
}

const descriptions: Record<Editor, string> = {
  color: 'Build a complete color system and inspect its roles in the preview.',
  typography: 'Assign families, text styles and rhythm, then read them in composed pages.',
  geometry: 'Shape shared spacing, control sizes and surfaces across the same scenes.',
  motion: 'Tune a physical response, then feel it in real interactions.'
}

/** The document and the preview have separate owners; theme edits never remount scenes. */
export function ThemeWorkshop() {
  const [workshop, setWorkshop] = useState<WorkshopState>(() => {
    const geometry = geometryPreset()
    const document = geometryAPI.apply(applyTypesetting(initialDocument(), {}), geometry)
    const color = colorAPI.create(defaultColorRecipe())
    return {
      document: colorAPI.apply(document, color),
      color,
      geometry,
      importResult: null,
      colorImportRevision: 0,
      geometryImportRevision: 0
    }
  })
  const { document, color, geometry } = workshop
  const [preview, dispatch] = useReducer(previewReducer, undefined, initialPreview)
  const [colorRevision, setColorRevision] = useState(0)
  const [geometryRevision, setGeometryRevision] = useState(0)
  const [fontRevision, setFontRevision] = useState(0)
  const [fontLoader, setFontLoader] = useState<WorkshopFontLoader | null>(null)
  const [localFont, setLocalFont] = useState<TrialFont | null>(null)
  const [selectedRole, setSelectedRole] = useState('prose-body')
  const [editor, setEditor] = useState<Editor>('color')
  const [feedback, setFeedback] = useState('')
  const ready = useHydrated()
  const panelId = useId()
  const workshopHost = useRef<HTMLDivElement>(null)
  const theme = useMemo(() => documentAPI.compile(document), [document])
  const recipes = useMemo(
    () => ({ color: color?.recipe, geometry: geometry ?? undefined }),
    [color, geometry]
  )
  const importConfiguration = useCallback((data: ImportData, applyMode: 'merge' | 'replace') => {
    setWorkshop(previous => {
      try {
        const current = handoffAPI.configuration(previous.document, {
          color: previous.color?.recipe,
          geometry: previous.geometry ?? undefined
        })
        const next = handoffAPI.apply(current, data, applyMode)
        const affected =
          data.kind === 'radiant-workshop'
            ? ['color', 'surface', 'control', 'spacing']
            : Object.keys(data.sections)
        return {
          ...previous,
          document: next.document,
          color: next.recipes.color ? colorAPI.create(next.recipes.color) : null,
          geometry: next.recipes.geometry ?? null,
          colorImportRevision:
            previous.colorImportRevision +
            Number(affected.some(name => ['color', 'surface'].includes(name))),
          geometryImportRevision:
            previous.geometryImportRevision +
            Number(affected.some(name => ['control', 'spacing', 'surface'].includes(name))),
          importResult: {
            ok: true,
            message:
              data.kind === 'radiant-workshop'
                ? 'Configuration restored. Preview controls and scene interactions retained.'
                : `Sections ${applyMode === 'merge' ? 'merged' : 'replaced'}. Unrelated sections and scene interactions retained.`
          }
        }
      } catch (error) {
        return {
          ...previous,
          importResult: {
            ok: false,
            message: `Import: ${errorMessage(error)} Current theme retained.`
          }
        }
      }
    })
  }, [])
  const importError = useCallback(
    (message: string) =>
      setWorkshop(previous => ({ ...previous, importResult: { ok: false, message } })),
    []
  )
  const values = theme.modes.light
  const current = editors.find(item => item.id === editor)!
  const token = (name: `--rad-${string}`) => String(values[name])
  function chooseEditor(next: Editor) {
    setEditor(next)
    dispatch({ type: 'editor', editor: next })
  }
  function edit(patch: SectionPatch) {
    setWorkshop(previous => ({
      ...previous,
      document: documentAPI.update(previous.document, patch)
    }))
    setFeedback(`${current.label} updated. Preview state retained.`)
  }
  function updateColor(recipe: ColorRecipe) {
    const next: ColorSession = colorAPI.create(recipe)
    setWorkshop(previous => ({
      ...previous,
      document: colorAPI.apply(previous.document, next),
      color: next
    }))
    setFeedback('Color updated. Other sections and preview state retained.')
  }
  function updateGeometry(recipe: GeometryRecipe) {
    setWorkshop(previous => ({
      ...previous,
      document: geometryAPI.apply(previous.document, recipe),
      geometry: recipe
    }))
    setFeedback('Spacing & surfaces updated. Other sections and preview state retained.')
  }
  function selectRole(role: string) {
    setSelectedRole(role)
    workshopHost.current?.querySelector<HTMLSelectElement>('.typesetting-inspector select')?.focus()
  }
  return (
    <div
      ref={workshopHost}
      className="theme-workshop"
      data-workshop-geometry={geometry ? 'enabled' : 'imported'}
      data-workshop-color={color ? 'enabled' : 'imported'}
    >
      <div className="workshop-columns">
        <nav
          className="workshop-editor-nav"
          aria-label="Theme editors"
        >
          {editors.map(item => (
            <Button
              key={item.id}
              disabled={!ready}
              variant={editor === item.id ? 'solid' : 'outline'}
              aria-pressed={editor === item.id}
              aria-controls={panelId}
              onClick={() => chooseEditor(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="workshop-editing">
          <section
            id={panelId}
            aria-label={`${current.label} editor`}
            className="workshop-editor"
          >
            <div className="workshop-editor-heading">
              <h3>{current.label}</h3>
              <Button
                variant="outline"
                disabled={!ready}
                onClick={() => {
                  if (editor === 'color') {
                    updateColor(defaultColorRecipe())
                    setColorRevision(n => n + 1)
                  } else if (editor === 'geometry') {
                    updateGeometry(geometryPreset())
                    setGeometryRevision(n => n + 1)
                  } else {
                    if (editor === 'typography') setFontRevision(value => value + 1)
                    setWorkshop(previous => ({
                      ...previous,
                      document:
                        editor === 'typography'
                          ? applyTypesetting(resetEditor(previous.document, editor), {})
                          : resetEditor(previous.document, editor)
                    }))
                  }
                  setFeedback(`${current.label} reset. Other sections and preview state retained.`)
                }}
              >
                Reset {current.label.toLowerCase()}
              </Button>
            </div>
            <p>{descriptions[editor]}</p>
            <fieldset
              disabled={!ready}
              className="workshop-options"
            >
              <legend>{current.label} settings</legend>
              <div
                hidden={editor !== 'color'}
                className="workshop-color-panel"
              >
                <ColorEditor
                  key={`${colorRevision}:${workshop.colorImportRevision}`}
                  session={color}
                  disabled={!ready}
                  onChange={updateColor}
                />
              </div>
              {editor === 'typography' && !documentTypesetting(document) && (
                <>
                  <Choice
                    label="Body family"
                    value={token('--rad-typography-family')}
                    choices={[
                      ['system-ui, sans-serif', 'System sans'],
                      ['Georgia, serif', 'Georgia serif'],
                      ['ui-monospace, monospace', 'System mono']
                    ]}
                    onChange={family => edit({ typography: { values: { family } } })}
                  />
                  <Choice
                    label="Body size"
                    value={token('--rad-typography-body-size')}
                    choices={[
                      ['0.875rem', '14px base'],
                      ['1rem', '16px base'],
                      ['1.125rem', '18px base']
                    ]}
                    onChange={bodySize => edit({ typography: { values: { bodySize } } })}
                  />
                </>
              )}
              <div
                hidden={editor !== 'typography'}
                className="workshop-font-panel"
              >
                <details className="workshop-typeface-lab">
                  <summary>Typeface lab and local files</summary>
                  <FontEditor
                    key={fontRevision}
                    onSession={setFontLoader}
                    onLocalReady={setLocalFont}
                    onAssignFont={(next, font, context) =>
                      applyTypesetting(
                        next,
                        chooseAssignment(
                          documentTypesetting(next)?.input ?? generateTypography().input,
                          context,
                          font
                        ),
                        font.source === 'local' ? font : localFont
                      )
                    }
                    active={editor === 'typography'}
                    document={document}
                    onChange={next => setWorkshop(previous => ({ ...previous, document: next }))}
                  />
                </details>
              </div>
              <div
                hidden={editor !== 'geometry'}
                className="workshop-geometry-panel"
              >
                <GeometryEditor
                  key={`${geometryRevision}:${workshop.geometryImportRevision}`}
                  recipe={geometry}
                  theme={theme}
                  disabled={!ready}
                  onChange={updateGeometry}
                />
              </div>
              <div
                hidden={editor !== 'motion'}
                className="workshop-motion-panel"
              >
                <MotionEditor
                  document={document}
                  onChange={next => setWorkshop(previous => ({ ...previous, document: next }))}
                />
              </div>
            </fieldset>
            <div
              hidden={editor !== 'typography'}
              className="workshop-typesetting-panel"
            >
              <TypographyEditor
                active={editor === 'typography'}
                document={document}
                loader={fontLoader}
                local={localFont}
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                onChange={next => setWorkshop(previous => ({ ...previous, document: next }))}
              />
            </div>
          </section>
          <output className="workshop-feedback">{feedback}</output>
          {workshop.importResult && (
            <p className="workshop-notice">{workshop.importResult.message}</p>
          )}
        </div>
        <Preview
          editor={editor}
          theme={theme}
          document={document}
          preview={preview}
          dispatch={dispatch}
          ready={ready}
          role={selectedRole}
          onRole={selectRole}
        />
      </div>
      <ThemeHandoff
        document={document}
        recipes={recipes}
        result={workshop.importResult}
        onImport={importConfiguration}
        onError={importError}
      />
    </div>
  )
}
