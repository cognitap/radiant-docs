'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Input,
  ThemeScope,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './foundation-example.css'

export function ThemeExample({ theme, mode }: { theme: Theme; mode: ThemeMode }) {
  const [saved, setSaved] = useState('Nothing saved yet.')
  const ready = useHydrated()
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="foundation-example"
    >
      <form
        className="foundation-stack"
        aria-label="Themed project"
        onSubmit={event => {
          event.preventDefault()
          const values = new FormData(event.currentTarget)
          setSaved(
            `Saved locally: ${values.get('project')}; updates ${values.has('updates') ? 'on' : 'off'}.`
          )
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle level={3}>Your next project</CardTitle>
            <CardDescription>One form, a different visual language.</CardDescription>
          </CardHeader>
          <CardContent className="foundation-stack">
            <Field label="Project name">
              <Input
                name="project"
                defaultValue="Spring garden"
                required
              />
            </Field>
            <Checkbox
              name="updates"
              defaultChecked
              label="Send project updates"
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={!ready}
            >
              Save project
            </Button>
            <Button
              type="reset"
              variant="outline"
              onClick={() => setSaved('Nothing saved yet.')}
            >
              Reset form
            </Button>
          </CardFooter>
        </Card>
        <output className="foundation-result">{saved}</output>
      </form>
    </ThemeScope>
  )
}
