'use client'

import { useEffect, useState } from 'react'
import { Button } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'

export function ButtonExample() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  useEffect(() => {
    if (status !== 'saving') return
    const timer = setTimeout(() => setStatus('saved'), 900)
    return () => clearTimeout(timer)
  }, [status])

  return (
    <MotionProvider>
      <form
        style={{ display: 'grid', justifyItems: 'start', gap: '0.5rem' }}
        onSubmit={event => {
          event.preventDefault()
          setStatus('saving')
        }}
      >
        <Button
          type="submit"
          pending={status === 'saving'}
        >
          Save changes
        </Button>
        <output style={{ minBlockSize: '1lh' }}>
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved.' : ''}
        </output>
      </form>
    </MotionProvider>
  )
}
