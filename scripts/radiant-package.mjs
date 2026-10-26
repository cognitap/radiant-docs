import assert from 'node:assert/strict'
import * as Radiant from '@cognitap/radiant'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
let directory = path.dirname(require.resolve('@cognitap/radiant'))
let installed

// package.json is not a public export. Read metadata beside the resolved public entry.
while (directory !== path.dirname(directory)) {
  try {
    const manifest = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'))
    if (manifest.name === '@cognitap/radiant') {
      installed = manifest
      break
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  directory = path.dirname(directory)
}

if (!installed) throw new Error('Cannot identify the installed Radiant package.')

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const candidate = process.env.RADIANT_CANDIDATE ?? ''
const specifier = manifest.dependencies['@cognitap/radiant']

if (candidate ? !specifier.startsWith('file:') : specifier !== installed.version) {
  throw new Error(
    'Normal builds require an exact Radiant version. Use preview:candidate for a tarball.'
  )
}

export const radiantPackage = { version: installed.version, candidate }

// Exercise the installed API on both registry releases and packed candidates.
// Candidate labeling is provenance, not a switch that enables editing.
export const workshopAvailable =
  [
    'themeDocumentFromDefinition',
    'parseThemeDocument',
    'compileThemeDocument',
    'updateThemeDocument',
    'exportThemeSections',
    'generateColorWall',
    'recommendColorPalette',
    'updateThemeAppearance'
  ].every(name => typeof Reflect.get(Radiant, name) === 'function') &&
  Array.isArray(Reflect.get(Radiant, 'colorCalibrationPresets'))
if (candidate || installed.version !== '0.0.3')
  assert.equal(
    workshopAvailable,
    true,
    'Workshop releases/candidates must expose the complete public API.'
  )
