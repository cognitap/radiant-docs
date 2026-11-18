'use client'
import { Tree, type TreeItem } from '@cognitap/radiant'

const files: readonly TreeItem[] = [
  {
    value: 'archive',
    label: 'Archive',
    loadChildren: async () => [{ value: 'minutes', label: 'Meeting minutes' }]
  }
]

export function LoadArchive() {
  return (
    <Tree
      aria-label="Archived files"
      items={files}
      className="w-full max-w-sm"
    />
  )
}
