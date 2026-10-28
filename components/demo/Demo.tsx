import type { ReactNode } from 'react'
import { DemoFrame } from './DemoFrame'
import { highlightSource } from './highlight-source'

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
  return (
    <DemoFrame
      title={title}
      sources={await Promise.all(files.map(highlightSource))}
      reset={reset}
    >
      {children}
    </DemoFrame>
  )
}
