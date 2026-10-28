'use client'

import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { Button, ThemeScope, generateTypography, type ThemeMode } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { useHydrated } from '../profile/useHydrated'
import {
  documentAPI,
  editors,
  initialDocument,
  resetEditor,
  type Editor,
  type SectionPatch
} from './workshop-theme'
import {
  ArticleSpecimen,
  FormSpecimen,
  DashboardSpecimen,
  LandingSpecimen,
  ComponentSpecimen,
  specimens,
  type Specimen,
  type InspectionState
} from './Specimens'
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
import { MotionProvider } from '@cognitap/radiant/motion/react'
import { MotionEditor } from './MotionEditor'
import { MotionProofs } from './MotionProofs'
import { TypographyProofs } from './TypographyProofs'
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

/** The document and preview controls have separate owners; theme edits never remount specimens. */
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
  const [colorRevision, setColorRevision] = useState(0)
  const [geometryRevision, setGeometryRevision] = useState(0)
  const [fontRevision, setFontRevision] = useState(0)
  const [fontLoader, setFontLoader] = useState<WorkshopFontLoader | null>(null)
  const [localFont, setLocalFont] = useState<TrialFont | null>(null)
  const [selectedRole, setSelectedRole] = useState('prose-body')
  const [editor, setEditor] = useState<Editor>('color')
  const [specimen, setSpecimen] = useState<Specimen>('article')
  const [mode, setMode] = useState<ThemeMode>('light')
  const [width, setWidth] = useState('full')
  const [state, setState] = useState<InspectionState>('rest')
  const [revisions, setRevisions] = useState<Partial<Record<Specimen, number>>>({})
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
                ? 'Configuration restored. Preview controls and specimen interactions retained.'
                : `Sections ${applyMode === 'merge' ? 'merged' : 'replaced'}. Unrelated sections and specimen interactions retained.`
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
  function edit(patch: SectionPatch) {
    setWorkshop(previous => ({
      ...previous,
      document: documentAPI.update(previous.document, patch)
    }))
    setFeedback(`${current.label} updated. Specimen state retained.`)
  }
  function updateColor(recipe: ColorRecipe) {
    const next: ColorSession = colorAPI.create(recipe)
    setWorkshop(previous => ({
      ...previous,
      document: colorAPI.apply(previous.document, next),
      color: next
    }))
    setFeedback('Color updated. Other sections and specimen state retained.')
  }
  function updateGeometry(recipe: GeometryRecipe) {
    setWorkshop(previous => ({
      ...previous,
      document: geometryAPI.apply(previous.document, recipe),
      geometry: recipe
    }))
    setFeedback('Spacing & surfaces updated. Other sections and specimen state retained.')
  }
  return (
    <div
      ref={workshopHost}
      className="theme-workshop"
      data-workshop-geometry={geometry ? 'enabled' : 'imported'}
      data-workshop-color={color ? 'enabled' : 'imported'}
    >
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
            onClick={() => setEditor(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
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
              setFeedback(`${current.label} reset. Other sections and specimen state retained.`)
            }}
          >
            Reset {current.label.toLowerCase()}
          </Button>
        </div>
        <p>
          {editor === 'color'
            ? 'Build a complete color system and inspect its roles in the same specimens.'
            : editor === 'geometry'
              ? 'Shape shared spacing, control sizes and surfaces across the same specimens.'
              : editor === 'motion'
                ? 'Tune a physical response, then feel it in real interactions.'
                : 'All five specimens use these same decisions.'}
        </p>
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
      </section>
      <output className="workshop-feedback">{feedback}</output>
      {workshop.importResult && <p className="workshop-notice">{workshop.importResult.message}</p>}
      <div
        hidden={editor !== 'typography'}
        className="workshop-proofs-panel"
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
        <TypographyProofs
          theme={theme}
          mode={mode}
          selectedRole={selectedRole}
          onSelectRole={role => {
            setSelectedRole(role)
            workshopHost.current
              ?.querySelector<HTMLSelectElement>('.typesetting-inspector select')
              ?.focus()
          }}
        />
      </div>
      <MotionProofs
        active={editor === 'motion'}
        document={document}
        mode={mode}
        onModeChange={setMode}
      />
      <DemoControls label="Specimen inspection">
        <div className="workshop-options">
          <Choice
            label="Specimen"
            value={specimen}
            choices={specimens.map(item => [item.id, item.label])}
            onChange={value => {
              const selected = specimens.find(item => item.id === value)
              if (selected) setSpecimen(selected.id)
            }}
          />
          <Choice
            label="Preview mode"
            value={mode}
            choices={[
              ['light', 'Light'],
              ['dark', 'Dark'],
              ['system', 'System']
            ]}
            onChange={value => {
              if (value === 'light' || value === 'dark' || value === 'system') setMode(value)
            }}
          />
          <Choice
            label="Preview width"
            value={width}
            choices={[
              ['full', 'Available width'],
              ['phone', 'Phone · 24rem']
            ]}
            onChange={setWidth}
          />
          {specimen === 'components' && (
            <Choice
              label="Component state"
              value={state}
              choices={[
                ['rest', 'Rest'],
                ['invalid', 'Invalid'],
                ['disabled', 'Disabled'],
                ['pending', 'Pending']
              ]}
              onChange={value => {
                if (
                  value === 'rest' ||
                  value === 'invalid' ||
                  value === 'disabled' ||
                  value === 'pending'
                )
                  setState(value)
              }}
            />
          )}
        </div>
        <Button
          variant="outline"
          disabled={!ready}
          onClick={() => {
            setRevisions(previous => ({ ...previous, [specimen]: (previous[specimen] ?? 0) + 1 }))
            setFeedback(
              `${specimens.find(item => item.id === specimen)!.label} specimen reset. Theme and other specimens retained.`
            )
          }}
        >
          Reset specimen
        </Button>
      </DemoControls>
      <DemoPreview label="Shared theme specimens">
        <ThemeScope
          theme={theme}
          mode={mode}
          className="workshop-canvas"
          data-width={width}
        >
          <MotionProvider>
            {specimens.map(item => (
              <section
                key={`${item.id}:${revisions[item.id] ?? 0}`}
                className="workshop-specimen"
                hidden={specimen !== item.id}
                aria-label={`${item.label} specimen`}
              >
                {item.id === 'article' ? (
                  <ArticleSpecimen />
                ) : item.id === 'form' ? (
                  <FormSpecimen />
                ) : item.id === 'dashboard' ? (
                  <DashboardSpecimen />
                ) : item.id === 'landing' ? (
                  <LandingSpecimen />
                ) : (
                  <ComponentSpecimen state={state} />
                )}
              </section>
            ))}
          </MotionProvider>
        </ThemeScope>
      </DemoPreview>
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
