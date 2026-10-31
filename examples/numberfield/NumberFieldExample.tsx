'use client'
import { useState } from 'react'
import { Button, Field, NumberField, NativeSelect, type NumberFieldProps } from '@cognitap/radiant'

export type NumberFieldTaskOptions = Pick<
  NumberFieldProps,
  | 'controlSize'
  | 'dir'
  | 'disabled'
  | 'readOnly'
  | 'className'
  | 'style'
  | 'parts'
  | 'incrementLabel'
  | 'decrementLabel'
>
const layout = { display: 'grid', gap: '1rem', width: 'min(30rem,100%)', minWidth: 0 }
export function PlanParticipantSessions(options: NumberFieldTaskOptions) {
  const [plan, setPlan] = useState('')
  return (
    <form
      aria-label="Session participants"
      dir={options.dir}
      style={layout}
      onSubmit={event => {
        event.preventDefault()
        const count = Number(new FormData(event.currentTarget).get('participants'))
        setPlan(
          'Session planned for ' + count + ' participants; ' + count * 15 + ' participant-minutes.'
        )
      }}
    >
      <Field
        label="Participants"
        description="One to twelve participants. Each task takes fifteen minutes."
        required
        disabled={options.disabled}
      >
        <NumberField
          {...options}
          name="participants"
          defaultValue={3}
          min={1}
          max={12}
          step={1}
          largeStep={5}
          incrementLabel={options.incrementLabel ?? 'Increase participants'}
          decrementLabel={options.decrementLabel ?? 'Decrease participants'}
        />
      </Field>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button
          type="submit"
          disabled={options.disabled}
        >
          Plan session
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={options.disabled}
        >
          Reset participants
        </Button>
      </div>
      <output
        aria-live="polite"
        dir="auto"
      >
        {plan}
      </output>
    </form>
  )
}
export function CalculateSessionBudget(options: NumberFieldTaskOptions) {
  const [locale, setLocale] = useState('de-DE')
  const [result, setResult] = useState('')
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' })
  return (
    <form
      aria-label="Session budget"
      dir={options.dir}
      style={layout}
      onSubmit={event => {
        event.preventDefault()
        const raw = Number(new FormData(event.currentTarget).get('rate'))
        setResult(
          'Four sessions cost ' + formatter.format(raw * 4) + '. Raw session rate: ' + raw + '.'
        )
      }}
    >
      <Field label="Number locale">
        <NativeSelect
          value={locale}
          onChange={event => setLocale(event.currentTarget.value)}
          controlSize={options.controlSize}
        >
          <option value="de-DE">Deutsch</option>
          <option value="fr-FR">Français</option>
          <option value="en-US">English</option>
          <option value="ar-EG">العربية</option>
        </NativeSelect>
      </Field>
      <Field
        label="Session rate"
        required
        disabled={options.disabled}
        description="Enter a euro amount; the form submits its raw decimal value."
      >
        <NumberField
          {...options}
          name="rate"
          defaultValue={12.5}
          locale={locale}
          formatOptions={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }}
          min={0}
          max={500}
          step={0.25}
          largeStep={5}
          incrementLabel={options.incrementLabel ?? 'Increase session rate'}
          decrementLabel={options.decrementLabel ?? 'Decrease session rate'}
        />
      </Field>
      <Button
        type="submit"
        disabled={options.disabled}
      >
        Calculate four sessions
      </Button>
      <output
        aria-live="polite"
        dir="auto"
      >
        {result}
      </output>
    </form>
  )
}
export function ChooseAccuracyTarget(options: NumberFieldTaskOptions) {
  const [target, setTarget] = useState<number | null>(0.85),
    [feedback, setFeedback] = useState('')
  return (
    <form
      aria-label="Accuracy target"
      dir={options.dir}
      style={layout}
      onReset={() => {
        setTarget(0.85)
        setFeedback('Target restored.')
      }}
      onSubmit={event => {
        event.preventDefault()
        setFeedback(
          'Accuracy target saved. Raw value: ' +
            new FormData(event.currentTarget).get('target') +
            '.'
        )
      }}
    >
      <Field
        label="Required accuracy"
        required
        disabled={options.disabled}
        description="Choose 50% to 95%. The application reviews requests above 95% before accepting them."
      >
        <NumberField
          {...options}
          name="target"
          value={target}
          onValueChange={value => {
            if (value !== null && value > 0.95) {
              setFeedback('Targets above 95% need review.')
              return
            }
            setTarget(value)
            setFeedback('')
          }}
          min={0.5}
          max={1}
          step={0.01}
          largeStep={0.05}
          formatOptions={{ style: 'percent', maximumFractionDigits: 1 }}
          incrementLabel={options.incrementLabel ?? 'Increase accuracy target'}
          decrementLabel={options.decrementLabel ?? 'Decrease accuracy target'}
        />
      </Field>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button
          type="submit"
          disabled={options.disabled}
        >
          Save target
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={options.disabled}
        >
          Restore target
        </Button>
      </div>
      <output
        aria-live="polite"
        dir="auto"
      >
        {feedback}
      </output>
    </form>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type NumberFieldTask = 'participants' | 'budget' | 'target'
export function NumberFieldExample({
  task = 'participants',
  ...options
}: NumberFieldTaskOptions & { task?: NumberFieldTask }) {
  return (
    <MotionProvider>
      {task === 'budget' ? (
        <CalculateSessionBudget {...options} />
      ) : task === 'target' ? (
        <ChooseAccuracyTarget {...options} />
      ) : (
        <PlanParticipantSessions {...options} />
      )}
    </MotionProvider>
  )
}
