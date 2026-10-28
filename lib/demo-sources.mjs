import { access, readdir, readFile } from 'node:fs/promises'
import { extname, join, posix } from 'node:path'

export const sourceExtensions = ['.tsx', '.ts', '.css', '.json']

/**
 * Every source file in one examples directory, sorted, followed by the files it imports from
 * sibling example directories, so a listing cannot drift from the directory.
 * @param {string} examplesRoot absolute path of `examples/`
 * @param {string} dir directory under `examplesRoot`
 * @returns {Promise<string[]>} paths relative to `examplesRoot`
 */
export async function exampleSources(examplesRoot, dir) {
  const names = (await readdir(join(examplesRoot, dir)))
    .filter(name => sourceExtensions.includes(extname(name)))
    .sort()
  const own = names.map(name => posix.join(dir, name))
  const imported = new Set()
  for (const file of own) {
    const code = await readFile(join(examplesRoot, file), 'utf8')
    for (const [, specifier] of code.matchAll(/from '(\.\.\/[^']+)'/g)) {
      const target = posix.join(dir, specifier)
      if (target.startsWith('..')) continue
      const candidates = extname(target) ? [target] : ['.ts', '.tsx'].map(ext => target + ext)
      for (const candidate of candidates) {
        if (
          sourceExtensions.includes(extname(candidate)) &&
          (await exists(examplesRoot, candidate))
        )
          imported.add(candidate)
      }
    }
  }
  return [...own, ...[...imported].sort()]
}

async function exists(root, file) {
  return access(join(root, file)).then(
    () => true,
    () => false
  )
}
