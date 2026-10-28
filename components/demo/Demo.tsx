import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import type { ReactNode } from 'react'
import { highlight } from 'fumadocs-core/highlight'
import { DemoFrame } from './DemoFrame'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/prefer-tag-over-role -- The scrollable pre needs keyboard focus and a named region, while retaining code-block semantics. */

const examplesRoot = resolve('examples')
const languages: Record<string, string> = {
  '.tsx': 'tsx',
  '.ts': 'ts',
  '.css': 'css',
  '.json': 'json'
}

/** File reads and syntax highlighting stay on the server. */
export async function Demo({
  title,
  files,
  reset,
  children
}: {
  title: string
  files: readonly string[]
  reset?: boolean
  children: ReactNode
}) {
  const sources = await Promise.all(
    files.map(async file => {
      const path = resolve(examplesRoot, file)
      const lang = languages[extname(path)]
      if (!path.startsWith(`${examplesRoot}${sep}`) || !lang) {
        throw new Error(`Unsupported demo source: ${file}`)
      }
      const code = await readFile(path, 'utf8')
      const highlighted = await highlight(code, {
        lang,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: 'light',
        components: {
          pre: props => (
            <pre
              {...props}
              tabIndex={0}
              role="region"
              aria-label={`Source: ${file}`}
            />
          )
        }
      })
      return { name: file, code, highlighted }
    })
  )

  return (
    <DemoFrame
      title={title}
      sources={sources}
      reset={reset}
    >
      {children}
    </DemoFrame>
  )
}
