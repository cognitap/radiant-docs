'use client'
import { useState } from 'react'
import { Button, Field, TreeSelect } from '@cognitap/radiant'

const categories = [
  {
    value: 'library',
    label: 'Library',
    children: [
      { value: 'articles', label: 'Articles' },
      { value: 'books', label: 'Books' }
    ]
  }
]
export function SendLibrarySelection() {
  const [submitted, setSubmitted] = useState('')
  return (
    <div className="grid w-full max-w-sm gap-2">
      <form
        className="grid gap-2"
        onSubmit={event => {
          event.preventDefault()
          setSubmitted(new FormData(event.currentTarget).getAll('library').join(', '))
        }}
      >
        <Field
          label="Library sections"
          required
        >
          <TreeSelect
            items={categories}
            type="multiple"
            checkboxes
            name="library"
            defaultExpanded={['library']}
            defaultValue={['books']}
          />
        </Field>
        <Button type="submit">Save sections</Button>
      </form>
      <output className="text-sm">{submitted && 'Saved ' + submitted}</output>
    </div>
  )
}
