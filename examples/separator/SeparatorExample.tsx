'use client'

import { Separator } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function SeparatorExample({
  decorative = false,
  orientation = 'horizontal'
}: {
  decorative?: boolean
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'row' : 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '32rem',
        height: orientation === 'vertical' ? '12rem' : undefined,
        padding: '1rem',
        boxSizing: 'border-box'
      }}
    >
      <section style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
        <h3>Account details</h3>
        <p>Your name and email address.</p>
      </section>
      <Separator
        decorative={decorative}
        orientation={orientation}
      />
      <section style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
        <h3>Notification preferences</h3>
        <p>Choose which updates you receive.</p>
      </section>
    </div>
  )
}
