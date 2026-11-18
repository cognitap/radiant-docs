'use client'

import { InlineEdit } from '@cognitap/radiant'

export function RenameProject() {
  return (
    <InlineEdit
      style={{ width: '100%', maxWidth: '24rem' }}
      defaultValue="Spring launch"
      editLabel="Rename project"
      inputLabel="Project name"
      validate={draft => {
        const name = draft.trim()
        if (!name) return 'Enter a project name.'
        if (name.toLowerCase() === 'archive') return 'Archive is already in use.'
      }}
    />
  )
}
