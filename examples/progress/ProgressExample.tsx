'use client'
import { useId, useState } from 'react'
import { Alert, AlertDescription, Button, Progress, type ProgressProps } from '@cognitap/radiant'
export type ProgressTaskOptions = Pick<ProgressProps, 'className' | 'style'>
const column = {
  display: 'grid',
  gap: '1rem',
  width: '100%',
  maxWidth: '24rem',
  minWidth: 0
} as const
export function ExportPackage({
  unknown = false,
  ...props
}: ProgressTaskOptions & { unknown?: boolean }) {
  const id = useId(),
    [value, setValue] = useState(0),
    complete = !unknown && value === 100
  return (
    <div style={column}>
      <section
        aria-label="Export package"
        aria-busy={!complete}
        style={{ display: 'grid', gap: '1rem' }}
      >
        <label htmlFor={id}>Export progress</label>
        <Progress
          {...props}
          id={id}
          value={unknown ? null : value}
        />
        <p>
          {unknown
            ? 'Preparing the export. The remaining amount is unknown.'
            : `${value} of 100 items prepared.`}
        </p>
      </section>
      <Button
        disabled={complete || unknown}
        onClick={() => setValue(current => Math.min(100, current + 25))}
      >
        Advance export
      </Button>
      <Alert
        announce="polite"
        tone="accent"
        aria-label="Export result"
        style={complete ? undefined : { padding: 0, borderWidth: 0 }}
      >
        {complete && <AlertDescription>Export complete.</AlertDescription>}
      </Alert>
    </div>
  )
}
export function ConnectRecorder(props: ProgressTaskOptions) {
  const [connected, setConnected] = useState(false)
  return (
    <section
      aria-label="Recorder connection"
      style={column}
    >
      {connected ? (
        <p>Main recorder connected.</p>
      ) : (
        <>
          <Progress
            {...props}
            aria-label="Connecting to the recorder"
          />
          <p>Waiting for the recorder to respond.</p>
          <Button onClick={() => setConnected(true)}>Recorder responded</Button>
        </>
      )}
    </section>
  )
}
const steps = ['Reading the file', 'Matching participants', 'Checking consent', 'Saving sessions']
export function ImportStudy(props: ProgressTaskOptions) {
  const id = useId(),
    [step, setStep] = useState(1),
    text = `Step ${step} of ${steps.length}: ${steps[step - 1].toLowerCase()}`
  return (
    <section
      aria-label="Study import"
      style={column}
    >
      <label htmlFor={id}>Import progress</label>
      <Progress
        {...props}
        id={id}
        value={step}
        max={steps.length}
        aria-valuetext={text}
      />
      <p>{text}.</p>
      <Button
        disabled={step === steps.length}
        onClick={() => setStep(current => current + 1)}
      >
        Next step
      </Button>
    </section>
  )
}
const files = ['interview-01.wav', 'interview-02.wav', 'notes.md', 'consent.pdf', 'clips.zip']
export function UploadStudyFiles(props: ProgressTaskOptions) {
  const id = useId(),
    [phase, setPhase] = useState<'idle' | 'preparing' | 'uploading'>('idle'),
    [uploaded, setUploaded] = useState(0)
  const done = uploaded === files.length,
    text =
      phase === 'preparing' ? 'Preparing upload' : `${uploaded} of ${files.length} files uploaded`
  return (
    <section
      aria-label="Study files"
      style={column}
    >
      <label htmlFor={id}>Upload progress</label>
      <Progress
        {...props}
        id={id}
        value={phase === 'preparing' ? null : uploaded}
        max={files.length}
        aria-valuetext={text}
      />
      <p>
        {phase === 'uploading' && !done ? `Uploading ${files[uploaded]}. ` : ''}
        {text}.
      </p>
      <output>{done ? 'All study files uploaded.' : ''}</output>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        {phase === 'idle' ? (
          <Button onClick={() => setPhase('preparing')}>Upload files</Button>
        ) : phase === 'preparing' ? (
          <Button onClick={() => setPhase('uploading')}>Finish preparing</Button>
        ) : (
          <Button
            disabled={done}
            onClick={() => setUploaded(count => count + 1)}
          >
            Upload next file
          </Button>
        )}
      </div>
    </section>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type ProgressTask = 'export' | 'recorder' | 'import' | 'upload'
export function ProgressExample({
  task = 'export',
  unknown,
  ...options
}: ProgressTaskOptions & { task?: ProgressTask; unknown?: boolean }) {
  return (
    <MotionProvider>
      {task === 'recorder' ? (
        <ConnectRecorder {...options} />
      ) : task === 'import' ? (
        <ImportStudy {...options} />
      ) : task === 'upload' ? (
        <UploadStudyFiles {...options} />
      ) : (
        <ExportPackage
          {...options}
          unknown={unknown}
        />
      )}
    </MotionProvider>
  )
}
