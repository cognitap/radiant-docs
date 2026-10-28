import {
  parseThemeDocument as parse,
  compileThemeDocument as compile,
  updateThemeDocument as update,
  exportThemeSections as select,
  generateColorWall as generate,
  recommendColorPalette as recommend,
  updateThemeAppearance as appearance,
  type ThemeDocument,
  type ThemeSectionExport,
  type ColorWallInput,
  type ColorPaletteOptions
} from '@cognitap/radiant'
import { readThemeDocument } from './workshop-theme.ts'
import type { ColorRecipe } from './workshop-color'
import type { GeometryRecipe } from './workshop-geometry'
import manifest from '../../package.json' with { type: 'json' }

export type PortableDocument = ThemeDocument
export type SectionFile = ThemeSectionExport
export interface Recipes {
  color?: ColorRecipe
  geometry?: GeometryRecipe
}
export interface Configuration {
  kind: 'radiant-workshop'
  version: 1
  document: PortableDocument
  recipes: Recipes
}
export type ImportData = Configuration | SectionFile
export const sectionNames = [
  'color',
  'typography',
  'control',
  'surface',
  'focus',
  'motion',
  'spacing',
  'state',
  'components'
] as const
export type SectionName = (typeof sectionNames)[number]
export const maxConfigurationBytes = 262144
function record(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${label} must be an object.`)
}
function keys(value: Record<string, unknown>, allowed: string[], label: string) {
  for (const key of Object.keys(value))
    if (!allowed.includes(key)) throw new Error(`Unsupported ${label}.${key}.`)
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to read this configuration.'
}
export function jsonText(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}
function bounded(text: string) {
  if (new TextEncoder().encode(text).byteLength > maxConfigurationBytes)
    throw new Error('Configuration exceeds 256 KiB. Use a smaller configuration.')
}
function validateConfiguration(value: Record<string, unknown>): Configuration {
  keys(value, ['kind', 'version', 'document', 'recipes'], 'configuration')
  if (value.version !== 1)
    throw new Error(
      'Unsupported workshop version. Expected 1; migrate the configuration before importing.'
    )
  const document = parse(value.document)
  if (document.kind !== 'radiant-theme')
    throw new Error('A workshop configuration needs a full theme document.')
  const recipes = value.recipes ?? {}
  record(recipes, 'recipes')
  keys(recipes, ['color', 'geometry'], 'recipes')
  if (recipes.color !== undefined) {
    record(recipes.color, 'recipes.color')
    keys(recipes.color, ['input', 'working', 'modes'], 'recipes.color')
    // These public functions validate unknown JSON at runtime; their released
    // input types avoid duplicating the library's color/geometry schema here.
    const wall = generate(recipes.color.input as ColorWallInput)
    const palette = recommend(wall, {
      working: recipes.color.working,
      modes: recipes.color.modes
    } as ColorPaletteOptions)
    if (JSON.stringify(appearance(document, { palette })) !== JSON.stringify(document))
      throw new Error(
        'Color recipe does not match the authored theme. Import the theme document alone to preserve its custom values.'
      )
  }
  if (recipes.geometry !== undefined) {
    record(recipes.geometry, 'recipes.geometry')
    keys(recipes.geometry, ['values', 'modes'], 'recipes.geometry')
    record(recipes.geometry.values, 'recipes.geometry.values')
    for (const key of [
      'spacing',
      'density',
      'controlRadius',
      'surfaceRadius',
      'controlBorderWidth',
      'surfaceBorderWidth',
      'borderStyle',
      'elevation',
      'backdropOpacity'
    ]) {
      if (recipes.geometry.values[key] === undefined)
        throw new Error(
          `Saved geometry recipe is missing ${key}. Import the theme document alone to preserve its values.`
        )
    }
    if (
      JSON.stringify(
        appearance(document, { geometry: recipes.geometry as unknown as GeometryRecipe })
      ) !== JSON.stringify(document)
    )
      throw new Error(
        'Geometry recipe does not match the authored theme. Import the theme document alone to preserve its custom values.'
      )
  }
  return {
    kind: 'radiant-workshop',
    version: 1,
    document,
    recipes: JSON.parse(JSON.stringify(recipes)) as Recipes
  }
}
function configuration(document: object, recipes: Recipes): Configuration {
  const result = validateConfiguration({ kind: 'radiant-workshop', version: 1, document, recipes })
  return result
}
function read(text: string): ImportData {
  bounded(text)
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error(
      'Invalid JSON. Import a workshop configuration, full theme document or selective section file; TypeScript and CSS are export-only.'
    )
  }
  record(value, 'configuration')
  if (value.kind === 'radiant-workshop') return validateConfiguration(value)
  const parsed = parse(value)
  return parsed.kind === 'radiant-theme'
    ? { kind: 'radiant-workshop', version: 1, document: parsed, recipes: {} }
    : parsed
}
function apply(
  current: Configuration,
  imported: ImportData,
  mode: 'merge' | 'replace'
): Configuration {
  if (imported.kind === 'radiant-workshop')
    return configuration(imported.document, imported.recipes)
  const document = update(current.document, imported.sections, mode)
  const affected = Object.keys(imported.sections)
  const recipes = { ...current.recipes }
  if (affected.some(name => ['color', 'surface'].includes(name))) delete recipes.color
  if (affected.some(name => ['control', 'spacing', 'surface'].includes(name)))
    delete recipes.geometry
  return configuration(document, recipes)
}
function typedTheme(document: PortableDocument, names?: SectionName[]): string {
  if (names) {
    if (names.length !== 1 || (names[0] !== 'typography' && names[0] !== 'motion'))
      throw new Error('Typed partial output supports Typography or Motion only.')
    const name = names[0]
    const section = select(document, names).sections[name] ?? {}
    const applyName = name === 'motion' ? 'applyMotion' : 'applyTypography'
    return `import { updateThemeDocument, type ThemeDocument } from '@cognitap/radiant'\n\nexport const ${name} = ${JSON.stringify(section, null, 2)} satisfies NonNullable<ThemeDocument['sections']['${name}']>\n\nexport function ${applyName}(target: ThemeDocument, mode: 'merge' | 'replace' = 'replace') {\n  return updateThemeDocument(target, { ${name} }, mode)\n}\n`
  }
  return `import { compileThemeDocument, type ThemeDocument } from '@cognitap/radiant'\n\nexport const themeDocument = ${JSON.stringify(document, null, 2)} satisfies ThemeDocument\n\nexport const theme = compileThemeDocument(themeDocument)\n`
}
function safeCSS(value: string): boolean {
  if (/[;{}<>]|\/\*|\*\//.test(value)) return false
  let quote = '',
    escaped = false
  const stack: string[] = []
  for (const char of value) {
    if (escaped) {
      if (char === '\n' || char === '\r') return false
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (quote) {
      if (char === quote) quote = ''
      continue
    }
    if (char === '"' || char === "'") quote = char
    else if (char === '(' || char === '[') stack.push(char)
    else if (char === ')' || char === ']') {
      if (stack.pop() !== (char === ')' ? '(' : '[')) return false
    }
  }
  return !quote && !escaped && stack.length === 0
}
function cssOutput(document: PortableDocument, names?: SectionName[]): string {
  const partial = names !== undefined
  if (partial && (names.length !== 1 || names[0] !== 'typography'))
    throw new Error('CSS partial output currently supports Typography only.')
  const theme = compile(document)
  // Match the installed ThemeScope contract, retaining older typography aliases.
  const typography = Object.hasOwn(theme.modes.light, '--rad-typography-roles-ui-body-family')
    ? `  font-family: var(--rad-typography-roles-ui-body-family);\n  font-size: var(--rad-typography-roles-ui-body-size);\n  font-weight: var(--rad-typography-roles-ui-body-weight);\n  line-height: var(--rad-typography-roles-ui-body-line-height);\n  letter-spacing: var(--rad-typography-roles-ui-body-letter-spacing);`
    : `  font-family: var(--rad-typography-family);\n  font-size: var(--rad-typography-body-size);\n  font-weight: var(--rad-typography-body-weight);\n  letter-spacing: var(--rad-typography-letter-spacing);`
  const declarations = (mode: 'light' | 'dark') =>
    Object.entries(theme.modes[mode])
      .filter(([key]) => !partial || key.startsWith('--rad-typography-'))
      .map(([key, value]) => {
        // CSS is an optional text artifact, narrower than the runtime's arbitrary CSS
        // strings. Refuse declaration/style-tag delimiters instead of rewriting them.
        if (!safeCSS(String(value)))
          throw new Error(
            `CSS export cannot represent ${key}. Use the typed theme or configuration file for this value.`
          )
        return `  ${key}: ${value};`
      })
      .join('\n')
  if (partial)
    return `/* Typography only. Load Radiant styles, then apply class="radiant-typography" and data-rad-mode.\n   Color, control metrics, surfaces, motion and component exceptions inherit from your application. */\n.radiant-typography {\n${declarations('light')}\n${typography}\n}\n.radiant-typography[data-rad-mode="dark"] {\n${declarations('dark')}\n}\n@media (prefers-color-scheme: dark) {\n  .radiant-typography[data-rad-mode="system"] {\n${declarations('dark')}\n  }\n}\n`
  return `/* Load @cognitap/radiant/styles.css first. Apply class="radiant-export"\n   and data-rad-mode="light", "dark" or "system" to a plain wrapper.\n   CSS tokens only: spring profiles require the typed theme and MotionProvider.\n   No sampled spring curve is emitted; CSS transitions cannot retain spring momentum. */\n.radiant-export {\n${declarations('light')}\n  color-scheme: light;\n  background: var(--rad-surface-canvas);\n  color: var(--rad-color-foreground);\n${typography}\n}\n.radiant-export[data-rad-mode="dark"] {\n${declarations('dark')}\n  color-scheme: dark;\n}\n@media (prefers-color-scheme: dark) {\n  .radiant-export[data-rad-mode="system"] {\n${declarations('dark')}\n    color-scheme: dark;\n  }\n}\n`
}
/** The exact installed versions; a local candidate path installs from its archive. */
function installCommand(withReact: boolean): string {
  const dependencies = manifest.dependencies
  const radiant = dependencies['@cognitap/radiant']
  const packageArgument = radiant.startsWith('file:')
    ? radiant.slice('file:'.length)
    : `@cognitap/radiant@${radiant}`
  return withReact
    ? `pnpm add ${packageArgument} react@${dependencies.react} react-dom@${dependencies['react-dom']}`
    : `pnpm add ${packageArgument}`
}
function runtimeSetup(): { install: string; source: string } {
  return {
    install: installCommand(true),
    source: `'use client'\n\nimport type { ReactNode } from 'react'\nimport { Button, Collapsible, CollapsibleTrigger, CollapsibleContent, ThemeScope } from '@cognitap/radiant'\nimport { MotionProvider } from '@cognitap/radiant/motion/react'\nimport { theme } from './radiant-theme'\nimport '@cognitap/radiant/styles.css'\n\n// Save the full typed theme as radiant-theme.ts beside this file.\n// For a motion-only export, applyMotion(target) returns a document; compile it\n// with compileThemeDocument and export that theme from radiant-theme.ts.\n// The installed Radiant package owns its Motion engine dependency.\n// System reduced motion stays live; theme mode 'off' disables spatial motion.\nexport function RadiantMotion({ children }: { children?: ReactNode }) {\n  return (\n    <ThemeScope theme={theme} mode="system">\n      <MotionProvider>{children}</MotionProvider>\n    </ThemeScope>\n  )\n}\n\nexport function MotionExample() {\n  return (\n    <RadiantMotion>\n      <Button type="button">Press me</Button>\n      <Collapsible>\n        <CollapsibleTrigger>Details</CollapsibleTrigger>\n        <CollapsibleContent>Native disclosure with spring presentation.</CollapsibleContent>\n      </Collapsible>\n    </RadiantMotion>\n  )\n}\n`
  }
}
export const handoffAPI = {
  configuration,
  read,
  apply,
  typedTheme,
  cssOutput,
  installCommand,
  runtimeSetup,
  sections: (document: object, names: SectionName[]): SectionFile =>
    select(readThemeDocument(document), names)
}
