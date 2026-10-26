import * as Radiant from '@cognitap/radiant'
import type { Theme } from '@cognitap/radiant'
import type { ColorRecipe } from './workshop-color'
import type { GeometryRecipe } from './workshop-geometry'

// Consumption views only: the installed Radiant parser owns the document schema.
export interface PortableDocument {
  kind: 'radiant-theme'
  version: 1
  id: string
  name: string
  sections: Record<string, unknown>
}
export interface SectionFile {
  kind: 'radiant-theme-sections'
  version: 1
  sections: Record<string, unknown>
}
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
const packageExports: object = Radiant
const parse = Reflect.get(packageExports, 'parseThemeDocument')
const compile = Reflect.get(packageExports, 'compileThemeDocument')
const update = Reflect.get(packageExports, 'updateThemeDocument')
const select = Reflect.get(packageExports, 'exportThemeSections')
const generate = Reflect.get(packageExports, 'generateColorWall')
const recommend = Reflect.get(packageExports, 'recommendColorPalette')
const appearance = Reflect.get(packageExports, 'updateThemeAppearance')
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
  const document = parse(value.document) as PortableDocument
  if (document.kind !== 'radiant-theme')
    throw new Error('A workshop configuration needs a full theme document.')
  const recipes = value.recipes ?? {}
  record(recipes, 'recipes')
  keys(recipes, ['color', 'geometry'], 'recipes')
  if (recipes.color !== undefined) {
    if (![generate, recommend, appearance].every(fn => typeof fn === 'function'))
      throw new Error('This package cannot restore color recipes.')
    record(recipes.color, 'recipes.color')
    keys(recipes.color, ['input', 'working', 'modes'], 'recipes.color')
    const wall = generate(recipes.color.input)
    const palette = recommend(wall, { working: recipes.color.working, modes: recipes.color.modes })
    if (JSON.stringify(appearance(document, { palette })) !== JSON.stringify(document))
      throw new Error(
        'Color recipe does not match the authored theme. Import the theme document alone to preserve its custom values.'
      )
  }
  if (recipes.geometry !== undefined) {
    if (typeof appearance !== 'function')
      throw new Error('This package cannot restore geometry recipes.')
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
      JSON.stringify(appearance(document, { geometry: recipes.geometry })) !==
      JSON.stringify(document)
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
  const parsed = parse(value) as PortableDocument | SectionFile
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
  const document = update(current.document, imported.sections, mode) as PortableDocument
  const affected = Object.keys(imported.sections)
  const recipes = { ...current.recipes }
  if (affected.some(name => ['color', 'surface'].includes(name))) delete recipes.color
  if (affected.some(name => ['control', 'spacing', 'surface'].includes(name)))
    delete recipes.geometry
  return configuration(document, recipes)
}
function typedTheme(document: PortableDocument): string {
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
function cssOutput(document: PortableDocument): string {
  const theme = compile(document) as Theme
  const declarations = (mode: 'light' | 'dark') =>
    Object.entries(theme.modes[mode])
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
  return `/* Load @cognitap/radiant/styles.css first. Apply class="radiant-export"\n   and data-rad-mode="light", "dark" or "system" to a plain wrapper. */\n.radiant-export {\n${declarations('light')}\n  color-scheme: light;\n  background: var(--rad-surface-canvas);\n  color: var(--rad-color-foreground);\n  font-family: var(--rad-typography-family);\n  font-size: var(--rad-typography-body-size);\n  font-weight: var(--rad-typography-body-weight);\n  letter-spacing: var(--rad-typography-letter-spacing);\n}\n.radiant-export[data-rad-mode="dark"] {\n${declarations('dark')}\n  color-scheme: dark;\n}\n@media (prefers-color-scheme: dark) {\n  .radiant-export[data-rad-mode="system"] {\n${declarations('dark')}\n    color-scheme: dark;\n  }\n}\n`
}
export const handoffAPI = [parse, compile, update, select].every(fn => typeof fn === 'function')
  ? {
      configuration,
      read,
      apply,
      typedTheme,
      cssOutput,
      sections: (document: object, names: SectionName[]): SectionFile =>
        select(document, names) as SectionFile
    }
  : null
