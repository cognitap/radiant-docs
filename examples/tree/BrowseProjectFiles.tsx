'use client'
import { Tree } from '@cognitap/radiant'

export function BrowseProjectFiles() {
  return (
    <Tree
      aria-label="Project files"
      className="w-full max-w-sm"
      items={[
        {
          value: 'drafts',
          label: 'Drafts',
          children: [
            { value: 'brief', label: 'Project brief' },
            { value: 'timeline', label: 'Timeline' }
          ]
        },
        { value: 'readme', label: 'Read me' }
      ]}
    />
  )
}
