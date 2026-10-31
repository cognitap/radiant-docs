'use client'

import { useId, useMemo, useState } from 'react'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '@cognitap/radiant'
import {
  chooseWorkingFamily,
  defaultColorRecipe,
  overrideRole,
  roleNames,
  roleValue,
  workingRoles,
  type ColorFields,
  type ColorRecipe,
  type ColorSession,
  type Mode,
  type Role,
  type WorkingRole
} from './workshop-color'
import {
  choiceGroups,
  contrastProblems,
  readableOn,
  stripInputs,
  strips,
  type ContrastProblem
} from './workshop-color-view'
import { useWallSamples } from './useWallSamples'
import { BrandPicker } from './BrandPicker'
import { HexField } from './HexField'
import { ChoiceCards, ColorStrip } from './ColorStrip'
import { ColorWallGrid, type WallPick } from './ColorWallGrid'
import { Changed } from './ControlChange'
import type { ControlTarget } from './workshop-inspect'
import type { Change } from './workshop-history'
import type { Changes } from './workshop-fields'
import './color-editor.css'

const automatic = (value: number | string | undefined) =>
  value === undefined ? 'automatic' : String(value)
const recommended = (value: string | undefined) => value ?? 'recommended'
const title = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const modes: readonly Mode[] = ['light', 'dark']
const roles = Object.keys(roleNames) as Role[]
/** The field a wall pick writes, so the picker opens where the marker and Inspect point. */
type Picking = { kind: 'role'; mode: Mode; role: Role } | { kind: 'family'; name: WorkingRole }

function Fix({
  problem,
  onChange
}: {
  problem: ContrastProblem
  onChange: (recipe: ColorRecipe, change: Change) => void
}) {
  const { check, fix } = problem
  return (
    <>
      <strong>
        {title(check.mode)}: {roleNames[check.foregroundRole as Role] ?? check.foregroundRole} on{' '}
        {roleNames[check.backgroundRole as Role] ?? check.backgroundRole}
      </strong>{' '}
      {check.ratio.toFixed(2)}:1, needs {check.minimum}:1.
      {fix && (
        <Button
          variant="outline"
          controlSize="small"
          onClick={() => onChange(fix.recipe, { label: fix.label.toLowerCase() })}
        >
          {fix.label}
        </Button>
      )}
    </>
  )
}

export function ColorEditor({
  session,
  accent,
  changes,
  disabled,
  target,
  onChange
}: {
  session: ColorSession | null
  /** The current light accent, offered as the brand when hand-authored colors adopt a recipe. */
  accent: string
  changes: Changes<ColorFields> | null
  disabled: boolean
  target?: ControlTarget
  onChange: (recipe: ColorRecipe, change: Change) => void
}) {
  const id = useId()
  const [picking, setPicking] = useState<Picking>({ kind: 'role', mode: 'light', role: 'accent' })
  const [wallOpen, setWallOpen] = useState(false)
  const [seen, setSeen] = useState(target)
  if (target !== seen) {
    setSeen(target)
    const [, targetMode, targetRole] = target?.field.split('.') ?? []
    if (
      (targetMode === 'light' || targetMode === 'dark') &&
      targetRole &&
      Object.hasOwn(roleNames, targetRole)
    )
      setPicking({ kind: 'role', mode: targetMode, role: targetRole as Role })
  }
  const input = session?.wall.input
  const sampleInputs = useMemo(
    () =>
      input
        ? [
            ...strips.flatMap(strip => stripInputs(strip, input)),
            ...choiceGroups.flatMap(group =>
              group.choices.map(choice => group.input(input, choice.value))
            )
          ]
        : [],
    [input]
  )
  const wallFor = useWallSamples(sampleInputs)
  if (!session || !input)
    return (
      <div className="color-editor">
        <p className="color-lead">
          These colors are set by hand and kept exactly. Generate a palette to edit them.
        </p>
        <Button
          variant="soft"
          disabled={disabled}
          onClick={() => {
            const { input } = defaultColorRecipe()
            const brand = /^#[\da-f]{6}$/i.test(accent) ? accent : input.brand
            onChange({ input: { ...input, brand } }, { label: 'generated palette' })
          }}
        >
          Generate from the accent
        </Button>
      </div>
    )
  const { recipe, wall, palette } = session
  const changeInput = (patch: Partial<ColorRecipe['input']>, change: Change) =>
    onChange({ ...recipe, input: { ...recipe.input, ...patch } }, change)
  const setRole = (mode: Mode, role: Role, value: string | undefined, coalesce?: string) =>
    onChange(overrideRole(recipe, mode, role, value), {
      label: `${mode} ${roleNames[role].toLowerCase()}`,
      coalesce
    })
  const setFamily = (name: WorkingRole, paletteId: string | undefined) =>
    onChange(chooseWorkingFamily(recipe, name, paletteId), { label: `${name} family` })
  const problems = contrastProblems(session)
  const problemsFor = (mode: Mode, role: Role) =>
    problems.filter(p => p.mode === mode && p.role === role)
  const brandProblems = problems.filter(p => p.brandDerived)
  const failures = palette.checks.filter(check => check.pass === false)
  const required = palette.checks.filter(check => check.minimum !== null)
  const selected = picking.kind === 'role' ? picking : null
  const wallPick: WallPick =
    picking.kind === 'role'
      ? { ...picking, value: recipe.modes?.[picking.mode]?.[picking.role] }
      : { ...picking, paletteId: palette.working[picking.name].paletteId }
  const openWall = (next: Picking) => {
    setPicking(next)
    setWallOpen(true)
  }
  const roleColumns = [roles.slice(0, 9), roles.slice(9)]
  return (
    <div className="color-editor">
      <section
        className="color-section color-brand"
        aria-labelledby={`${id}-brand`}
      >
        <h4 id={`${id}-brand`}>Brand</h4>
        <Changed
          changes={changes}
          field="brand"
          label="Brand color"
          set={brand => changeInput({ brand }, { label: 'brand color', coalesce: 'brand' })}
        >
          {describedBy => (
            <div className="color-brand-row">
              <BrandPicker
                value={input.brand}
                disabled={disabled}
                describedBy={describedBy}
                onChange={brand =>
                  changeInput({ brand }, { label: 'brand color', coalesce: 'brand' })
                }
              />
              <div className="color-brand-side">
                <HexField
                  label="Brand color"
                  value={input.brand}
                  describedBy={describedBy}
                  onValid={brand =>
                    changeInput({ brand }, { label: 'brand color', coalesce: 'brand' })
                  }
                />
                <small
                  className="color-fidelity"
                  data-testid="color-fidelity"
                >
                  {wall.color.anchor
                    ? `${wall.color.brand.value} kept exactly at ${wall.color.anchor.paletteId} ${wall.color.anchor.stop}`
                    : `${wall.color.brand.value} kept as reference`}
                </small>
                {brandProblems.length > 0 && (
                  <ul
                    className="color-problems"
                    aria-label="Brand contrast problems"
                  >
                    {brandProblems.map(problem => (
                      <li
                        key={`${problem.mode}:${problem.check.foregroundRole}:${problem.check.backgroundRole}`}
                      >
                        <Fix
                          problem={problem}
                          onChange={onChange}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </Changed>
      </section>

      <section
        className="color-section"
        aria-labelledby={`${id}-shape`}
      >
        <h4 id={`${id}-shape`}>Shape</h4>
        <div className="color-strips">
          {strips.map(strip => {
            const explicit = recipe.input[strip.field]
            const value = input[strip.field]
            const isAutomatic = strip.automatic && explicit === undefined
            const set = (next: number | undefined) =>
              changeInput(
                { [strip.field]: next },
                { label: strip.label.toLowerCase(), coalesce: strip.field }
              )
            return (
              <Changed
                key={strip.field}
                changes={changes}
                field={strip.field}
                label={strip.label}
                format={automatic}
                set={set}
              >
                {describedBy => (
                  <ColorStrip
                    strip={strip}
                    value={value}
                    automatic={isAutomatic}
                    walls={stripInputs(strip, input).map(wallFor)}
                    disabled={disabled || (strip.field === 'neutralHue' && !wall.neutralInput)}
                    describedBy={describedBy}
                    onChange={set}
                    onAutomatic={
                      strip.automatic
                        ? auto =>
                            changeInput(
                              { [strip.field]: auto ? undefined : value },
                              { label: strip.label.toLowerCase() }
                            )
                        : undefined
                    }
                  />
                )}
              </Changed>
            )
          })}
        </div>
        <div className="color-choice-groups">
          {choiceGroups.map(group => (
            <Changed
              key={group.field}
              changes={changes}
              field={group.field}
              label={group.label}
              format={value => group.choices.find(c => c.value === value)?.label ?? String(value)}
              set={value =>
                onChange(
                  { ...recipe, input: group.input(recipe.input, value) },
                  { label: group.label.toLowerCase() }
                )
              }
            >
              {describedBy => (
                <ChoiceCards
                  group={group}
                  value={input[group.field]}
                  wallFor={choice => wallFor(group.input(input, choice))}
                  describedBy={describedBy}
                  onChange={value =>
                    onChange(
                      { ...recipe, input: group.input(recipe.input, value) },
                      { label: group.label.toLowerCase() }
                    )
                  }
                />
              )}
            </Changed>
          ))}
        </div>
      </section>

      <section
        className="color-section"
        aria-labelledby={`${id}-palette`}
      >
        <div className="color-section-head">
          <h4 id={`${id}-palette`}>Working palette</h4>
          <Button
            variant="outline"
            controlSize="small"
            disabled={disabled || !recipe.working}
            onClick={() =>
              onChange({ ...recipe, working: undefined }, { label: 'recommended families' })
            }
          >
            Use recommended families
          </Button>
        </div>
        <div className="color-families">
          {workingRoles.map(name => {
            const family = palette.working[name]
            const paletteName = wall.color.palettes.find(p => p.id === family.paletteId)?.name
            const active = picking.kind === 'family' && picking.name === name && wallOpen
            return (
              <Changed
                key={name}
                changes={changes}
                field={`working.${name}`}
                label={`${name} family`}
                format={recommended}
                set={paletteId => setFamily(name, paletteId)}
              >
                {describedBy => (
                  <button
                    type="button"
                    className="color-family"
                    aria-label={`${name} family`}
                    aria-describedby={describedBy}
                    aria-expanded={active}
                    aria-controls={`${id}-wall`}
                    data-value={family.paletteId}
                    disabled={disabled}
                    onClick={() =>
                      active ? setWallOpen(false) : openWall({ kind: 'family', name })
                    }
                  >
                    <span className="color-family-name">{title(name)}</span>
                    <span className="color-family-value">{paletteName}</span>
                    {modes.map(mode => (
                      <span
                        key={mode}
                        className="color-pair"
                        style={{
                          background: family[mode].background,
                          color: family[mode].foreground
                        }}
                      >
                        Aa
                      </span>
                    ))}
                  </button>
                )}
              </Changed>
            )
          })}
        </div>
      </section>

      <section
        className="color-section"
        aria-labelledby={`${id}-roles`}
      >
        <div className="color-section-head">
          <h4 id={`${id}-roles`}>Roles</h4>
          <Button
            variant="outline"
            controlSize="small"
            disabled={disabled || !recipe.modes}
            onClick={() => onChange({ ...recipe, modes: undefined }, { label: 'automatic roles' })}
          >
            Use automatic roles
          </Button>
        </div>
        <section
          className="color-roles"
          aria-label="Semantic role values"
        >
          {roleColumns.map((column, index) => (
            <div
              key={index}
              className="color-roles-column"
            >
              <div
                className="color-role color-role-head"
                aria-hidden="true"
              >
                <span />
                <span>Light</span>
                <span>Dark</span>
              </div>
              {column.map(role => (
                <div
                  key={role}
                  className="color-role"
                >
                  <span className="color-role-name">{roleNames[role]}</span>
                  {modes.map(mode => {
                    const value = roleValue(session, mode, role)
                    const pinned = recipe.modes?.[mode]?.[role] !== undefined
                    const failing = problemsFor(mode, role)
                    const isSelected = selected?.mode === mode && selected.role === role
                    const stateId = `${id}-${mode}-${role}`
                    return (
                      <Changed
                        key={mode}
                        changes={changes}
                        field={`role.${mode}.${role}`}
                        label={`${mode} ${roleNames[role].toLowerCase()}`}
                        format={automatic}
                        set={next => setRole(mode, role, next)}
                      >
                        {describedBy => (
                          <>
                            <button
                              type="button"
                              className="color-role-chip"
                              aria-label={`${title(mode)} ${roleNames[role]}`}
                              aria-describedby={[stateId, describedBy].filter(Boolean).join(' ')}
                              aria-pressed={isSelected}
                              data-value={value}
                              data-pinned={pinned || undefined}
                              data-problem={failing.length > 0 || undefined}
                              disabled={disabled}
                              style={{ background: value, color: readableOn(value) }}
                              onClick={() => openWall({ kind: 'role', mode, role })}
                            >
                              {/* oxlint-disable-next-line react/forbid-elements -- The value is painted on the swatch, not inline code. */}
                              <code aria-hidden="true">{value}</code>
                              {pinned && (
                                <span
                                  className="color-role-pin"
                                  aria-hidden="true"
                                />
                              )}
                              {failing.length > 0 && (
                                <span
                                  className="color-role-warning"
                                  aria-hidden="true"
                                >
                                  !
                                </span>
                              )}
                            </button>
                            <span
                              id={stateId}
                              className="workshop-sr-only"
                            >
                              {value}, {pinned ? 'pinned' : 'automatic'}
                              {failing.length > 0 &&
                                `, contrast fails: ${failing.map(p => p.check.message || `${p.check.ratio.toFixed(2)}:1`).join('; ')}`}
                            </span>
                          </>
                        )}
                      </Changed>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </section>
        {selected && (
          <div className="color-role-detail">
            <div className="color-role-detail-head">
              <span
                className="color-role-swatch"
                aria-hidden="true"
                style={{ background: roleValue(session, selected.mode, selected.role) }}
              />
              <strong>
                {title(selected.mode)} {roleNames[selected.role]}
              </strong>
              <span className="color-role-state">
                {recipe.modes?.[selected.mode]?.[selected.role] ? 'pinned' : 'automatic'}
              </span>
            </div>
            {problemsFor(selected.mode, selected.role).length > 0 && (
              <ul
                className="color-problems"
                aria-label="Role contrast problems"
              >
                {problemsFor(selected.mode, selected.role).map(problem => (
                  <li key={`${problem.check.foregroundRole}:${problem.check.backgroundRole}`}>
                    <Fix
                      problem={problem}
                      onChange={onChange}
                    />
                  </li>
                ))}
              </ul>
            )}
            <div className="color-role-detail-controls">
              <HexField
                key={`${selected.mode}:${selected.role}`}
                label="Exact role color"
                value={roleValue(session, selected.mode, selected.role)}
                disabled={disabled}
                onValid={value =>
                  setRole(
                    selected.mode,
                    selected.role,
                    value,
                    `role.${selected.mode}.${selected.role}`
                  )
                }
              />
              <Button
                variant="outline"
                controlSize="small"
                disabled={disabled}
                aria-expanded={wallOpen}
                aria-controls={`${id}-wall`}
                onClick={() => setWallOpen(open => !open)}
              >
                {wallOpen ? 'Hide wall' : 'Pick from wall'}
              </Button>
              <Button
                variant="outline"
                controlSize="small"
                disabled={disabled || !recipe.modes?.[selected.mode]?.[selected.role]}
                onClick={() => setRole(selected.mode, selected.role, undefined)}
              >
                Clear role override
              </Button>
            </div>
          </div>
        )}
      </section>

      <Collapsible
        id={`${id}-wall`}
        className="color-wall-details"
        open={wallOpen}
        onOpenChange={setWallOpen}
      >
        <CollapsibleTrigger>
          Color wall · {wall.color.palettes.length} families ·{' '}
          {picking.kind === 'role'
            ? `pick for ${picking.mode} ${roleNames[picking.role].toLowerCase()}`
            : `pick the ${picking.name} family`}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <TableContainer
            className="color-wall-scroll"
            aria-label="Color wall"
          >
            <ColorWallGrid
              wall={wall}
              pick={wallPick}
              disabled={disabled}
              onPick={(paletteId, _stop, value) => {
                if (picking.kind === 'role') setRole(picking.mode, picking.role, value)
                else setFamily(picking.name, paletteId)
              }}
            />
          </TableContainer>
        </CollapsibleContent>
      </Collapsible>

      <section
        className="color-section color-contrast"
        aria-label="Color contrast report"
      >
        <div className="color-section-head">
          <h4>Contrast</h4>
          <output className="color-contrast-summary">
            {failures.length
              ? `${failures.length} of ${required.length} required pairs fail.`
              : `All ${required.length} required pairs pass.`}
          </output>
        </div>
        {failures.length > 0 && (
          <ul className="color-failures color-problems">
            {problems.map(problem => (
              <li
                key={`${problem.mode}:${problem.check.foregroundRole}:${problem.check.backgroundRole}`}
              >
                <Fix
                  problem={problem}
                  onChange={onChange}
                />
                <Button
                  variant="outline"
                  controlSize="small"
                  onClick={() => openWall({ kind: 'role', mode: problem.mode, role: problem.role })}
                >
                  Show {roleNames[problem.role].toLowerCase()}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Collapsible>
          <CollapsibleTrigger>All {palette.checks.length} measurements</CollapsibleTrigger>
          <CollapsibleContent>
            <TableContainer aria-label="Contrast measurements">
              <Table>
                <TableCaption>Measured foreground/background pairs</TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Mode and pair</TableHeader>
                    <TableHeader>Colors</TableHeader>
                    <TableHeader>Ratio</TableHeader>
                    <TableHeader>Result</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {palette.checks.map(c => (
                    <TableRow key={`${c.mode}:${c.foregroundRole}:${c.backgroundRole}`}>
                      <TableHeader scope="row">
                        {c.mode} · {c.foregroundRole} / {c.backgroundRole}
                      </TableHeader>
                      <TableCell>
                        {c.foreground} / {c.background}
                      </TableCell>
                      <TableCell>{c.ratio.toFixed(2)}:1</TableCell>
                      <TableCell>
                        {c.pass === null
                          ? 'Informational: inactive control'
                          : c.pass
                            ? `Pass ≥ ${c.minimum}:1`
                            : `Fail < ${c.minimum}:1`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CollapsibleContent>
        </Collapsible>
      </section>
    </div>
  )
}
