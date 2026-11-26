'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Field,
  Input,
  type ControlSize
} from '@cognitap/radiant'
import { MotionProvider, useSpringLayout } from '@cognitap/radiant/motion/react'

import '@cognitap/radiant/styles.css'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export function FieldValidationExample({ controlSize = 'medium' }: { controlSize?: ControlSize }) {
  return (
    <MotionProvider>
      <FieldValidationForm controlSize={controlSize} />
    </MotionProvider>
  )
}

function FieldValidationForm({ controlSize }: { controlSize: ControlSize }) {
  const form = useRef<HTMLFormElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const addressInput = useRef<HTMLInputElement>(null)
  const firstChannel = useRef<HTMLInputElement>(null)
  // Only dedicated wrappers move. Field, its input and its live error remain native.
  useSpringLayout(form)
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('orbit-studio')
  const [channels, setChannels] = useState<string[]>([])
  const [touched, setTouched] = useState({ name: false, address: false, channels: false })
  const [feedback, setFeedback] = useState('')
  const nameError = name.trim().length < 2 ? 'Use at least two characters.' : ''
  const addressError =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(address) && address.length >= 3
      ? ''
      : 'Use 3 or more lowercase letters or numbers. Separate words with hyphens.'
  const channelError = channels.length === 0 ? 'Choose at least one channel.' : ''
  return (
    <Card style={{ minWidth: 0, maxWidth: '40rem' }}>
      <CardContent>
        <form
          ref={form}
          aria-label="Create a workspace"
          noValidate
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}
          onReset={() => {
            setName('')
            setAddress('orbit-studio')
            setChannels([])
            setTouched({ name: false, address: false, channels: false })
            setFeedback('')
          }}
          onSubmit={event => {
            event.preventDefault()
            setTouched({ name: true, address: true, channels: true })
            const invalid = nameError
              ? nameInput
              : addressError
                ? addressInput
                : channelError
                  ? firstChannel
                  : null
            if (invalid) {
              invalid.current?.focus()
              setFeedback('')
              return
            }
            setFeedback(`Created ${name.trim()}.`)
          }}
        >
          <div
            data-rad-layout-slot=""
            style={{ display: 'flow-root' }}
          >
            <div data-rad-layout-part="">
              <Field
                label="Workspace name"
                required
                error={touched.name ? nameError : undefined}
              >
                <Input
                  ref={nameInput}
                  name="workspace"
                  value={name}
                  controlSize={controlSize}
                  autoComplete="organization"
                  onChange={event => setName(event.target.value)}
                  onBlur={() => setTouched(state => ({ ...state, name: true }))}
                />
              </Field>
            </div>
          </div>
          <div
            data-rad-layout-slot=""
            style={{ display: 'flow-root' }}
          >
            <div data-rad-layout-part="">
              <Field
                label="Workspace address"
                required
                description="Use lowercase letters, numbers and hyphens."
                error={touched.address ? addressError : undefined}
              >
                <Input
                  ref={addressInput}
                  name="address"
                  value={address}
                  controlSize={controlSize}
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={event => setAddress(event.target.value)}
                  onBlur={() => setTouched(state => ({ ...state, address: true }))}
                />
              </Field>
            </div>
          </div>
          <div
            data-rad-layout-slot=""
            style={{ display: 'flow-root' }}
          >
            <div data-rad-layout-part="">
              <Field
                layout="group"
                label="Publishing channels"
                required
                description="Choose one or both."
                error={touched.channels ? channelError : undefined}
              >
                {['Email digest', 'Team feed'].map((label, index) => (
                  <Checkbox
                    key={label}
                    ref={index === 0 ? firstChannel : undefined}
                    label={label}
                    name="channels"
                    value={label}
                    controlSize={controlSize}
                    checked={channels.includes(label)}
                    onChange={event => {
                      setChannels(values =>
                        event.target.checked
                          ? [...values, label]
                          : values.filter(value => value !== label)
                      )
                      setTouched(state => ({ ...state, channels: true }))
                    }}
                  />
                ))}
              </Field>
            </div>
          </div>
          <div
            data-rad-layout-slot=""
            style={{ display: 'flow-root' }}
          >
            <div
              data-rad-layout-part=""
              style={{ display: 'grid', gap: '1rem' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                <Button
                  type="submit"
                  disabled={!ready}
                  style={{ minWidth: 0, maxWidth: '100%' }}
                >
                  Create workspace
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  tone="neutral"
                >
                  Reset draft
                </Button>
              </div>
              <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
