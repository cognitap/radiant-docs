'use client'

import { useId, useMemo, useState } from 'react'
import { Button, ThemeScope, defaultTheme, type ThemeMode } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { useHydrated } from '../profile/useHydrated'
import {
  accents,
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

/** The document and preview controls have separate owners; theme edits never remount specimens. */
export function ThemeWorkshop() {
  const [document, setDocument] = useState(initialDocument)
  const [editor, setEditor] = useState<Editor>('color')
  const [specimen, setSpecimen] = useState<Specimen>('article')
  const [mode, setMode] = useState<ThemeMode>('light')
  const [width, setWidth] = useState('full')
  const [state, setState] = useState<InspectionState>('rest')
  const [revisions, setRevisions] = useState<Partial<Record<Specimen, number>>>({})
  const [feedback, setFeedback] = useState('')
  const ready = useHydrated()
  const panelId = useId()
  const theme = useMemo(
    () => (documentAPI ? documentAPI.compile(document) : defaultTheme),
    [document]
  )
  const values = theme.modes.light
  const current = editors.find(item => item.id === editor)!
  const token = (name: `--rad-${string}`) => String(values[name])
  function edit(patch: SectionPatch) {
    const api = documentAPI
    if (!api) return
    setDocument(previous => api.update(previous, patch))
    setFeedback(`${current.label} updated. Specimen state retained.`)
  }
  return (
    <div
      className="theme-workshop"
      data-workshop-editing={documentAPI ? 'enabled' : 'unavailable'}
    >
      {!documentAPI && (
        <p className="workshop-notice">
          Theme editing is in preview and needs a Radiant package with theme-document support. You
          can inspect all specimens below with the installed release.
        </p>
      )}
      <nav
        className="workshop-editor-nav"
        aria-label="Theme editors"
      >
        {editors.map(item => (
          <Button
            key={item.id}
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
            disabled={!ready || !documentAPI}
            onClick={() => {
              setDocument(previous => resetEditor(previous, editor))
              setFeedback(`${current.label} reset. Other sections and specimen state retained.`)
            }}
          >
            Reset {current.label.toLowerCase()}
          </Button>
        </div>
        <p>Starting controls for the shared theme. All five specimens use these same decisions.</p>
        <fieldset
          disabled={!ready || !documentAPI}
          className="workshop-options"
        >
          <legend>{current.label} settings</legend>
          {editor === 'color' && (
            <Choice
              label="Accent palette"
              value={
                accents.find(item => item.light === token('--rad-color-accent'))?.id ?? 'baseline'
              }
              choices={[
                ['baseline', 'Neutral baseline'],
                ...accents.map(item => [item.id, item.label] as const)
              ]}
              onChange={id => {
                const accent = accents.find(item => item.id === id)
                if (!accent) {
                  setDocument(previous => resetEditor(previous, 'color'))
                  return
                }
                edit({
                  color: {
                    modes: {
                      light: { accent: accent.light, accentForeground: '#FFFFFF' },
                      dark: { accent: accent.dark, accentForeground: '#000000' }
                    }
                  }
                })
              }}
            />
          )}
          {editor === 'typography' && (
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
          {editor === 'geometry' && (
            <>
              <Choice
                label="Panel spacing"
                value={token('--rad-surface-padding')}
                choices={[
                  ['0.75rem', 'Compact'],
                  ['1.5rem', 'Comfortable'],
                  ['2rem', 'Spacious']
                ]}
                onChange={padding => edit({ surface: { values: { padding } } })}
              />
              <Choice
                label="Surface radius"
                value={token('--rad-surface-radius')}
                choices={[
                  ['0', 'Square'],
                  ['0.75rem', 'Rounded'],
                  ['1.5rem', 'Soft']
                ]}
                onChange={radius => edit({ surface: { values: { radius } } })}
              />
              <Choice
                label="Control density"
                value={token('--rad-control-medium-height')}
                choices={[
                  ['2rem', 'Compact'],
                  ['2.5rem', 'Comfortable'],
                  ['3rem', 'Spacious']
                ]}
                onChange={height =>
                  edit({
                    control: {
                      values: {
                        small: { height: height === '2rem' ? '1.75rem' : '2rem' },
                        medium: { height },
                        large: { height: height === '3rem' ? '3.5rem' : '3rem' }
                      }
                    }
                  })
                }
              />
            </>
          )}
          {editor === 'motion' && (
            <Choice
              label="Release timing"
              value={token('--rad-motion-release-duration')}
              choices={[
                ['0ms', 'Immediate'],
                ['160ms', 'Quick'],
                ['280ms', 'Relaxed']
              ]}
              onChange={releaseDuration => edit({ motion: { values: { releaseDuration } } })}
            />
          )}
        </fieldset>
      </section>
      <output className="workshop-feedback">{feedback}</output>
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
        </ThemeScope>
      </DemoPreview>
    </div>
  )
}
