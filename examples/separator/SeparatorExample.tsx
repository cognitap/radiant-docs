import { Button, Separator, type SeparatorProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type SeparatorOptions = Pick<SeparatorProps, 'style'>
export function SettingsSections(options: SeparatorOptions) {
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '32rem' }}>
      <section>
        <h3>Account details</h3>
        <p>Your name and email address.</p>
      </section>
      <Separator {...options} />
      <section>
        <h3>Notification preferences</h3>
        <p>Choose which updates you receive.</p>
      </section>
    </div>
  )
}
export function EditorActions(options: SeparatorOptions) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem' }}>
      <Button variant="outline">Undo</Button>
      <Button variant="outline">Redo</Button>
      <Separator
        {...options}
        orientation="vertical"
      />
      <Button variant="outline">Preview</Button>
      <Button>Publish</Button>
    </div>
  )
}
export function ReleaseNotes(options: SeparatorOptions) {
  return (
    <article style={{ width: '100%', maxWidth: '32rem' }}>
      <h3 style={{ marginBottom: '.5rem' }}>Release notes</h3>
      <Separator
        {...options}
        decorative
      />
      <p>Recordings now sync across devices, and exports keep chapter markers.</p>
    </article>
  )
}
