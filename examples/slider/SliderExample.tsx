'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Slider
} from '@cognitap/radiant'

import { useHydrated } from '../profile/useHydrated'

export function SliderSettingsExample() {
  const ready = useHydrated()
  const [volume, setVolume] = useState(50)
  const [feedback, setFeedback] = useState('No changes saved')
  return (
    <Card style={{ maxWidth: '36rem', minWidth: 0 }}>
      <CardHeader>
        <CardTitle>Find your balance</CardTitle>
        <CardDescription>Make your workspace sound right for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          aria-label="Listening preferences"
          style={{ display: 'grid', gap: '1.5rem', minWidth: 0 }}
          onSubmit={event => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            setFeedback(
              `Saved locally: volume ${data.get('volume')}%; chime ${data.get('chime')}%.`
            )
          }}
          onReset={() => {
            setVolume(50)
            setFeedback('Preferences reset')
          }}
        >
          <Field
            label="Workspace volume"
            description="Set the volume for workspace audio."
          >
            <Slider
              name="volume"
              value={volume}
              min={0}
              max={100}
              step={5}
              aria-valuetext={`${volume} percent`}
              onChange={event => setVolume(event.target.valueAsNumber)}
            />
            <span aria-hidden="true">{volume}%</span>
          </Field>
          <Field
            label="Notification chime"
            description="Choose how loudly new notifications arrive."
          >
            <Slider
              name="chime"
              defaultValue={30}
              min={0}
              max={100}
              step={5}
            />
          </Field>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              type="submit"
              disabled={!ready}
            >
              Save preferences
            </Button>
            <Button
              type="reset"
              disabled={!ready}
              variant="outline"
              tone="neutral"
            >
              Reset preferences
            </Button>
          </div>
          <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
        </form>
      </CardContent>
    </Card>
  )
}
