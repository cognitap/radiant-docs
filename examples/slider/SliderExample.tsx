'use client'
import { useState } from 'react'
import { Button, Field, Slider, type SliderProps } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
export type SliderTaskOptions = Pick<SliderProps, 'controlSize'> & { dir?: 'ltr' | 'rtl' }
const panelStyle = {
  display: 'grid',
  gap: '1.25rem',
  width: '100%',
  maxWidth: '28rem',
  minWidth: 0
} as const
export function SetListeningPreferences({ dir, ...props }: SliderTaskOptions) {
  const ready = useHydrated(),
    [volume, setVolume] = useState(50),
    [message, setMessage] = useState('No changes saved.')
  return (
    <form
      aria-label="Listening preferences"
      dir={dir}
      style={panelStyle}
      onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setMessage(`Saved volume ${data.get('volume')}% and chime ${data.get('chime')}%.`)
      }}
      onReset={() => {
        setVolume(50)
        setMessage('Preferences reset.')
      }}
    >
      <Field
        label="Workspace volume"
        description={`${volume}%`}
      >
        <Slider
          {...props}
          name="volume"
          value={volume}
          step={5}
          aria-valuetext={`${volume} percent`}
          onChange={event => setVolume(event.target.valueAsNumber)}
        />
      </Field>
      <Field
        label="Notification chime"
        description="How loudly new notifications arrive."
      >
        <Slider
          {...props}
          name="chime"
          defaultValue={30}
          step={5}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          disabled={!ready}
        >
          Save preferences
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={!ready}
        >
          Reset preferences
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function ShowTheCurrentValue({ dir, ...props }: SliderTaskOptions) {
  const [brightness, setBrightness] = useState(70)
  return (
    <div
      dir={dir}
      style={panelStyle}
    >
      <Field label="Screen brightness">
        <Slider
          {...props}
          value={brightness}
          step={10}
          aria-valuetext={`${brightness} percent`}
          onChange={event => setBrightness(event.target.valueAsNumber)}
        />
      </Field>
      <p style={{ margin: 0 }}>Brightness: {brightness}%</p>
      <Button
        variant="outline"
        tone="neutral"
        style={{ justifySelf: 'start' }}
        onClick={() => setBrightness(70)}
      >
        Restore default
      </Button>
    </div>
  )
}
const speeds = [0.5, 1, 1.5, 2]
export function LabelSteppedMarks({ dir, ...props }: SliderTaskOptions) {
  const [speed, setSpeed] = useState(1)
  return (
    <div
      dir={dir}
      style={panelStyle}
    >
      <Field
        label="Playback speed"
        description="Quarter steps from half to double speed."
      >
        <Slider
          {...props}
          name="speed"
          min={0.5}
          max={2}
          step={0.25}
          value={speed}
          aria-valuetext={`${speed}× speed`}
          onChange={event => setSpeed(event.target.valueAsNumber)}
        />
        <div
          aria-hidden="true"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {speeds.map(mark => (
            <span key={mark}>{mark}×</span>
          ))}
        </div>
      </Field>
    </div>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type SliderTask = 'preferences' | 'value' | 'steps'
export function SliderExample({
  task = 'preferences',
  ...props
}: SliderTaskOptions & { task?: SliderTask }) {
  return (
    <MotionProvider>
      {task === 'value' ? (
        <ShowTheCurrentValue {...props} />
      ) : task === 'steps' ? (
        <LabelSteppedMarks {...props} />
      ) : (
        <SetListeningPreferences {...props} />
      )}
    </MotionProvider>
  )
}
