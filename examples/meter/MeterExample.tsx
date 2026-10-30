'use client'
import { useId, useState } from 'react'
import { Button, Field, Meter, NativeSelect, type MeterProps } from '@cognitap/radiant'
export type MeterTaskOptions = Pick<MeterProps, 'className' | 'style' | 'dir'>
const initialFiles = [
  { id: 'recordings', name: 'Interview recordings', size: 4200 },
  { id: 'notes', name: 'Research notes', size: 1800 },
  { id: 'clips', name: 'Reference clips', size: 1200 }
]
export function ManageRecordingStorage(props: MeterTaskOptions) {
  const id = useId(),
    [files, setFiles] = useState(initialFiles),
    [serial, setSerial] = useState(1),
    [message, setMessage] = useState('Recording storage is shared by the study.')
  const used = files.reduce((sum, file) => sum + file.size, 0),
    text = `${(used / 1000).toFixed(1)} GB of 10 GB used`
  return (
    <section
      aria-label="Recording storage"
      style={{
        display: 'grid',
        gap: '1rem',
        width: '100%',
        maxWidth: '24rem',
        minWidth: 0
      }}
    >
      <label htmlFor={id}>Recording storage used</label>
      <Meter
        {...props}
        id={id}
        value={used / 1000}
        max={10}
        low={6}
        high={8.5}
        optimum={0}
        aria-valuetext={text}
      />
      <p>{text}. Warning band: 6–8.5 GB.</p>
      <ul>
        {files.map(file => (
          <li key={file.id}>
            {file.name}: {(file.size / 1000).toFixed(1)} GB
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          disabled={used + 800 > 10000}
          onClick={() => {
            setFiles(current => [
              ...current,
              { id: `sample-${serial}`, name: `Sample ${serial}`, size: 800 }
            ])
            setSerial(current => current + 1)
            setMessage('Added a sample recording.')
          }}
        >
          Add sample recording
        </Button>
        <Button
          variant="outline"
          disabled={!files.some(file => file.id === 'recordings')}
          onClick={() => {
            setFiles(current => current.filter(file => file.id !== 'recordings'))
            setMessage('Archived interview recordings.')
          }}
        >
          Archive interviews
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </section>
  )
}
const recorders = {
  main: { name: 'Main recorder', battery: 80, minutes: 160 },
  spare: { name: 'Spare recorder', battery: 35, minutes: 70 },
  travel: { name: 'Travel recorder', battery: 10, minutes: 20 }
}
export function ChooseRecorder(props: MeterTaskOptions) {
  const id = useId(),
    [device, setDevice] = useState<keyof typeof recorders>('main'),
    record = recorders[device]
  return (
    <section
      aria-label="Recorder readiness"
      style={{
        display: 'grid',
        gap: '1rem',
        width: '100%',
        maxWidth: '24rem',
        minWidth: 0
      }}
    >
      <Field label="Recorder">
        <NativeSelect
          value={device}
          onChange={event => {
            const key = event.target.value
            if (key === 'main' || key === 'spare' || key === 'travel') setDevice(key)
          }}
        >
          <option value="main">Main recorder</option>
          <option value="spare">Spare recorder</option>
          <option value="travel">Travel recorder</option>
        </NativeSelect>
      </Field>
      <label htmlFor={id}>Recorder battery</label>
      <Meter
        {...props}
        id={id}
        value={record.battery}
        max={100}
        low={20}
        high={50}
        optimum={100}
        aria-valuetext={`${record.battery}% battery remaining`}
      />
      <p>
        {record.battery}% battery remaining; {record.minutes} minutes estimated recording time.
      </p>
      <p>Prefer at least 50% capacity; below 20% needs charging.</p>
    </section>
  )
}
const rooms = {
  focus: { name: 'Focus room', temperature: 21, seats: 8 },
  studio: { name: 'Window studio', temperature: 28, seats: 4 },
  quiet: { name: 'Quiet room', temperature: 15, seats: 2 }
}
export function ChooseStudyRoom(props: MeterTaskOptions) {
  const id = useId(),
    [room, setRoom] = useState<keyof typeof rooms>('focus'),
    record = rooms[room],
    inside = record.temperature >= 18 && record.temperature <= 24
  return (
    <section
      aria-label="Study room conditions"
      style={{
        display: 'grid',
        gap: '1rem',
        width: '100%',
        maxWidth: '24rem',
        minWidth: 0
      }}
    >
      <Field label="Study room">
        <NativeSelect
          value={room}
          onChange={event => {
            const key = event.target.value
            if (key === 'focus' || key === 'studio' || key === 'quiet') setRoom(key)
          }}
        >
          <option value="focus">Focus room</option>
          <option value="studio">Window studio</option>
          <option value="quiet">Quiet room</option>
        </NativeSelect>
      </Field>
      <label htmlFor={id}>Room temperature</label>
      <Meter
        {...props}
        id={id}
        min={0}
        max={40}
        value={record.temperature}
        low={18}
        high={24}
        optimum={21}
        aria-valuetext={`${record.temperature} degrees Celsius; ${inside ? 'inside' : 'outside'} the configured comfort band`}
      />
      <p>{record.temperature} °C. Configured comfort band: 18–24 °C.</p>
      <p>
        {record.name} has {record.seats} seats.
      </p>
    </section>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type MeterTask = 'storage' | 'recorder' | 'room'
export function MeterExample({
  task = 'storage',
  ...options
}: MeterTaskOptions & { task?: MeterTask }) {
  return (
    <MotionProvider>
      {task === 'room' ? (
        <ChooseStudyRoom {...options} />
      ) : task === 'recorder' ? (
        <ChooseRecorder {...options} />
      ) : (
        <ManageRecordingStorage {...options} />
      )}
    </MotionProvider>
  )
}
