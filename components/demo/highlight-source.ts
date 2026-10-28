import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { getHighlighter } from 'fumadocs-core/highlight'
import type { DemoSource } from './DemoFrame'

const examplesRoot = resolve('examples')
const languages: Partial<Record<string, 'tsx' | 'ts' | 'css' | 'json'>> = {
  '.tsx': 'tsx',
  '.ts': 'ts',
  '.css': 'css',
  '.json': 'json'
}
const themes = { light: 'github-light', dark: 'github-dark' } as const

/** File reads and syntax highlighting stay on the server. */
export async function highlightSource(file: string): Promise<DemoSource> {
  const path = resolve(examplesRoot, file)
  const lang = languages[extname(path)]
  if (!path.startsWith(`${examplesRoot}${sep}`) || !lang) {
    throw new Error(`Unsupported demo source: ${file}`)
  }
  const code = await readFile(path, 'utf8')
  const highlighter = await getHighlighter('js', { langs: [lang], themes: Object.values(themes) })
  const html = highlighter.codeToHtml(code, {
    lang,
    themes,
    defaultColor: 'light',
    transformers: [
      {
        pre(node) {
          // The scrollable pre needs keyboard focus and a named region.
          Object.assign(node.properties, {
            tabindex: 0,
            role: 'region',
            'aria-label': `Source: ${file}`
          })
        }
      }
    ]
  })
  return { name: file, code, html }
}
