import { Field, Textarea } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function TextareaExample() {
  return (
    <Field
      label="Notes"
      style={{ width: '100%', maxWidth: '26rem' }}
    >
      <Textarea
        name="notes"
        rows={3}
        placeholder="Write a note…"
        style={{ fieldSizing: 'content', maxHeight: '12rem', resize: 'none' }}
      />
    </Field>
  )
}
