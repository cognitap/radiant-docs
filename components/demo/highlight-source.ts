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

/** File reads and syntax highlighting stay on the server. `html` is the highlighted lines. */
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
    defaultColor: false,
    // CodeBlock owns the pre and code elements, so keep only the highlighted lines.
    transformers: [
      {
        root(root) {
          const pre = root.children.find(node => node.type === 'element')
          const element = pre?.children.find(node => node.type === 'element')
          if (!element) throw new Error('Shiki output has no code element.')
          return { ...root, children: element.children }
        }
      }
    ]
  })
  return { name: file, code, html }
}
